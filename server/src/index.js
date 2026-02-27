import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db/db.js';
import { User } from './models/User.js';
import { Video } from './models/Video.js';
import { Payment } from './models/Payment.js';
import { authRouter } from './routes/auth.js';
import { onboardingRouter } from './routes/onboarding.js';
import { paymentsRouter } from './routes/payments.js';
import { videosRouter } from './routes/videos.js';
import { userRouter } from './routes/user.js';
import { wishappRouter } from './routes/wishapp.js';
import { aiRouter } from './routes/ai.js';
import { authMiddleware } from './middleware/auth.js';
import { isWishAppConfigured, isHuggingFaceConfigured } from './config/apiKeys.js';

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
].filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
app.use(express.json());

const UPLOADS_DIR = 'uploads';
app.use(`/${UPLOADS_DIR}`, express.static(UPLOADS_DIR));

app.use('/api/auth', authRouter);
app.use('/api/onboarding', authMiddleware, onboardingRouter);
app.use('/api/payments', authMiddleware, paymentsRouter);
app.use('/api/videos', authMiddleware, videosRouter);
app.use('/api/user', authMiddleware, userRouter);
app.use('/api/wishapp', authMiddleware, wishappRouter);
app.use('/api/ai', authMiddleware, aiRouter);

app.get('/api/health', (_, res) => res.json({ ok: true }));

async function initDB() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI no definida. Añádela a .env para persistir datos.');
    return;
  }
  try {
    await connectDB();
    console.log('MongoDB conectado');
    await User.syncIndexes();
    await Video.syncIndexes();
    await Payment.syncIndexes();
    console.log('Colecciones e índices listos.');
  } catch (e) {
    console.error('MongoDB:', e.message);
  }
}

initDB();

app.listen(PORT, () => {
  console.log(`XXXAI API en http://localhost:${PORT}`);
  if (isWishAppConfigured()) console.log('  WishApp (balance): configurado');
  else console.log('  WishApp (balance): no configurado → añade WISHAPP_API_TOKEN en .env');
  if (isHuggingFaceConfigured()) console.log('  Hugging Face (chat): configurado');
  else console.log('  Hugging Face (chat): no configurado → añade HUGGINGFACE_API_TOKEN en .env');
});
