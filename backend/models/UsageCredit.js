import mongoose from 'mongoose';

/**
 * UsageCredit Model
 * Tracks prepaid credits for shared number pool usage
 */

const usageCreditSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Credit balance
  balance: {
    type: Number,
    default: 0,
    min: 0
  },

  // Credit type
  type: {
    type: String,
    enum: ['voice', 'sms', 'mms', 'universal'], // universal can be used for any
    default: 'universal'
  },

  // Pricing (per unit)
  pricing: {
    voicePerMinute: { type: Number, default: 0.08 }, // $0.08/min
    smsPerMessage: { type: Number, default: 0.05 },  // $0.05/SMS
    mmsPerMessage: { type: Number, default: 0.10 }   // $0.10/MMS
  },

  // Usage statistics
  usage: {
    voiceMinutes: { type: Number, default: 0 },
    smsCount: { type: Number, default: 0 },
    mmsCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 }
  },

  // Auto-recharge settings
  autoRecharge: {
    enabled: { type: Boolean, default: false },
    threshold: { type: Number, default: 5 }, // Recharge when balance < $5
    amount: { type: Number, default: 20 }    // Recharge $20
  },

  // Expiration (optional - credits expire after X days)
  expiresAt: {
    type: Date,
    default: null // null = never expires
  },

  // Last transaction
  lastTransactionAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

// Index for quick lookups
usageCreditSchema.index({ userId: 1, type: 1 });

// Methods
usageCreditSchema.methods.deduct = async function(amount, usageType) {
  if (this.balance < amount) {
    throw new Error('Insufficient credits');
  }

  this.balance -= amount;
  this.lastTransactionAt = new Date();

  // Update usage stats
  if (usageType === 'voice') {
    this.usage.voiceMinutes += (amount / this.pricing.voicePerMinute);
  } else if (usageType === 'sms') {
    this.usage.smsCount += 1;
  } else if (usageType === 'mms') {
    this.usage.mmsCount += 1;
  }

  this.usage.totalSpent += amount;

  await this.save();
  return this.balance;
};

usageCreditSchema.methods.addCredits = async function(amount) {
  this.balance += amount;
  this.lastTransactionAt = new Date();
  await this.save();
  return this.balance;
};

usageCreditSchema.methods.shouldAutoRecharge = function() {
  return this.autoRecharge.enabled && this.balance < this.autoRecharge.threshold;
};

const UsageCredit = mongoose.model('UsageCredit', usageCreditSchema);

export default UsageCredit;
