/**
 * Comprueba si el DNS de MongoDB Atlas se resuelve.
 * Ejecutar: node server/src/db/test-dns.js
 */
import dns from 'dns';
import { promisify } from 'util';

// Probar primero con DNS de Google (por si tu DNS bloquea SRV)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const resolveSrv = promisify(dns.resolveSrv);
const host = 'iaxxx.a0fxwe9.mongodb.net';
const srvName = `_mongodb._tcp.${host}`;

console.log('Comprobando DNS para:', srvName);
console.log('(Usando DNS 8.8.8.8)');
console.log('');

resolveSrv(srvName)
  .then((addresses) => {
    console.log('✅ DNS SRV resuelto correctamente.');
    addresses.forEach((a, i) => console.log(`   ${i + 1}. ${a.name}:${a.port}`));
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ No se pudo resolver DNS:', err.message);
    console.log('');
    console.log('Esto puede significar:');
    console.log('  - Tu red o DNS no permite consultas SRV');
    console.log('  - El nombre del cluster en Atlas no es "iaxxx"');
    console.log('  - En Atlas: Database → Connect → copia de nuevo la URI');
    process.exit(1);
  });
