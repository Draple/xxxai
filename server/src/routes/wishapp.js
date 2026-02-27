import { Router } from 'express';
import { getBalance } from '../api/wishapp.js';
import { isWishAppConfigured } from '../config/apiKeys.js';

export const wishappRouter = Router();

/**
 * GET /api/wishapp/balance
 * Devuelve el balance en puntos de la API WishApp (token en config/apiKeys → WISHAPP_API_TOKEN).
 * Requiere autenticación con JWT de nuestra app.
 */
wishappRouter.get('/balance', async (req, res) => {
  if (!isWishAppConfigured()) {
    return res.status(503).json({ error: 'Servicio de balance no configurado. Añade WISHAPP_API_TOKEN en .env' });
  }
  try {
    const data = await getBalance();
    return res.json({
      balance: data.balance,
      available_balance: data.available_balance,
      points: data.points,
    });
  } catch (e) {
    if (e.status === 401) {
      return res.status(502).json({ error: 'Token de WishApp inválido. La generación de videos usa tu balance local.' });
    }
    if (e.status === 408 || e.status === 502) {
      return res.status(502).json({ error: 'WishApp no está disponible. Puedes seguir generando videos con tu balance local.' });
    }
    if (e.status) {
      return res.status(502).json({ error: 'Error al consultar balance externo. Usa tu balance local para generar videos.' });
    }
    return res.status(500).json({ error: e.message || 'Error interno' });
  }
});
