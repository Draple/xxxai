import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    prompt: { type: String, required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    url: { type: String },
    reference_image_count: { type: Number, default: 0 },
    quality: { type: String, enum: ['720p', '1080p', '2k', '4k'], default: '1080p' },
  },
  { timestamps: true }
);

videoSchema.index({ user_id: 1, createdAt: -1 });

export const Video = mongoose.model('Video', videoSchema);
