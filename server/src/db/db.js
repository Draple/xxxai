import dns from 'dns';
import mongoose from 'mongoose';

// Usar DNS público para que la resolución SRV de Atlas funcione (evita bloqueos del DNS local)
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('MONGODB_URI no definida. Crea un archivo .env con MONGODB_URI=mongodb://...');
}

const options = {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  maxPoolSize: 10,
};

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!MONGODB_URI) throw new Error('MONGODB_URI es obligatoria para conectar.');
  await mongoose.connect(MONGODB_URI, options);
  return mongoose.connection;
}

export { mongoose };
