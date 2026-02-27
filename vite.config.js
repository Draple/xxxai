import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import os from 'os';
import QRCode from 'qrcode';

// Redes virtuales (VirtualBox, VMware) no suelen ser accesibles desde el móvil por WiFi
const VIRTUAL_NET_PREFIXES = ['192.168.56.', '192.168.59.', '192.168.65.'];

function getLocalNetworkUrl(port) {
  const candidates = [];
  for (const interfaces of Object.values(os.networkInterfaces())) {
    for (const iface of interfaces || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const addr = iface.address;
        if (addr.startsWith('192.168.') || addr.startsWith('10.')) {
          const isVirtual = VIRTUAL_NET_PREFIXES.some((p) => addr.startsWith(p));
          candidates.push({ addr, isVirtual });
        }
      }
    }
  }
  // Priorizar IP de WiFi (no virtual); si no hay, usar la primera
  const wifi = candidates.find((c) => !c.isVirtual);
  const fallback = candidates[0];
  const chosen = wifi || fallback;
  return chosen ? `http://${chosen.addr}:${port}` : null;
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'show-qr-on-start',
      configureServer(server) {
        const port = server.config.server.port;
        const getUrl = () => {
          const preferred = getLocalNetworkUrl(port);
          if (preferred) return preferred;
          const fromVite = server.resolvedUrls?.network?.[0] || server.resolvedUrls?.local?.[0];
          return fromVite || `http://localhost:${port}`;
        };
        server.middlewares.use('/__network_url', (_, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ url: getUrl() }));
        });
        return () => {
          const url = getUrl();
          const show = (qr) => {
            console.log('\n📱 Escanea con el móvil (misma WiFi):\n');
            if (qr) console.log(qr);
            console.log(`   ${url}\n`);
          };
          QRCode.toString(url, { type: 'terminal', small: true }).then(show).catch(() => show(null));
        };
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true, // Permite acceder desde el móvil en la misma WiFi (http://TU_IP:5173)
    proxy: { '/api': { target: 'http://localhost:4000', changeOrigin: true } },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
