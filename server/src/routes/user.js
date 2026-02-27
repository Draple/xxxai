import { Router } from 'express';
import { User } from '../models/User.js';
import { connectDB } from '../db/db.js';

export const userRouter = Router();

userRouter.get('/me', async (req, res) => {
  try {
    await connectDB();
    const u = await User.findById(req.user.id).select(
      'email onboarding_completed balance'
    );
    if (!u) return res.status(404).json({ error: 'No encontrado' });
    return res.json({
      id: u._id.toString(),
      email: u.email,
      onboarding_completed: u.onboarding_completed,
      balance: u.balance ?? 0,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Error al cargar usuario' });
  }
});

