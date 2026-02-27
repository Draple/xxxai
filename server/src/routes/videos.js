import { Router } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Video } from '../models/Video.js';
import { User } from '../models/User.js';
import { connectDB } from '../db/db.js';
import { createUndressVideo } from '../api/wishapp.js';
import { isWishAppConfigured } from '../config/apiKeys.js';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`;

export const videosRouter = Router();

videosRouter.get('/', async (req, res) => {
  try {
    await connectDB();
    const list = await Video.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .select('_id prompt status url createdAt')
      .lean();
    return res.json(
      list.map((v) => ({
        id: v._id.toString(),
        prompt: v.prompt,
        status: v.status,
        url: v.url,
        created_at: v.createdAt,
      }))
    );
  } catch (e) {
    return res.status(500).json({ error: 'Error al listar videos' });
  }
});

const MAX_IMAGES = 5;
const MAX_IMAGE_BASE64_LENGTH = 3 * 1024 * 1024; // ~3MB en base64

const QUALITY_TO_SIZE = { '720p': [1280, 720], '1080p': [1920, 1080], '2k': [2560, 1440], '4k': [3840, 2160] };

// POST /api/videos/upload-image — sube imagen base64 y devuelve URL pública (para WishApp undress_video)
videosRouter.post('/upload-image', async (req, res) => {
  try {
    const { image: base64 } = req.body || {};
    if (!base64 || typeof base64 !== 'string' || base64.length > MAX_IMAGE_BASE64_LENGTH) {
      return res.status(400).json({ error: 'Imagen base64 inválida o demasiado grande' });
    }
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const ext = base64.includes('image/png') ? 'png' : 'jpg';
    const filename = `${req.user.id}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    const b64 = base64.includes(',') ? base64.split(',')[1] : base64;
    const buf = Buffer.from(b64, 'base64');
    fs.writeFileSync(filePath, buf);
    const url = `${PUBLIC_URL.replace(/\/$/, '')}/uploads/${filename}`;
    return res.json({ url });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Error al subir imagen' });
  }
});

// POST /api/videos/generate — si hay photo_url y WishApp configurado, llama a /v1/undress_video/
videosRouter.post('/generate', async (req, res) => {
  try {
    await connectDB();
    const { prompt, images: rawImages, quality: reqQuality, photo_url: photoUrl } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt requerido' });
    const allowedQuality = ['720p', '1080p', '2k', '4k'];
    const quality = allowedQuality.includes(reqQuality) ? reqQuality : '1080p';
    let user = await User.findById(req.user.id).select('balance').lean();
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    const currentBalance = user.balance ?? 0;
    if (currentBalance <= 0) {
      await User.findByIdAndUpdate(req.user.id, { $set: { balance: 5 } });
      user = await User.findById(req.user.id).select('balance').lean();
    }
    const balance = (user?.balance ?? 0);
    if (balance <= 0) return res.status(403).json({ error: 'Créditos insuficientes. Compra más créditos para generar videos.' });

    let images = [];
    if (Array.isArray(rawImages) && rawImages.length > 0) {
      images = rawImages
        .filter((img) => typeof img === 'string' && img.length > 0 && img.length <= MAX_IMAGE_BASE64_LENGTH)
        .slice(0, MAX_IMAGES);
    }

    const video = await Video.create({
      user_id: req.user.id,
      prompt: prompt.trim(),
      status: 'processing',
      reference_image_count: images.length,
      quality,
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { balance: -1 } });

    const useWishApp = photoUrl && typeof photoUrl === 'string' && photoUrl.trim() && isWishAppConfigured();
    if (useWishApp) {
      try {
        const [width, height] = QUALITY_TO_SIZE[quality] || [512, 680];
        const data = await createUndressVideo({
          photo_url: photoUrl.trim(),
          prompt: prompt.trim(),
          width,
          height,
          scene_id: 1,
        });
        const resultUrl = data?.url || data?.video_url || data?.output_url;
        if (resultUrl) {
          await Video.findByIdAndUpdate(video._id, { status: 'completed', url: resultUrl });
          return res.status(200).json({
            id: video._id.toString(),
            status: 'completed',
            url: resultUrl,
            message: 'Video generado',
          });
        }
        // Respuesta async (job_id): dejamos status processing
      } catch (wishErr) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { balance: 1 } });
        const msg = wishErr.message || 'Error al generar video con WishApp';
        return res.status(wishErr.status === 502 ? 502 : 400).json({ error: msg });
      }
    }

    setTimeout(async () => {
      try {
        await connectDB();
        const mockUrl = 'https://placehold.co/1280x720/1a1a2e/eee?text=Video+generado';
        await Video.findByIdAndUpdate(video._id, { status: 'completed', url: mockUrl });
      } catch (_) {}
    }, 3000);

    return res.status(202).json({
      id: video._id.toString(),
      status: 'processing',
      message: 'Generando video...',
    });
  } catch (e) {
    const msg = e.message || 'Error al generar';
    const safeMsg = /wishapp|WishApp/i.test(msg) ? 'Error al generar. Inténtalo de nuevo.' : msg;
    return res.status(500).json({ error: safeMsg });
  }
});

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const IMPROVE_PHRASES = {
  es: {
    atmosphere: [
      'Ambiente envolvente y atmósfera cuidada.',
      'Iluminación cinematográfica que realza cada detalle.',
      'Atmósfera íntima y sugerente.',
    ],
    quality: [
      'Alta definición, calidad cinematográfica.',
      'Composición visual cuidada, encuadre profesional.',
      'Movimiento de cámara fluido y natural.',
    ],
    style: [
      'Estética visual coherente y atractiva.',
      'Paleta de color armoniosa y luz natural o de estudio.',
    ],
  },
  en: {
    atmosphere: [
      'Immersive atmosphere and careful mood.',
      'Cinematic lighting that enhances every detail.',
      'Intimate and suggestive atmosphere.',
    ],
    quality: [
      'High definition, cinematic quality.',
      'Careful visual composition, professional framing.',
      'Smooth and natural camera movement.',
    ],
    style: [
      'Coherent and attractive visual aesthetic.',
      'Harmonious color palette and natural or studio lighting.',
    ],
  },
};

videosRouter.post('/improve-prompt', async (req, res) => {
  try {
    const { prompt, lang } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: 'Descripción requerida' });
    let text = prompt.trim();

    const phrases = IMPROVE_PHRASES[lang === 'en' ? 'en' : 'es'];
    const atmosphere = phrases.atmosphere;
    const quality = phrases.quality;
    const style = phrases.style;
    const allPhrases = [...atmosphere, ...quality, ...style];

    const normalize = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();

    // Quitar TODAS las ocurrencias de cada frase de mejora (evita repeticiones al pulsar varias veces)
    for (const phrase of allPhrases) {
      if (!phrase.trim()) continue;
      const re = new RegExp(escapeRegex(phrase), 'gi');
      text = text.replace(re, ' ').replace(/\s+/g, ' ').trim();
    }
    text = text.replace(/^\s*[.\s]+\s*|\s*[.\s]+\s*$/g, '').replace(/\s+/g, ' ').trim();

    const normalizedText = normalize(text);

    const pickNotInText = (arr) => {
      const available = arr.filter((p) => !normalizedText.includes(normalize(p)));
      const pool = available.length > 0 ? available : arr;
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const prefixPhrase = pickNotInText(atmosphere);
    const qualityPhrase = pickNotInText(quality);
    const suffixPhrase = pickNotInText(style);

    const prefix = `${prefixPhrase} ${qualityPhrase}`.trim();
    const suffix = suffixPhrase.trim();
    const improved = prefix ? `${prefix}. ${text}` : text;
    const improvedWithSuffix = suffix ? `${improved} ${suffix}` : improved;

    return res.json({ improvedPrompt: improvedWithSuffix.trim() });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Error al mejorar descripción' });
  }
});

videosRouter.get('/:id', async (req, res) => {
  try {
    await connectDB();
    const v = await Video.findOne({ _id: req.params.id, user_id: req.user.id }).lean();
    if (!v) return res.status(404).json({ error: 'No encontrado' });
    return res.json({
      id: v._id.toString(),
      prompt: v.prompt,
      status: v.status,
      url: v.url,
      created_at: v.createdAt,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Error al cargar video' });
  }
});

videosRouter.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }
    await connectDB();
    const deleted = await Video.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      user_id: new mongoose.Types.ObjectId(req.user.id),
    });
    if (!deleted) return res.status(404).json({ error: 'Video no encontrado' });
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Error al borrar video' });
  }
});
