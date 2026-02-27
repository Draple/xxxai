/**
 * Cliente para Hugging Face Inference (router API).
 * Nueva API: https://router.huggingface.co/v1/chat/completions (OpenAI-compatible).
 * Modelo por defecto: mlabonne/gemma-3-27b-it-abliterated
 * Usa el token configurado en config/apiKeys.js (HUGGINGFACE_API_TOKEN).
 */

import { apiKeys } from '../config/apiKeys.js';

const CHAT_URL = 'https://router.huggingface.co/v1/chat/completions';

function getToken() {
  const token = apiKeys.huggingface.token;
  if (!token) {
    throw new Error('HUGGINGFACE_API_TOKEN no configurado en .env');
  }
  return token;
}

const SYSTEM_PROMPT = `Eres un asistente útil y directo dentro de la app. Responde de forma concisa y al grano.
Evita frases genéricas como "¿En qué puedo ayudarte?", "¿Qué te gustaría saber?" o "Cuéntame más".
Responde directamente a lo que te pregunten. Si no sabes algo, dilo en una frase. Mantén un tono natural y cercano.`;

/**
 * Convierte mensajes User/Assistant al formato HF (role + content).
 * Añade un mensaje de sistema al inicio para respuestas más concretas.
 */
function toOpenAIMessages(messages) {
  const list = messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: (m.content || '').trim(),
  })).filter((m) => m.content.length > 0);
  return [{ role: 'system', content: SYSTEM_PROMPT }, ...list];
}

/**
 * Genera una respuesta de chat usando la API de Hugging Face (router).
 * @param {{ role: 'user'|'assistant', content: string }[]} messages
 * @param {{ max_new_tokens?: number, temperature?: number, top_p?: number }} options
 * @returns {Promise<string>}
 */
export async function chatCompletion(messages, options = {}) {
  const token = getToken();
  const modelId = apiKeys.huggingface.modelId;
  const body = {
    model: modelId,
    messages: toOpenAIMessages(messages),
    max_tokens: options.max_new_tokens ?? 384,
    temperature: options.temperature ?? 0.85,
    top_p: options.top_p ?? 0.92,
    stream: false,
  };

  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 503) {
    const err = new Error('Modelo cargando. Reintenta en unos segundos.');
    err.status = 503;
    throw err;
  }

  if (res.status === 401) {
    const err = new Error('Token de Hugging Face inválido');
    err.status = 401;
    throw err;
  }

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `HF API error: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content.trim();
  throw new Error('Respuesta inesperada de la API');
}
