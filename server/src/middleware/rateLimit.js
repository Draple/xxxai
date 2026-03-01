/**
 * Rate limit sencillo en memoria para evitar abuso de endpoints costosos.
 * Aplicado a POST /api/videos/generate (generación de vídeos por IA).
 */

const windowMs = 60 * 1000; // 1 minuto
const maxPerWindow = 10;    // máx 10 peticiones por IP por minuto
const store = new Map();    // ip -> { count, resetAt }

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

export function videoGenerateRateLimit(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();
  let entry = store.get(ip);

  if (!entry) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(ip, entry);
    return next();
  }

  if (now >= entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
    return next();
  }

  entry.count++;
  if (entry.count > maxPerWindow) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Espera un minuto e inténtalo de nuevo.' });
  }
  next();
}
