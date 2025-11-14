import mongoose from 'mongoose';
import agentTemplates from '../config/agentTemplates.js';
import specialtyAgentTemplates from '../config/specialtyAgentTemplates.js';

// Merge all agent templates (same as controller)
const allAgentTemplates = {
  ...agentTemplates,
  ...specialtyAgentTemplates
};

/**
 * UserAgent Model
 *
 * Stores a user's configured agent instance based on an agent template.
 * The template provides the structure, this stores the user's customized version.
 */

const userAgentSchema = new mongoose.Schema({
  // Who owns this agent
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Which template this is based on
  templateId: {
    type: String,
    required: true,
    enum: Object.keys(allAgentTemplates),
    index: true
  },

  // User's custom name for this agent (optional)
  customName: {
    type: String,
    trim: true
  },

  // User's answers to the setup questions
  configuration: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  // The generated system prompt for this agent
  systemPrompt: {
    type: String,
    required: true
  },

  // Agent status
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft',
    index: true
  },

  // Phone number assigned to this agent (if inbound)
  phoneNumber: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },

  // ElevenLabs voice agent ID (if using voice)
  voiceAgentId: {
    type: String,
    trim: true
  },

  // Voice configuration
  voiceConfig: {
    voiceId: String, // ElevenLabs voice ID
    stability: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1
    },
    similarityBoost: {
      type: Number,
      default: 0.75,
      min: 0,
      max: 1
    },
    speed: {
      type: Number,
      default: 1.0,
      min: 0.25,
      max: 2.0
    }
  },

  // Usage statistics
  stats: {
    totalCalls: {
      type: Number,
      default: 0
    },
    totalMinutes: {
      type: Number,
      default: 0
    },
    leadsGenerated: {
      type: Number,
      default: 0
    },
    appointmentsBooked: {
      type: Number,
      default: 0
    },
    paymentsCollected: {
      type: Number,
      default: 0
    },
    reviewsRequested: {
      type: Number,
      default: 0
    },
    reviewsReceived: {
      type: Number,
      default: 0
    },
    lastCallAt: Date,
    lastActiveAt: Date
  },

  // Billing info
  billing: {
    plan: {
      type: String,
      enum: ['monthly', 'pay-per-use', 'enterprise'],
      default: 'monthly'
    },
    basePrice: Number,
    perCallPrice: Number,
    percentOfCollections: Number,
    perReviewBonus: Number,
    freeCallsIncluded: Number,
    currentPeriodCalls: {
      type: Number,
      default: 0
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date
  },

  // Connected integrations for this agent
  connectedIntegrations: [{
    service: {
      type: String,
      required: true
    },
    integrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Integration'
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    isRequired: {
      type: Boolean,
      default: false
    }
  }],

  // Workflow automations
  workflows: [{
    trigger: String,
    name: String,
    enabled: {
      type: Boolean,
      default: true
    },
    actions: [{
      type: {
        type: String,
        required: true
      },
      service: String,
      config: mongoose.Schema.Types.Mixed
    }],
    executionCount: {
      type: Number,
      default: 0
    },
    lastExecutedAt: Date
  }],

  // Testing & Training
  testing: {
    isTestAgent: {
      type: Boolean,
      default: false
    },
    testCallsCount: {
      type: Number,
      default: 0
    },
    feedbackScore: {
      type: Number,
      min: 0,
      max: 10
    },
    improvementNotes: [String]
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  activatedAt: Date,
  pausedAt: Date,
  archivedAt: Date
}, {
  timestamps: true
});

// Indexes
userAgentSchema.index({ userId: 1, status: 1 });
userAgentSchema.index({ userId: 1, templateId: 1 });
userAgentSchema.index({ status: 1, 'billing.currentPeriodEnd': 1 });

// Virtual: Get the template definition
userAgentSchema.virtual('template').get(function() {
  return allAgentTemplates[this.templateId];
});

// Method: Generate system prompt from configuration
userAgentSchema.methods.generateSystemPrompt = function() {
  const template = allAgentTemplates[this.templateId];
  if (!template || !template.generatePrompt) {
    throw new Error(`Invalid template: ${this.templateId}`);
  }

  return template.generatePrompt(this.configuration, this.userId);
};

// Method: Activate the agent
userAgentSchema.methods.activate = async function() {
  // Validate required integrations are connected
  const template = allAgentTemplates[this.templateId];
  const missingIntegrations = template.requiredIntegrations.filter(req =>
    !this.connectedIntegrations.some(conn => conn.service === req.service)
  );

  if (missingIntegrations.length > 0) {
    throw new Error(`Missing required integrations: ${missingIntegrations.map(i => i.service).join(', ')}`);
  }

  this.status = 'active';
  this.activatedAt = new Date();
  this.stats.lastActiveAt = new Date();

  // Set up billing period
  if (!this.billing.currentPeriodStart) {
    this.billing.currentPeriodStart = new Date();
    this.billing.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    this.billing.currentPeriodCalls = 0;
  }

  await this.save();
  return this;
};

// Method: Pause the agent
userAgentSchema.methods.pause = async function() {
  this.status = 'paused';
  this.pausedAt = new Date();
  await this.save();
  return this;
};

// Method: Resume the agent
userAgentSchema.methods.resume = async function() {
  this.status = 'active';
  this.pausedAt = null;
  this.stats.lastActiveAt = new Date();
  await this.save();
  return this;
};

// Method: Archive the agent
userAgentSchema.methods.archive = async function() {
  this.status = 'archived';
  this.archivedAt = new Date();
  await this.save();
  return this;
};

// Method: Log a call
userAgentSchema.methods.logCall = async function(callData) {
  this.stats.totalCalls += 1;
  this.stats.totalMinutes += callData.duration || 0;
  this.stats.lastCallAt = new Date();
  this.stats.lastActiveAt = new Date();

  // Update billing
  this.billing.currentPeriodCalls += 1;

  // Update specific stats based on template
  if (callData.leadCreated) {
    this.stats.leadsGenerated += 1;
  }
  if (callData.appointmentBooked) {
    this.stats.appointmentsBooked += 1;
  }
  if (callData.paymentCollected) {
    this.stats.paymentsCollected += callData.paymentAmount || 0;
  }
  if (callData.reviewRequested) {
    this.stats.reviewsRequested += 1;
  }
  if (callData.reviewReceived) {
    this.stats.reviewsReceived += 1;
  }

  await this.save();
  return this;
};

// Method: Calculate current period cost
userAgentSchema.methods.calculateCurrentCost = function() {
  const template = allAgentTemplates[this.templateId];
  let cost = this.billing.basePrice || template.pricing.basePrice;

  // Add per-call charges
  if (this.billing.currentPeriodCalls > (this.billing.freeCallsIncluded || 0)) {
    const billableCalls = this.billing.currentPeriodCalls - this.billing.freeCallsIncluded;
    cost += billableCalls * (this.billing.perCallPrice || template.pricing.perCallPrice);
  }

  // Add collection commission
  if (this.billing.percentOfCollections && this.stats.paymentsCollected > 0) {
    cost += this.stats.paymentsCollected * this.billing.percentOfCollections;
  }

  // Add review bonuses
  if (this.billing.perReviewBonus && this.stats.reviewsReceived > 0) {
    cost += this.stats.reviewsReceived * this.billing.perReviewBonus;
  }

  return Math.round(cost * 100) / 100; // Round to 2 decimals
};

// Method: Get required integrations status
userAgentSchema.methods.getIntegrationStatus = function() {
  const template = allAgentTemplates[this.templateId];

  return {
    required: template.requiredIntegrations.map(req => ({
      service: req.service,
      purpose: req.purpose,
      connected: this.connectedIntegrations.some(conn => conn.service === req.service)
    })),
    optional: template.optionalIntegrations.map(opt => ({
      service: opt.service,
      purpose: opt.purpose,
      connected: this.connectedIntegrations.some(conn => conn.service === opt.service)
    }))
  };
};

// Method: Execute workflow
userAgentSchema.methods.executeWorkflow = async function(triggerEvent, eventData) {
  const matchingWorkflows = this.workflows.filter(w =>
    w.enabled && w.trigger === triggerEvent
  );

  const results = [];

  for (const workflow of matchingWorkflows) {
    try {
      // Execute each action in the workflow
      for (const action of workflow.actions) {
        // TODO: Implement actual action execution
        // This will call the appropriate integration service
        console.log(`Executing action: ${action.type} for workflow: ${workflow.name}`);
      }

      workflow.executionCount += 1;
      workflow.lastExecutedAt = new Date();
      results.push({ workflow: workflow.name, success: true });
    } catch (error) {
      results.push({ workflow: workflow.name, success: false, error: error.message });
    }
  }

  await this.save();
  return results;
};

// Static: Find active agents for a user
userAgentSchema.statics.findActiveByUser = function(userId) {
  return this.find({ userId, status: 'active' });
};

// Static: Create agent from template
userAgentSchema.statics.createFromTemplate = async function(userId, templateId, configuration) {
  const template = allAgentTemplates[templateId];
  if (!template) {
    throw new Error(`Invalid template ID: ${templateId}`);
  }

  // Generate system prompt
  const systemPrompt = template.generatePrompt(configuration, userId);

  // Create the agent
  const agent = new this({
    userId,
    templateId,
    configuration,
    systemPrompt,
    status: 'draft',
    billing: {
      plan: 'monthly',
      basePrice: template.pricing.basePrice,
      perCallPrice: template.pricing.perCallPrice,
      percentOfCollections: template.pricing.percentOfCollections,
      perReviewBonus: template.pricing.perReviewBonus,
      freeCallsIncluded: template.pricing.freeCallsIncluded
    },
    workflows: template.workflows || []
  });

  await agent.save();
  return agent;
};

// Pre-save middleware: Update systemPrompt if configuration changed
userAgentSchema.pre('save', function(next) {
  if (this.isModified('configuration')) {
    try {
      this.systemPrompt = this.generateSystemPrompt();
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const UserAgent = mongoose.model('UserAgent', userAgentSchema);

export default UserAgent;
