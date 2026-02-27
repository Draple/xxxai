import { Router } from 'express';
import Stripe from 'stripe';
import { User } from '../models/User.js';
import { Payment } from '../models/Payment.js';
import { connectDB } from '../db/db.js';

export const paymentsRouter = Router();

// No inicializar Stripe si la clave es un placeholder o inválida (evita "Invalid API Key")
const rawKey = process.env.STRIPE_SECRET_KEY || '';
const isPlaceholder = /^sk_(test|live)_xxx$/i.test(rawKey.trim()) || rawKey.length < 30;
const stripe = rawKey && !isPlaceholder ? new Stripe(rawKey) : null;

// Packs de créditos: id → { credits, bonus, amount (cents) }. Precios razonables: más créditos = mejor precio por crédito.
const CREDIT_PACKS = {
  starter: { credits: 10, bonus: 0, amount: 999 },       // $9.99  → 10 cr
  standard: { credits: 50, bonus: 5, amount: 2999 },    // $29.99 → 55 cr
  pro: { credits: 100, bonus: 15, amount: 5999 },        // $59.99 → 115 cr
  mega: { credits: 250, bonus: 40, amount: 9999 },       // $99.99 → 290 cr
};

paymentsRouter.get('/plans', (_, res) => {
  const packs = {};
  for (const [id, p] of Object.entries(CREDIT_PACKS)) {
    packs[id] = {
      price: p.amount / 100,
      currency: 'USD',
      credits: p.credits,
      bonus: p.bonus,
      totalCredits: p.credits + p.bonus,
    };
  }
  res.json(packs);
});

// Wallet BEP20 falsa solo para testing (formato válido 0x + 40 hex). No enviar fondos reales.
const EXAMPLE_BEP20 = '0xdEaD000000000000000000000000000000000000';

paymentsRouter.get('/crypto-wallets', (_, res) => {
  res.json({
    USDT_BEP20: process.env.USDT_BEP20_WALLET || EXAMPLE_BEP20,
    USDT_TRC20: process.env.USDT_TRC20_WALLET || 'T... (configurar en .env)',
  });
});

const DEFAULT_PACK = 'standard';

function getPackFromBody(body) {
  if (!body || typeof body !== 'object') return DEFAULT_PACK;
  const raw = body.pack ?? body.plan;
  const pack = typeof raw === 'string' ? raw.trim().toLowerCase() : null;
  if (pack && CREDIT_PACKS[pack]) return pack;
  return DEFAULT_PACK;
}

paymentsRouter.post('/create-intent', async (req, res) => {
  const pack = getPackFromBody(req.body);
  if (!stripe) return res.status(503).json({ error: 'Pagos con tarjeta no configurados. Usa modo demo.' });
  const p = CREDIT_PACKS[pack];
  try {
    await connectDB();
    let user = await User.findById(req.user.id).select('stripe_customer_id email');
    if (!user.stripe_customer_id) {
      const customer = await stripe.customers.create({ email: user.email });
      await User.findByIdAndUpdate(req.user.id, { stripe_customer_id: customer.id });
      user = { ...user.toObject(), stripe_customer_id: customer.id };
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: p.amount,
      currency: 'usd',
      customer: user.stripe_customer_id,
      metadata: { userId: req.user.id, pack },
    });
    return res.json({ clientSecret: paymentIntent.client_secret, pack });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Error al crear pago' });
  }
});

paymentsRouter.post('/confirm-card', async (req, res) => {
  const pack = getPackFromBody(req.body);
  const p = CREDIT_PACKS[pack];
  try {
    await connectDB();
    const totalCredits = p.credits + p.bonus;
    await Payment.create({
      user_id: req.user.id,
      amount: p.amount / 100,
      method: 'card',
      status: 'completed',
      credits_added: totalCredits,
      pack_id: pack,
    });
    await User.findByIdAndUpdate(req.user.id, { $inc: { balance: totalCredits } });
    return res.json({ ok: true, credits_added: totalCredits });
  } catch (e) {
    return res.status(500).json({ error: 'Error al confirmar pago' });
  }
});

paymentsRouter.post('/confirm-crypto', async (req, res) => {
  const pack = getPackFromBody(req.body);
  const p = CREDIT_PACKS[pack];
  const txHash = req.body?.txHash;
  try {
    await connectDB();
    const totalCredits = p.credits + p.bonus;
    await Payment.create({
      user_id: req.user.id,
      amount: p.amount / 100,
      method: 'crypto',
      crypto_tx_hash: txHash || 'pending',
      status: txHash ? 'completed' : 'pending',
      credits_added: totalCredits,
      pack_id: pack,
    });
    // Sin hash: en desarrollo añadimos créditos igual para poder probar; en producción quedan pendientes
    const isDev = process.env.NODE_ENV !== 'production';
    if (txHash || isDev) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { balance: totalCredits } });
    }
    return res.json({
      ok: true,
      credits_added: totalCredits,
      pending: !txHash && !isDev,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Error al confirmar pago cripto' });
  }
});

