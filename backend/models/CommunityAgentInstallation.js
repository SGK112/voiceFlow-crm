import mongoose from 'mongoose';

const communityAgentInstallationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityAgentTemplate',
    required: true,
    index: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VoiceAgent',
    required: true
  },

  // Installation configuration
  setupAnswers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  // Subscription status
  subscriptionStatus: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'trial'],
    default: 'active'
  },

  stripeSubscriptionId: String,
  stripePriceId: String,

  // Trial info
  trial: {
    isActive: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date
  },

  // Payment tracking
  billing: {
    lastPaymentDate: Date,
    nextPaymentDate: Date,
    totalPaid: {
      type: Number,
      default: 0
    },
    callsUsed: {
      type: Number,
      default: 0
    }
  },

  // Performance tracking
  performance: {
    totalCalls: {
      type: Number,
      default: 0
    },
    successfulCalls: {
      type: Number,
      default: 0
    },
    leadsGenerated: {
      type: Number,
      default: 0
    },
    averageCallDuration: {
      type: Number,
      default: 0
    }
  },

  // User feedback
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    text: String,
    createdAt: Date,
    isPublic: {
      type: Boolean,
      default: true
    }
  },

  installedAt: {
    type: Date,
    default: Date.now
  },
  uninstalledAt: Date,

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate installations
communityAgentInstallationSchema.index({ userId: 1, templateId: 1 }, { unique: true });

// Index for revenue reporting
communityAgentInstallationSchema.index({ templateId: 1, subscriptionStatus: 1 });

const CommunityAgentInstallation = mongoose.model('CommunityAgentInstallation', communityAgentInstallationSchema);

export default CommunityAgentInstallation;
