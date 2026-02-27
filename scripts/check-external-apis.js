/**
 * Comprueba que los tokens de WishApp y Hugging Face respondan bien.
 * Lee .env (WISHAPP_API_TOKEN, HUGGINGFACE_API_TOKEN).
 * Ejecutar: node scripts/check-external-apis.js
 */

import 'dotenv/config';

async function checkWishApp() {
  const token = process.env.WISHAPP_API_TOKEN;
  if (!token) {
    return { ok: false, message: 'WISHAPP_API_TOKEN no definido en .env' };
  }
  try {
    const res = await fetch('https://api.wishapp.online/v1/balance/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) return { ok: false, message: 'Token WishApp inválido o expirado' };
    if (!res.ok) return { ok: false, message: `WishApp API: ${res.status}` };
    const data = await res.json();
    return { ok: true, message: `Balance: ${data.points ?? data.balance} puntos` };
  } catch (e) {
    return { ok: false, message: e.message || 'Error de red' };
  }
}

async function checkHuggingFace() {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!token) {
    return { ok: false, message: 'HUGGINGFACE_API_TOKEN no definido en .env' };
  }
  const model = process.env.HF_CHAT_MODEL || 'meta-llama/Llama-3.2-3B-Instruct:fastest';
  try {
    const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Di hola en una palabra.' }],
        max_tokens: 20,
        stream: false,
      }),
    });
    if (res.status === 401) return { ok: false, message: 'Token Hugging Face inválido' };
    if (res.status === 503) return { ok: false, message: 'Modelo cargando (503). Reintenta en unos segundos.' };
    if (!res.ok) {
      const body = await res.text();
      const short = body.length > 80 ? body.slice(0, 80) + '...' : body;
      return { ok: false, message: `Hugging Face API: ${res.status} - ${short || res.statusText}` };
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    return { ok: true, message: text ? `Respuesta: "${String(text).slice(0, 50)}..."` : 'OK (sin texto)' };
  } catch (e) {
    return { ok: false, message: e.message || 'Error de red' };
  }
}

async function main() {
  console.log('\n--- APIs externas (tokens en .env) ---\n');
  const w = await checkWishApp();
  console.log(w.ok ? `  ✓ WishApp (balance): ${w.message}` : `  ✗ WishApp: ${w.message}`);
  const h = await checkHuggingFace();
  console.log(h.ok ? `  ✓ Hugging Face (chat): ${h.message}` : `  ✗ Hugging Face: ${h.message}`);
  console.log('');
  process.exit(w.ok && h.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
