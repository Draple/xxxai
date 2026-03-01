/**
 * Test de la API WishApp (https://api.wishapp.online)
 * Uso: node scripts/test-wishapp-api.js [TOKEN]
 * Si no pasas TOKEN, usa WISHAPP_API_TOKEN del .env
 */

import 'dotenv/config';

const BASE = 'https://api.wishapp.online';
const token = process.argv[2] || process.env.WISHAPP_API_TOKEN;

function header() {
  return { Authorization: `Bearer ${token}` };
}

async function testBalance() {
  console.log('\n--- GET /v1/balance/ ---');
  const res = await fetch(`${BASE}/v1/balance/`, { method: 'GET', headers: header() });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, status: res.status, body: text.slice(0, 200) };
  }
  if (!res.ok) return { ok: false, status: res.status, data };
  return { ok: true, status: res.status, data };
}

async function main() {
  console.log('Test API WishApp');
  console.log('Base URL:', BASE);
  if (!token) {
    console.error('Error: pasa el token como argumento o define WISHAPP_API_TOKEN en .env');
    process.exit(1);
  }
  console.log('Token: ', token.slice(0, 12) + '...');

  const balance = await testBalance();
  if (balance.ok) {
    console.log('OK', balance.status);
    console.log('Balance:', balance.data.balance ?? balance.data.points);
    console.log('available_balance:', balance.data.available_balance);
    console.log('points:', balance.data.points);
  } else {
    console.log('FALLO', balance.status, balance.data || balance.body);
  }

  console.log('\n--- Fin test ---');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
