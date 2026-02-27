import mongoose from 'mongoose';

// Colación insensible a mayúsculas (exportada para usarla en login)
export const EMAIL_COLLATION = { locale: 'en', strength: 2 };

const userSchema = new mongoose.Schema(
  {
    email: { type: String, trim: true, lowercase: true, required: false },
    password_hash: { type: String },
    provider: { type: String, enum: ['email', 'google', 'apple'], default: 'email' },
    provider_id: { type: String },
    onboarding_completed: { type: Boolean, default: false },
    is_adult_confirmed: { type: Boolean, default: false },
    use_type: { type: String, enum: ['professional', 'personal'] },
    team_size: { type: Number },
    subscription_plan: { type: String, enum: ['monthly', 'annual'] },
    subscription_status: { type: String, enum: ['active', 'cancelled', 'expired'], default: undefined },
    subscription_ends_at: { type: Date },
    stripe_customer_id: { type: String },
    balance: { type: Number, default: 0 },
    reset_token: { type: String },
    reset_token_expires: { type: Date },
  },
  { timestamps: true }
);

// Índice único por email: nombre explícito para evitar duplicados y colación case-insensitive
userSchema.index(
  { email: 1 },
  { unique: true, sparse: true, name: 'idx_user_email_unique', collation: EMAIL_COLLATION }
);
// Solo indexar usuarios OAuth (con provider_id no vacío). $ne no permitido en partial index; usamos $gt: ''.
userSchema.index(
  { provider: 1, provider_id: 1 },
  { unique: true, partialFilterExpression: { provider_id: { $exists: true, $gt: '' } }, name: 'idx_user_provider_id' }
);

// Para consultas por email usar esta colación
userSchema.statics.findByEmail = function (emailNorm) {
  return this.findOne({ email: emailNorm })
    .collation(EMAIL_COLLATION)
    .select('_id email')
    .lean();
};

export const User = mongoose.model('User', userSchema);
