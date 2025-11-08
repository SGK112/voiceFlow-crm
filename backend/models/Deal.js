import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true
  },
  value: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD']
  },
  stage: {
    type: String,
    required: true,
    enum: ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
    default: 'lead',
    index: true
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  expectedCloseDate: {
    type: Date,
    index: true
  },
  actualCloseDate: Date,
  source: {
    type: String,
    enum: ['website', 'referral', 'cold_call', 'voice_campaign', 'email', 'social', 'other'],
    default: 'other'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: String,
  lostReason: String,
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  relatedCalls: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CallLog'
  }],
  relatedCampaigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }],
  triggeredWorkflows: [{
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'N8nWorkflow'
    },
    triggeredAt: Date,
    event: String,
    response: mongoose.Schema.Types.Mixed
  }],
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

dealSchema.index({ user: 1, stage: 1 });
dealSchema.index({ user: 1, expectedCloseDate: 1 });
dealSchema.index({ assignedTo: 1, stage: 1 });
dealSchema.index({ createdAt: -1 });

dealSchema.virtual('weightedValue').get(function() {
  return this.value * (this.probability / 100);
});

dealSchema.pre('save', function(next) {
  if (this.isModified('stage')) {
    const stageProbabilities = {
      lead: 10,
      qualified: 25,
      proposal: 50,
      negotiation: 75,
      won: 100,
      lost: 0
    };

    if (!this.isModified('probability')) {
      this.probability = stageProbabilities[this.stage];
    }

    if ((this.stage === 'won' || this.stage === 'lost') && !this.actualCloseDate) {
      this.actualCloseDate = new Date();
    }
  }
  next();
});

export default mongoose.model('Deal', dealSchema);
