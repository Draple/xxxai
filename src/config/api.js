/**
 * Base URL para las peticiones a la API.
 * Si VITE_API_URL está definida en .env (ej: http://localhost:4000), las peticiones
 * van directas al backend y no dependen del proxy de Vite.
 */
const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const API = base ? `${base}/api` : '/api';
