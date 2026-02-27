import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    method: { type: String, enum: ['card', 'crypto'] },
    stripe_payment_id: { type: String },
    crypto_tx_hash: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    credits_added: { type: Number },
    pack_id: { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ user_id: 1, createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);
