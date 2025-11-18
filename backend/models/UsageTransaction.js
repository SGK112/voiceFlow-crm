import mongoose from 'mongoose';

/**
 * UsageTransaction Model
 * Records every usage transaction (calls, SMS, MMS)
 */

const usageTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Transaction type
  type: {
    type: String,
    enum: ['voice', 'sms', 'mms', 'credit_purchase', 'credit_refund'],
    required: true
  },

  // For voice calls
  duration: {
    type: Number, // seconds
    default: 0
  },

  durationMinutes: {
    type: Number, // calculated minutes
    default: 0
  },

  // Amount charged
  amount: {
    type: Number,
    required: true,
    min: 0
  },

  // Balance before/after
  balanceBefore: {
    type: Number,
    required: true
  },

  balanceAfter: {
    type: Number,
    required: true
  },

  // Associated records
  callId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Call'
  },

  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },

  // Phone numbers involved
  from: String,
  to: String,

  // Shared pool number used
  poolNumber: String,

  // Status
  status: {
    type: String,
    enum: ['completed', 'failed', 'refunded'],
    default: 'completed'
  },

  // Twilio details
  twilioSid: String,
  twilioStatus: String,

  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Stripe payment (for credit purchases)
  stripePaymentIntentId: String,

  // Notes
  notes: String

}, {
  timestamps: true
});

// Indexes for reporting
usageTransactionSchema.index({ userId: 1, createdAt: -1 });
usageTransactionSchema.index({ userId: 1, type: 1, createdAt: -1 });
usageTransactionSchema.index({ callId: 1 });
usageTransactionSchema.index({ twilioSid: 1 });

// Static methods for analytics
usageTransactionSchema.statics.getUserUsageSummary = async function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: {
          $gte: startDate,
          $lte: endDate
        },
        type: { $in: ['voice', 'sms', 'mms'] }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalDuration: { $sum: '$duration' }
      }
    }
  ]);
};

const UsageTransaction = mongoose.model('UsageTransaction', usageTransactionSchema);

export default UsageTransaction;
