/**
 * Comprueba que los tokens de WishApp y Hugging Face Router respondan bien.
 * Lee .env (WISHAPP_API_TOKEN, HF_TOKEN).
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

async function checkHFRouter() {
  const token = process.env.HF_TOKEN;
  if (!token) {
    return { ok: false, message: 'HF_TOKEN no definido en .env' };
  }
  const model = process.env.HF_CHAT_MODEL || 'zai-org/GLM-4.7-Flash:novita';
  try {
    const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 20,
        messages: [{ role: 'user', content: 'Di hola en una palabra.' }],
      }),
    });
    if (res.status === 401) return { ok: false, message: 'Token Hugging Face inválido' };
    if (!res.ok) {
      const body = await res.text();
      const short = body.length > 80 ? body.slice(0, 80) + '...' : body;
      return { ok: false, message: `HF Router API: ${res.status} - ${short || res.statusText}` };
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    return { ok: true, message: text ? `Respuesta: "${String(text).slice(0, 50)}..."` : 'OK (sin texto)' };
  } catch (e) {
    return { ok: false, message: e.message || 'Error de red' };
  }
}

function checkVideoGenerationReady() {
  const pub = process.env.PUBLIC_URL || '';
  try {
    const u = new URL(pub || 'http://localhost');
    if (/^localhost|127\.0\.0\.1$/i.test(u.hostname)) {
      return { ok: false, message: 'PUBLIC_URL es localhost: WishApp no puede descargar imágenes. Para generación real en local usa ngrok y pon PUBLIC_URL=https://tu-tunel.ngrok.io' };
    }
  } catch (_) {
    return { ok: false, message: 'PUBLIC_URL no definida o inválida' };
  }
  return { ok: true, message: `PUBLIC_URL accesible: ${pub}` };
}

async function main() {
  console.log('\n--- APIs externas (tokens en .env) ---\n');
  const w = await checkWishApp();
  console.log(w.ok ? `  ✓ WishApp (balance): ${w.message}` : `  ✗ WishApp: ${w.message}`);
  if (w.ok) {
    const v = checkVideoGenerationReady();
    console.log(v.ok ? `  ✓ Generación de vídeo: ${v.message}` : `  ⚠ Generación de vídeo: ${v.message}`);
  }
  const h = await checkHFRouter();
  console.log(h.ok ? `  ✓ HF Router (chat): ${h.message}` : `  ✗ HF Router: ${h.message}`);
  console.log('');
  process.exit(w.ok && h.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
