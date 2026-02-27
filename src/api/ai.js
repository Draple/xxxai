/**
 * Cliente para el chat con IA (backend -> Hugging Face Gemma).
 */

import { API } from '../config/api';

/**
 * Envía el historial de chat y obtiene la respuesta del modelo.
 * @param {string} token - JWT de la app
 * @param {{ role: 'user'|'assistant', content: string }[]} messages
 * @returns {Promise<{ reply: string }>}
 */
export async function sendChatMessage(token, messages) {
  const res = await fetch(`${API}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Error al obtener respuesta');
    err.status = res.status;
    err.serverMessage = data.error;
    throw err;
  }
  return data;
}
