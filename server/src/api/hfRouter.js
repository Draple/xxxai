/**
 * Cliente para Hugging Face Router API (OpenAI-compatible).
 * Base URL: https://router.huggingface.co/v1
 * Modelo por defecto: zai-org/GLM-4.7-Flash:novita
 * Usa HF_TOKEN en .env (apiKeys.hfRouter.token).
 */

import { apiKeys } from '../config/apiKeys.js';

const BASE_URL = 'https://router.huggingface.co/v1';
const CHAT_PATH = '/chat/completions';

function getConfig() {
  const token = apiKeys.hfRouter?.token;
  const model = apiKeys.hfRouter?.modelId || 'zai-org/GLM-4.7-Flash:novita';
  if (!token) throw new Error('HF_TOKEN no configurado en .env');
  return { token, model };
}

const SYSTEM_PROMPT = `Eres un interlocutor en una conversación normal de chat. Responde SIEMPRE solo en lenguaje natural, como en WhatsApp: frases claras y coherentes. NUNCA incluyas código, JSON, bloques técnicos, símbolos raros ni fragmentos de programación. Si no tienes claro qué decir, responde breve y en español normal. Conversa de forma cercana y natural.`;

function toMessages(messages) {
  const list = messages
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content ?? '').trim(),
    }))
    .filter((m) => m.content.length > 0);
  return [{ role: 'system', content: SYSTEM_PROMPT }, ...list];
}

/**
 * Genera una respuesta de chat usando el Router de Hugging Face (OpenAI-compatible).
 * @param {{ role: 'user'|'assistant', content: string }[]} messages
 * @param {{ max_tokens?: number, temperature?: number }} options
 * @returns {Promise<string>}
 */
export async function chatCompletion(messages, options = {}) {
  const { token, model } = getConfig();
  const url = `${BASE_URL}${CHAT_PATH}`;
  const body = {
    model,
    messages: toMessages(messages),
    max_tokens: options.max_new_tokens ?? options.max_tokens ?? 200,
    temperature: options.temperature ?? 0.8,
    stream: false,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
  });

  if (res.status === 401) {
    const err = new Error('Token de Hugging Face (HF_TOKEN) inválido');
    err.status = 401;
    throw err;
  }

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `HF Router API error: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content.trim();
  throw new Error('Respuesta inesperada de la API');
}
