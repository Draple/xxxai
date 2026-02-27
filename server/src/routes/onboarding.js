import { Router } from 'express';
import { User } from '../models/User.js';
import { connectDB } from '../db/db.js';

export const onboardingRouter = Router();

onboardingRouter.post('/age', async (req, res) => {
  try {
    await connectDB();
    const { confirmed } = req.body;
    if (confirmed !== true) return res.status(400).json({ error: 'Debe confirmar ser mayor de edad' });
    await User.findByIdAndUpdate(req.user.id, { is_adult_confirmed: true });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Error al guardar' });
  }
});

onboardingRouter.post('/use-type', async (req, res) => {
  try {
    await connectDB();
    const { useType, teamSize } = req.body;
    if (!['professional', 'personal'].includes(useType))
      return res.status(400).json({ error: 'useType debe ser professional o personal' });
    if (useType === 'professional' && (teamSize == null || teamSize < 1))
      return res.status(400).json({ error: 'teamSize requerido para uso profesional' });
    await User.findByIdAndUpdate(req.user.id, {
      use_type: useType,
      team_size: useType === 'professional' ? teamSize : null,
    });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Error al guardar' });
  }
});

onboardingRouter.post('/complete', async (req, res) => {
  try {
    await connectDB();
    await User.findByIdAndUpdate(req.user.id, { onboarding_completed: true });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Error al completar' });
  }
});
