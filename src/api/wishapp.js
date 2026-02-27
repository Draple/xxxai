/**
 * Cliente frontend para la API WishApp (a través de nuestro backend).
 * Base: /api (proxy a backend).
 */

import { API } from '../config/api';

/**
 * Obtiene el balance en puntos de WishApp.
 * @param {string} token - JWT de nuestra app (Authorization: Bearer)
 * @returns {{ balance: number, available_balance: number, points: string }}
 */
export async function getWishAppBalance(token) {
  const res = await fetch(`${API}/wishapp/balance`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Error al obtener balance');
    err.status = res.status;
    throw err;
  }
  return data;
}
