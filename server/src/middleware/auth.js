import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { connectDB } from '../db/db.js';

export async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try {
    await connectDB();
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(payload.userId).select('_id email onboarding_completed');
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    req.user = { id: user._id.toString(), email: user.email, onboarding_completed: user.onboarding_completed };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
