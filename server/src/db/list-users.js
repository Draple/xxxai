/**
 * Lista los usuarios en la base de datos.
 * Ejecutar: node server/src/db/list-users.js (desde la raíz del proyecto)
 */
import 'dotenv/config';
import { connectDB } from './db.js';
import { User } from '../models/User.js';

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no definida en .env');
    process.exit(1);
  }
  await connectDB();
  const users = await User.find({})
    .select('-password_hash')
    .sort({ createdAt: -1 })
    .lean();
  console.log('Total usuarios:', users.length);
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
