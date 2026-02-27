import 'dotenv/config';
import dns from 'dns';
import { connectDB } from './db.js';
import { User } from '../models/User.js';
import { Video } from '../models/Video.js';
import { Payment } from '../models/Payment.js';

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

async function init() {
  try {
    await connectDB();
    console.log('MongoDB conectado. Creando colecciones e índices...');

    try {
      await User.collection.dropIndex('email_1').catch(() => {});
      await User.collection.dropIndex('idx_user_provider_id').catch(() => {});
      await User.syncIndexes();
      console.log('  ✓ Colección "users" e índices listos.');
    } catch (e) {
      console.log('  ✓ Colección "users" (índices ya existían o actualizados).');
    }

    await Video.syncIndexes();
    console.log('  ✓ Colección "videos" e índices listos.');
    await Payment.syncIndexes();
    console.log('  ✓ Colección "payments" e índices listos.');

    console.log('Listo. Base de datos XXXAI preparada.');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

init();
