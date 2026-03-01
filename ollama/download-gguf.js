/**
 * Descarga un quant GGUF del repo DavidAU/GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX-GGUF
 * Uso: node download-gguf.js [QUANT]
 * Ejemplo: node download-gguf.js Q4_K_M
 * Quants: Q4_K_M (18.5GB), Q4_K_S (17.4GB), IQ4_NL (17.3GB), Q5_K_M (21.6GB), Q5_1 (22.9GB), Q8_0 (32.1GB), etc.
 */
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { stat } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = 'DavidAU/GLM-4.7-Flash-Uncensored-Heretic-NEO-CODE-Imatrix-MAX-GGUF';
const BASE = `https://huggingface.co/${REPO}/resolve/main`;

// Nombres reales en HF: GLM-4.7-Flash-Uncen-Hrt-NEO-CODE-MAX-imat-D_AU-{quant}.gguf
const quant = process.argv[2] || 'Q4_K_M';
const filename = `GLM-4.7-Flash-Uncen-Hrt-NEO-CODE-MAX-imat-D_AU-${quant}.gguf`;
const url = `${BASE}/${encodeURIComponent(filename)}`;

console.log('Descargando:', filename);
console.log('Desde:', url);

const token = process.env.HF_TOKEN;
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
if (token) headers['Authorization'] = `Bearer ${token}`;

try {
  const res = await fetch(url, { headers, redirect: 'follow' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const dest = join(__dirname, filename);
  const nodeStream = Readable.fromWeb(res.body);
  const fileStream = createWriteStream(dest);
  await pipeline(nodeStream, fileStream);
  const st = await stat(dest);
  console.log('OK:', dest, '\nTamaño:', (st.size / 1024 / 1024 / 1024).toFixed(2), 'GB');
  console.log('\nSiguiente: edita ollama/Modelfile y pon en FROM la ruta:', dest);
  console.log('Luego: ollama create glm-uncensored -f Modelfile');
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
