import mongoose from 'mongoose';

const creditPurchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  packageName: {
    type: String,
    required: true
  },
  creditsAmount: {
    type: Number,
    required: true
  },
  priceUSD: {
    type: Number,
    required: true
  },
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  stripeChargeId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    default: 'card'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for queries
creditPurchaseSchema.index({ userId: 1, createdAt: -1 });
creditPurchaseSchema.index({ status: 1, createdAt: -1 });

const CreditPurchase = mongoose.model('CreditPurchase', creditPurchaseSchema);

export default CreditPurchase;
