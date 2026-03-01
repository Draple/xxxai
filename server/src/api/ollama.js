/**
 * Cliente para Ollama (backend local con modelos GGUF).
 * API: http://localhost:11434/api/chat
 * Si OLLAMA_BASE_URL y OLLAMA_MODEL están configurados, el chat puede usar este proveedor primero.
 */

import { apiKeys } from '../config/apiKeys.js';

const DEFAULT_BASE_URL = 'http://localhost:11434';

function getConfig() {
  const baseUrl = (apiKeys.ollama?.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
  const model = apiKeys.ollama?.modelId || 'llama2';
  return { baseUrl, model };
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
 * Genera una respuesta de chat usando Ollama (local).
 * @param {{ role: 'user'|'assistant', content: string }[]} messages
 * @param {{ max_tokens?: number, temperature?: number }} options
 * @returns {Promise<string>}
 */
export async function chatCompletion(messages, options = {}) {
  const { baseUrl, model } = getConfig();
  const url = `${baseUrl}/api/chat`;
  const numPredict = options.max_new_tokens ?? options.max_tokens ?? 200;
  const temperature = options.temperature ?? 0.8;

  const body = {
    model,
    messages: toMessages(messages),
    stream: false,
    options: {
      num_predict: numPredict,
      temperature,
      num_ctx: 4096,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90000),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `Ollama API error: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const content = data?.message?.content;
  if (typeof content === 'string') return content.trim();
  throw new Error('Respuesta inesperada de Ollama');
}
