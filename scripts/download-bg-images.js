/**
 * Descarga fotos para adulto (románticas, sensuales) a public/images/background/
 * Ejecutar: node scripts/download-bg-images.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'background');

const PHOTOS = [
  { url: 'https://images.pexels.com/photos/8732125/pexels-photo-8732125.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '1.jpg' },
  { url: 'https://images.pexels.com/photos/4029989/pexels-photo-4029989.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '2.jpg' },
  { url: 'https://images.pexels.com/photos/4553619/pexels-photo-4553619.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '3.jpg' },
  { url: 'https://images.pexels.com/photos/6962530/pexels-photo-6962530.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '4.jpg' },
  { url: 'https://images.pexels.com/photos/8262600/pexels-photo-8262600.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '5.jpg' },
  { url: 'https://images.pexels.com/photos/7719318/pexels-photo-7719318.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '6.jpg' },
  { url: 'https://images.pexels.com/photos/3756168/pexels-photo-3756168.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '7.jpg' },
  { url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '8.jpg' },
  { url: 'https://images.pexels.com/photos/2657223/pexels-photo-2657223.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '9.jpg' },
  { url: 'https://images.pexels.com/photos/3585812/pexels-photo-3585812.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '10.jpg' },
  { url: 'https://images.pexels.com/photos/3201761/pexels-photo-3201761.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '11.jpg' },
  { url: 'https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '12.jpg' },
  { url: 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '13.jpg' },
  { url: 'https://images.pexels.com/photos/2748240/pexels-photo-2748240.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '14.jpg' },
  { url: 'https://images.pexels.com/photos/2697749/pexels-photo-2697749.jpeg?auto=compress&cs=tinysrgb&w=1200', file: '15.jpg' },
];

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VideoOnix/1.0)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const { url, file } of PHOTOS) {
    process.stdout.write(`Descargando ${file} ... `);
    try {
      const buf = await download(url);
      fs.writeFileSync(path.join(OUT_DIR, file), buf);
      console.log('OK');
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
  console.log('Listo. 15 fotos en public/images/background/');
}

main();
