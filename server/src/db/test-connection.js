/**
 * Script para probar la conexión a MongoDB.
 * Ejecutar: node server/src/db/test-connection.js
 */
import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';

// Usar DNS público para resolución SRV de Atlas
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI no está definida en .env');
  process.exit(1);
}

// Ocultar contraseña en el log
const safeUri = uri.replace(/:([^@]+)@/, ':****@');
console.log('Conectando a:', safeUri);
console.log('');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 20000,
  connectTimeoutMS: 20000,
})
  .then(() => {
    console.log('✅ Conectado a MongoDB correctamente.');
    console.log('   Base de datos:', mongoose.connection.db?.databaseName || 'xxxai');
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('Conexión cerrada.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error al conectar:', err.message);
    console.log('');
    if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
      console.log('💡 Posibles soluciones:');
      console.log('   1. En MongoDB Atlas → Network Access → Add IP Address');
      console.log('      Añade tu IP o "Allow Access from Anywhere" (0.0.0.0/0)');
      console.log('   2. Comprueba que tu firewall o antivirus no bloquee Node.js');
      console.log('   3. Si estás en una red corporativa, puede que bloqueen MongoDB.');
    } else if (err.message.includes('auth') || err.message.includes('Authentication')) {
      console.log('💡 Revisa usuario y contraseña en MongoDB Atlas → Database Access');
    }
    process.exit(1);
  });
