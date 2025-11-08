import mongoose from 'mongoose';

const usageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  month: {
    type: String, // Format: "2025-01", "2025-02", etc.
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['trial', 'starter', 'professional', 'enterprise'],
    required: true
  },
  // Call usage
  minutesUsed: {
    type: Number,
    default: 0
  },
  minutesIncluded: {
    type: Number, // Plan allowance
    required: true
  },
  minutesOverage: {
    type: Number,
    default: 0
  },
  callCount: {
    type: Number,
    default: 0
  },
  // Agent usage
  agentsCreated: {
    type: Number,
    default: 0
  },
  agentsLimit: {
    type: Number,
    required: true
  },
  // Costs
  platformCost: {
    type: Number, // Total cost to you (ElevenLabs + Twilio)
    default: 0
  },
  overageCharge: {
    type: Number, // What customer pays for overages
    default: 0
  },
  totalRevenue: {
    type: Number, // Plan price + overage charges
    default: 0
  },
  // Breakdown
  costs: {
    elevenLabs: {
      type: Number,
      default: 0
    },
    twilio: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    }
  },
  // Billing
  billedAt: Date,
  stripeInvoiceId: String,

  // Legacy fields (for migration compatibility)
  leadsGenerated: {
    type: Number,
    default: 0
  },
  revenueAttributed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
usageSchema.index({ userId: 1, month: 1 }, { unique: true });

// Virtual for profit margin
usageSchema.virtual('profit').get(function() {
  return this.totalRevenue - this.platformCost;
});

// Virtual for profit margin percentage
usageSchema.virtual('profitMargin').get(function() {
  if (this.totalRevenue === 0) return 0;
  return ((this.totalRevenue - this.platformCost) / this.totalRevenue) * 100;
});

// Method to update usage after a call
usageSchema.methods.addCall = function(durationMinutes, cost) {
  this.callCount += 1;
  this.minutesUsed += durationMinutes;
  this.platformCost += cost.totalCost;

  // Calculate overage
  if (this.minutesUsed > this.minutesIncluded) {
    this.minutesOverage = this.minutesUsed - this.minutesIncluded;
    // Calculate overage charge
    this.overageCharge = Usage.calculateOverageCharge(this.plan, this.minutesOverage);
  }

  // Update costs breakdown
  this.costs.elevenLabs += cost.totalCost;

  return this.save();
};

// Static method to get or create usage for current month
usageSchema.statics.getOrCreateForUser = async function(userId, user) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let usage = await this.findOne({ userId, month });

  if (!usage) {
    // Get plan limits
    const planLimits = {
      trial: { minutes: 30, agents: 1 },
      starter: { minutes: 200, agents: 1 },
      professional: { minutes: 1000, agents: 5 },
      enterprise: { minutes: 5000, agents: Infinity }
    };

    const limits = planLimits[user.plan] || planLimits.starter;

    usage = await this.create({
      userId,
      month,
      plan: user.plan,
      minutesIncluded: limits.minutes,
      agentsLimit: limits.agents,
      totalRevenue: 0 // Will be set when billing runs
    });
  }

  return usage;
};

// Static method to calculate overage charges
usageSchema.statics.calculateOverageCharge = function(plan, overageMinutes) {
  const overageRates = {
    trial: 0, // No overages on trial
    starter: 0.60, // $0.60/min
    professional: 0.50, // $0.50/min
    enterprise: 0.40 // $0.40/min
  };

  const rate = overageRates[plan] || 0;
  return overageMinutes * rate;
};

// Static method to get plan limits
usageSchema.statics.getPlanLimits = function(plan) {
  const planLimits = {
    trial: {
      minutes: 30,
      agents: 1,
      price: 0,
      overageRate: 0
    },
    starter: {
      minutes: 200,
      agents: 1,
      price: 99,
      overageRate: 0.60
    },
    professional: {
      minutes: 1000,
      agents: 5,
      price: 299,
      overageRate: 0.50
    },
    enterprise: {
      minutes: 5000,
      agents: Infinity,
      price: 999,
      overageRate: 0.40
    }
  };

  return planLimits[plan] || planLimits.starter;
};

const Usage = mongoose.model('Usage', usageSchema);

export default Usage;
