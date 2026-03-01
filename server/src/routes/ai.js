import { Router } from 'express';
import { chatCompletion as ollamaChat } from '../api/ollama.js';
import { chatCompletion as hfRouterChat } from '../api/hfRouter.js';
import { isChatConfigured, isOllamaConfigured, isHFRouterConfigured } from '../config/apiKeys.js';
import { User } from '../models/User.js';
import { connectDB } from '../db/db.js';

export const aiRouter = Router();

const MAX_HISTORY = 8;
const MAX_MESSAGE_LENGTH = 2000;
const CREDITS_PER_CHAT = 1;

const CHAT_OPTS = { max_new_tokens: 280, temperature: 0.75 };

/**
 * POST /api/ai/chat
 * Body: { messages: { role: 'user'|'assistant', content: string }[] }
 * Devuelve: { reply: string }
 * Prioridad: 1) Ollama (local, GGUF) si OLLAMA_BASE_URL + OLLAMA_MODEL; 2) Hugging Face Router.
 */
aiRouter.post('/chat', async (req, res) => {
  if (!isChatConfigured()) {
    return res.status(503).json({ error: 'Servicio de chat no configurado. Añade HF_TOKEN o OLLAMA_MODEL en .env' });
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

    let reply = '';
    let lastError = '';
    if (isOllamaConfigured()) {
      try {
        reply = await ollamaChat(safe, CHAT_OPTS);
      } catch (e) {
        lastError = `Ollama: ${e.message}`;
        console.warn('[AI chat] Ollama no disponible, usando HF Router:', e.message);
      }
    }
    if (!reply && isHFRouterConfigured()) {
      try {
        reply = await hfRouterChat(safe, CHAT_OPTS);
      } catch (e) {
        lastError = lastError ? `${lastError}; HF: ${e.message}` : `HF: ${e.message}`;
        console.warn('[AI chat] HF Router falló:', e.message);
      }
    }
    if (!reply) {
      const msg = lastError
        ? `Ningún proveedor de chat disponible. ${lastError}`
        : 'Ningún proveedor de chat disponible. Comprueba Ollama (local) o HF_TOKEN en .env.';
      return res.status(503).json({ error: msg });
    }

    await User.findByIdAndUpdate(req.user.id, { $inc: { balance: -CREDITS_PER_CHAT } });

    return res.json({ reply: reply || '' });
  } catch (e) {
    if (e.status === 503) return res.status(503).json({ error: e.message });
    if (e.status === 401) return res.status(502).json({ error: 'Servicio de IA no disponible' });
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

/**
 * POST /api/ai/feed-post
 * Body: { authorName: string, lang?: string }
 * Devuelve: { content: string } — texto corto para un post del Feed, generado por el modelo (HF Router).
 */
aiRouter.post('/feed-post', async (req, res) => {
  if (!isChatConfigured()) {
    return res.status(503).json({ error: 'Servicio de IA no configurado. Añade HF_TOKEN en .env' });
  }
  try {
    const authorName = (req.body?.authorName || '').trim() || 'Luna';
    const lang = (req.body?.lang || 'es').toLowerCase().slice(0, 2);
    const isSpanish = lang === 'es';

    const userPrompt = isSpanish
      ? `Eres ${authorName}, una IA con personalidad que publica en un feed tipo red social dentro de una app de generación de video con IA. Escribe una única publicación corta (1 o 2 frases) dando un consejo, tip o comentario amigable sobre la app. Sé directa y natural. Responde SOLO con el texto del post, sin comillas ni prefijos.`
      : `You are ${authorName}, an AI with personality posting on a social-style feed inside a video-generation app. Write a single short post (1 or 2 sentences) giving a tip or friendly comment about the app. Be direct and natural. Reply with ONLY the post text, no quotes or prefixes.`;

    const reply = await chatCompletion(
      [{ role: 'user', content: userPrompt }],
      { max_new_tokens: 120, temperature: 0.9 }
    );

    const content = (reply || '').trim().slice(0, 280);
    return res.json({ content: content || (isSpanish ? 'Novedades pronto.' : 'Updates soon.') });
  } catch (e) {
    if (e.status === 503) return res.status(503).json({ error: e.message });
    console.error('[AI feed-post]', e.message);
    return res.status(500).json({ error: e.message || 'Error al generar el post' });
  }
});
