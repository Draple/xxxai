/**
 * Comprueba que las rutas de la API respondan correctamente.
 * Ejecutar con: node scripts/check-api.js
 * Requiere que el backend esté corriendo en http://localhost:4000
 *
 * Para probar WishApp y Hugging Face con JWT, añade en .env (opcional):
 *   CHECK_API_LOGIN=1
 *   TEST_EMAIL=tu@email.com
 *   TEST_PASSWORD=tupassword
 */

import 'dotenv/config';

const BASE = 'http://localhost:4000';

async function request(method, path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...(options.body && { body: JSON.stringify(options.body) }),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

async function main() {
  const checks = [];
  let ok = true;

  // 1. Health (público)
  const health = await request('GET', '/api/health');
  const healthOk = health.status === 200 && health.data?.ok === true;
  checks.push({ name: 'GET /api/health', status: health.status, ok: healthOk });
  if (!healthOk) ok = false;

  // 2. Rutas protegidas sin token -> 401
  const noAuth = await request('GET', '/api/user/me', {
    headers: { Authorization: 'Bearer invalid' },
  });
  const noAuthOk = noAuth.status === 401;
  checks.push({ name: 'GET /api/user/me (sin token)', status: noAuth.status, ok: noAuthOk });
  if (!noAuthOk) ok = false;

  const wishappNoAuth = await request('GET', '/api/wishapp/balance', {
    headers: { Authorization: 'Bearer invalid' },
  });
  checks.push({
    name: 'GET /api/wishapp/balance (sin token)',
    status: wishappNoAuth.status,
    ok: wishappNoAuth.status === 401,
  });
  if (wishappNoAuth.status !== 401) ok = false;

  const aiNoAuth = await request('POST', '/api/ai/chat', {
    body: { messages: [{ role: 'user', content: 'Hola' }] },
    headers: { Authorization: 'Bearer invalid' },
  });
  checks.push({
    name: 'POST /api/ai/chat (sin token)',
    status: aiNoAuth.status,
    ok: aiNoAuth.status === 401,
  });
  if (aiNoAuth.status !== 401) ok = false;

  // 3. POST /api/ai/chat con body inválido
  const aiBadBody = await request('POST', '/api/ai/chat', {
    body: {},
    headers: { Authorization: 'Bearer invalid' },
  });
  checks.push({
    name: 'POST /api/ai/chat body vacío (sin token)',
    status: aiBadBody.status,
    ok: aiBadBody.status === 401,
  });
  if (aiBadBody.status !== 401) ok = false;

  // 4. Con login: probar WishApp balance y AI chat
  const doLoginCheck = process.env.CHECK_API_LOGIN === '1' && process.env.TEST_EMAIL && process.env.TEST_PASSWORD;
  if (doLoginCheck) {
    const loginRes = await request('POST', '/api/auth/login', {
      body: { email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD },
    });
    if (loginRes.status === 200 && loginRes.data?.token) {
      const jwt = loginRes.data.token;
      const wishappRes = await request('GET', '/api/wishapp/balance', {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const wishappOk = wishappRes.status === 200 && typeof wishappRes.data?.balance === 'number';
      checks.push({
        name: 'GET /api/wishapp/balance (con JWT)',
        status: wishappRes.status,
        ok: wishappOk,
      });
      if (!wishappOk) ok = false;

      const aiRes = await request('POST', '/api/ai/chat', {
        body: { messages: [{ role: 'user', content: 'Di hola en una palabra.' }] },
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const aiOk = aiRes.status === 200 && typeof aiRes.data?.reply === 'string';
      checks.push({
        name: 'POST /api/ai/chat (con JWT)',
        status: aiRes.status,
        ok: aiOk,
      });
      if (!aiOk) ok = false;
    } else {
      checks.push({ name: 'Login (TEST_EMAIL/TEST_PASSWORD)', status: loginRes.status, ok: false });
      ok = false;
    }
  }

  console.log('\n--- Comprobación API ---\n');
  checks.forEach((c) => {
    const icon = c.ok ? '✓' : '✗';
    console.log(`  ${icon} ${c.name} → ${c.status}`);
  });
  console.log(ok ? '\n  Todas las comprobaciones pasaron.\n' : '\n  Algunas comprobaciones fallaron.\n');
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error('Error:', err.message);
  if (err.cause?.code === 'ECONNREFUSED') {
    console.error('  ¿Está el backend corriendo en', BASE, '?');
  }
  process.exit(1);
});
