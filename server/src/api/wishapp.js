/**
 * Cliente para la API WishApp (https://api.wishapp.online)
 * Documentación: https://api.wishapp.online/en/docs
 * Usa el token configurado en config/apiKeys.js (WISHAPP_API_TOKEN).
 * La generación de videos NO depende de WishApp; usa el balance de User (MongoDB).
 */

import { apiKeys } from '../config/apiKeys.js';

const WISHAPP_TIMEOUT_MS = 15_000;

function getHeaders() {
  const token = apiKeys.wishapp.token;
  if (!token) {
    throw new Error('WISHAPP_API_TOKEN no configurado en .env');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Obtiene el balance en puntos del usuario asociado al token.
 * GET /v1/balance/
 * @returns {{ balance: number, available_balance: number, points: string }}
 */
export async function getBalance() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WISHAPP_TIMEOUT_MS);

  try {
    const res = await fetch(`${apiKeys.wishapp.baseUrl}/v1/balance/`, {
      method: 'GET',
      headers: getHeaders(),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status === 401) {
      const err = new Error('Token WishApp inválido o no autorizado');
      err.status = 401;
      throw err;
    }

    if (!res.ok) {
      const err = new Error(`WishApp API error: ${res.status}`);
      err.status = res.status;
      throw err;
    }

    return res.json();
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      const err = new Error('WishApp no respondió a tiempo');
      err.status = 408;
      throw err;
    }
    if (e.cause?.code === 'ECONNREFUSED' || e.cause?.code === 'ENOTFOUND' || e.cause?.code === 'ETIMEDOUT') {
      const err = new Error('No se pudo conectar con WishApp');
      err.status = 502;
      throw err;
    }
    throw e;
  }
}

const UNDRESS_VIDEO_TIMEOUT_MS = 90_000;

/**
 * Crea un video undress en WishApp.
 * POST /v1/undress_video/
 * Body: { photo_url, prompt, width?, height?, scene_id? }
 * @param {{ photo_url: string, prompt: string, width?: number, height?: number, scene_id?: number }} params
 * @returns {Promise<{ url?: string, job_id?: string, status?: string }>}
 */
export async function createUndressVideo(params) {
  const { photo_url, prompt, width = 512, height = 680, scene_id = 1 } = params;
  if (!photo_url || typeof photo_url !== 'string' || !prompt?.trim()) {
    throw new Error('photo_url y prompt son obligatorios');
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UNDRESS_VIDEO_TIMEOUT_MS);

  try {
    const res = await fetch(`${apiKeys.wishapp.baseUrl}/v1/undress_video/`, {
      method: 'POST',
      headers: getHeaders(),
      signal: controller.signal,
      body: JSON.stringify({
        photo_url: photo_url.trim(),
        prompt: prompt.trim(),
        width: Number(width) || 512,
        height: Number(height) || 680,
        scene_id: Number(scene_id) || 1,
      }),
    });
    clearTimeout(timeoutId);

    if (res.status === 401) {
      const err = new Error('Token WishApp inválido o no autorizado');
      err.status = 401;
      throw err;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.detail || data.message || `WishApp undress_video: ${res.status}`);
      err.status = res.status;
      throw err;
    }

    return data;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      const err = new Error('WishApp undress video no respondió a tiempo');
      err.status = 408;
      throw err;
    }
    if (e.cause?.code === 'ECONNREFUSED' || e.cause?.code === 'ENOTFOUND' || e.cause?.code === 'ETIMEDOUT') {
      const err = new Error('No se pudo conectar con WishApp');
      err.status = 502;
      throw err;
    }
    throw e;
  }
}
