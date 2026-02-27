/**
 * Arregla la base de datos para el registro de usuarios:
 * 1. Elimina el índice antiguo "email_1" si existe (evita conflicto).
 * 2. Normaliza todos los emails a minúsculas y elimina duplicados (deja uno por email).
 * 3. Sincroniza los índices del modelo User (crea idx_user_email_unique con colación).
 *
 * Ejecutar una vez: node server/src/db/fix-db-registration.js
 * (desde la raíz del proyecto, con .env cargado)
 */
import 'dotenv/config';
import { connectDB } from './db.js';
import { User } from '../models/User.js';

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no definida en .env');
    process.exit(1);
  }
  console.log('Conectando a MongoDB...');
  await connectDB();
  const col = User.collection;

  // 1. Eliminar índice antiguo "email_1" si existe
  try {
    const indexes = await col.indexes();
    const hasOld = indexes.some((idx) => idx.name === 'email_1');
    if (hasOld) {
      await col.dropIndex('email_1');
      console.log('Índice antiguo email_1 eliminado.');
    } else {
      console.log('No había índice email_1.');
    }
  } catch (e) {
    if (e.code === 27 || e.codeName === 'IndexNotFound') console.log('Índice email_1 no existía.');
    else console.warn('Al eliminar índice:', e.message);
  }

  // 2. Normalizar emails y resolver duplicados
  const users = await User.find({ email: { $exists: true, $ne: '' } }).select('_id email').lean();
  const byLower = new Map();
  for (const u of users) {
    const norm = (u.email || '').trim().toLowerCase();
    if (!norm) continue;
    if (!byLower.has(norm)) byLower.set(norm, []);
    byLower.get(norm).push(u._id);
  }
  let duplicatesRemoved = 0;
  for (const [emailNorm, ids] of byLower) {
    if (ids.length <= 1) continue;
    const [keep, ...remove] = ids;
    await User.deleteMany({ _id: { $in: remove } });
    duplicatesRemoved += remove.length;
  }
  if (duplicatesRemoved > 0) console.log('Duplicados por email eliminados:', duplicatesRemoved);

  for (const u of users) {
    const norm = (u.email || '').trim().toLowerCase();
    if (!norm || u.email === norm) continue;
    await User.updateOne({ _id: u._id }, { $set: { email: norm } });
  }
  console.log('Emails normalizados a minúsculas.');

  // 3. Sincronizar índices del modelo User
  await User.syncIndexes();
  console.log('Índices de User sincronizados (idx_user_email_unique con colación).');
  console.log('Listo. Puedes reiniciar la API.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
