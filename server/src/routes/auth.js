import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, EMAIL_COLLATION } from '../models/User.js';
import { connectDB } from '../db/db.js';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

authRouter.post('/register', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
    const emailNorm = normalizeEmail(email);
    if (!emailNorm) return res.status(400).json({ error: 'Email no válido' });
    if (!isValidEmail(emailNorm)) return res.status(400).json({ error: 'Formato de email no válido' });
    if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    // No hacemos comprobación previa: intentamos crear y solo 409 si MongoDB devuelve duplicado (11000)
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: emailNorm,
      password_hash,
      provider: 'email',
      balance: 5,
    });
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      token,
      user: { id: user._id.toString(), email: user.email, onboarding_completed: false },
    });
  } catch (e) {
    if (e.code === 11000) {
      const emailNorm = normalizeEmail(req.body?.email);
      if (emailNorm) {
        const existing = await User.findOne({ email: emailNorm })
          .collation(EMAIL_COLLATION)
          .select('_id email provider')
          .lean()
          .catch(() => null);
        if (existing) {
          const msg = existing.provider && existing.provider !== 'email'
            ? 'Este correo ya está registrado con Google o Apple. Inicia sesión con ese método.'
            : 'Email ya registrado';
          return res.status(409).json({ error: msg });
        }
      }
      return res.status(409).json({ error: 'Email ya registrado' });
    }
    return res.status(500).json({ error: e.message || 'Error al registrar' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
    const emailNorm = normalizeEmail(email);
    const user = await User.findOne({ email: emailNorm })
      .collation(EMAIL_COLLATION)
      .select('_id email password_hash provider onboarding_completed balance');
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Esta cuenta se creó con Google o Apple. Inicia sesión con ese método.' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        onboarding_completed: user.onboarding_completed,
        balance: user.balance ?? 0,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

authRouter.post('/oauth', async (req, res) => {
  try {
    await connectDB();
    const { provider, providerId, email } = req.body;
    if (!provider || !providerId || !email)
      return res.status(400).json({ error: 'provider, providerId y email requeridos' });
    let user = await User.findOne({ provider, provider_id: providerId }).select('_id email onboarding_completed balance');
    if (!user) {
      user = await User.create({
        email: normalizeEmail(email),
        provider: provider.toLowerCase(),
        provider_id: providerId,
        balance: 5,
      });
    }
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        onboarding_completed: user.onboarding_completed ?? false,
        balance: user.balance ?? 0,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: 'Error OAuth' });
  }
});

// Comprobar si un email existe (solo desarrollo, para depuración)
authRouter.get('/dev/check-email', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'No disponible' });
  try {
    await connectDB();
    const email = normalizeEmail(req.query.email);
    if (!email) return res.status(400).json({ error: 'Query email requerido' });
    const user = await User.findOne({ email }).collation(EMAIL_COLLATION).select('_id email provider').lean();
    return res.json({ exists: !!user, email: user?.email, provider: user?.provider });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

authRouter.post('/forgot-password', async (req, res) => {
  try {
    await connectDB();
    const { email } = req.body;
    const emailNorm = normalizeEmail(email);
    if (!emailNorm || !isValidEmail(emailNorm)) {
      return res.json({ ok: true });
    }
    const user = await User.findOne({ email: emailNorm })
      .collation(EMAIL_COLLATION)
      .select('_id provider password_hash');
    if (!user || user.provider !== 'email' || !user.password_hash) {
      return res.json({ ok: true });
    }
    const reset_token = jwt.sign(
      { userId: user._id.toString(), purpose: 'reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    await User.updateOne(
      { _id: user._id },
      { reset_token, reset_token_expires: new Date(Date.now() + 60 * 60 * 1000) }
    );
    if (process.env.NODE_ENV !== 'production') {
      return res.json({ ok: true, resetToken: reset_token });
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Error al solicitar restablecimiento' });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  try {
    await connectDB();
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token y nueva contraseña requeridos' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (_) {
      return res.status(400).json({ error: 'Enlace expirado o no válido. Solicita uno nuevo.' });
    }
    if (payload.purpose !== 'reset') return res.status(400).json({ error: 'Token no válido' });
    const user = await User.findOne({
      _id: payload.userId,
      reset_token: token,
      reset_token_expires: { $gt: new Date() },
    }).select('_id');
    if (!user) return res.status(400).json({ error: 'Enlace expirado o no válido. Solicita uno nuevo.' });
    const password_hash = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { _id: user._id },
      { $set: { password_hash }, $unset: { reset_token: 1, reset_token_expires: 1 } }
    );
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Error al restablecer contraseña' });
  }
});

// Borrar usuario por email (en producción devuelve 403)
authRouter.delete('/dev/delete-user', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'No disponible en producción' });
  }
  try {
    await connectDB();
    const email = normalizeEmail(req.query.email || req.body?.email);
    if (!email) return res.status(400).json({ error: 'Query email requerido' });
    const user = await User.findOne({ email }).collation(EMAIL_COLLATION).select('_id').lean();
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado con ese email' });
    await User.deleteOne({ _id: user._id });
    return res.json({ ok: true, message: 'Usuario eliminado. Ya puedes registrarte de nuevo con ese email.' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Error' });
  }
});
