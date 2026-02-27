import { Router } from 'express';
import { chatCompletion } from '../api/huggingface.js';
import { isHuggingFaceConfigured } from '../config/apiKeys.js';
import { User } from '../models/User.js';
import { connectDB } from '../db/db.js';

export const aiRouter = Router();

const MAX_HISTORY = 10;
const MAX_MESSAGE_LENGTH = 4000;
const CREDITS_PER_CHAT = 1;

/**
 * POST /api/ai/chat
 * Body: { messages: { role: 'user'|'assistant', content: string }[] }
 * Devuelve: { reply: string }
 * Consume créditos del balance del usuario (1 por mensaje).
 */
aiRouter.post('/chat', async (req, res) => {
  if (!isHuggingFaceConfigured()) {
    return res.status(503).json({ error: 'Servicio de chat no configurado. Añade HUGGINGFACE_API_TOKEN en .env' });
  }
  try {
    await connectDB();
    let user = await User.findById(req.user.id).select('balance').lean();
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    if ((user.balance ?? 0) <= 0) {
      await User.findByIdAndUpdate(req.user.id, { $set: { balance: 5 } });
      user = await User.findById(req.user.id).select('balance').lean();
    }
    if ((user?.balance ?? 0) < CREDITS_PER_CHAT) {
      return res.status(403).json({ error: 'Créditos insuficientes. Compra más créditos para usar el chat.' });
    }

    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages es obligatorio y debe ser un array no vacío' });
    }

    const last = messages[messages.length - 1];
    if (last?.role !== 'user') {
      return res.status(400).json({ error: 'El último mensaje debe ser del usuario' });
    }

    const safe = messages.slice(-MAX_HISTORY).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content ?? '').slice(0, MAX_MESSAGE_LENGTH),
    }));

    const reply = await chatCompletion(safe, {
      max_new_tokens: 384,
      temperature: 0.85,
      top_p: 0.92,
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { balance: -CREDITS_PER_CHAT } });

    return res.json({ reply: reply || '' });
  } catch (e) {
    if (e.status === 503) {
      return res.status(503).json({ error: e.message });
    }
    if (e.status === 401) {
      return res.status(502).json({ error: 'Servicio de IA no disponible' });
    }
    console.error('[AI chat]', e.message);
    return res.status(500).json({ error: e.message || 'Error al generar respuesta' });
  }
});

const CREDITS_PER_CREATE_AI = 1;

/**
 * POST /api/ai/create
 * Consume créditos del usuario para crear una IA (1 crédito).
 * El frontend debe llamar a esta ruta antes de guardar la IA en localStorage.
 */
aiRouter.post('/create', async (req, res) => {
  try {
    await connectDB();
    let user = await User.findById(req.user.id).select('balance').lean();
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    if ((user.balance ?? 0) <= 0) {
      await User.findByIdAndUpdate(req.user.id, { $set: { balance: 5 } });
      user = await User.findById(req.user.id).select('balance').lean();
    }
    if ((user?.balance ?? 0) < CREDITS_PER_CREATE_AI) {
      return res.status(403).json({ error: 'Créditos insuficientes. Compra más créditos para crear IAs.' });
    }
    await User.findByIdAndUpdate(req.user.id, { $inc: { balance: -CREDITS_PER_CREATE_AI } });
    return res.json({ ok: true });
  } catch (e) {
    console.error('[AI create]', e.message);
    return res.status(500).json({ error: e.message || 'Error al consumir créditos' });
  }
});
