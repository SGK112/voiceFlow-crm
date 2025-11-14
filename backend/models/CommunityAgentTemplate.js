import mongoose from 'mongoose';

const communityAgentTemplateSchema = new mongoose.Schema({
  // Creator information
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  creatorName: {
    type: String,
    required: true
  },
  creatorCompany: String,

  // Template details
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  longDescription: {
    type: String,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'inbound',
      'outbound',
      'operations',
      'trade-specialist',
      'project-management',
      'research',
      'social-media',
      'customer-service',
      'sales',
      'other'
    ]
  },
  icon: {
    type: String,
    default: '🤖'
  },
  color: {
    type: String,
    default: '#6366F1'
  },

  // Pricing & revenue share
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'per-call', 'free'],
      default: 'monthly'
    },
    perCallPrice: {
      type: Number,
      default: 0
    },
    freeCallsIncluded: {
      type: Number,
      default: 0
    }
  },

  revenueShare: {
    creatorPercentage: {
      type: Number,
      default: 70 // Creator gets 70%
    },
    platformPercentage: {
      type: Number,
      default: 30 // Platform gets 30%
    }
  },

  // Template configuration
  features: [{
    type: String
  }],

  setupQuestions: [{
    id: String,
    type: {
      type: String,
      enum: ['text', 'textarea', 'select', 'multiselect', 'number', 'phone', 'email']
    },
    label: String,
    placeholder: String,
    required: Boolean,
    options: [{
      value: String,
      label: String
    }],
    defaultValue: String
  }],

  promptTemplate: {
    type: String,
    required: true
  },

  firstMessageTemplate: {
    type: String,
    default: 'Hello! How can I help you today?'
  },

  // Knowledge base
  knowledgeBase: {
    sources: [String],
    uploadedFiles: [{
      filename: String,
      url: String,
      uploadedAt: Date
    }]
  },

  // Integrations
  requiredIntegrations: [{
    service: String,
    purpose: String
  }],
  optionalIntegrations: [{
    service: String,
    purpose: String
  }],

  // Publishing status
  status: {
    type: String,
    enum: ['draft', 'pending-review', 'published', 'rejected', 'suspended'],
    default: 'draft'
  },

  reviewNotes: String,
  publishedAt: Date,

  // Usage stats
  stats: {
    installs: {
      type: Number,
      default: 0
    },
    activeInstalls: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    totalCalls: {
      type: Number,
      default: 0
    }
  },

  // SEO & Discovery
  tags: [String],
  industry: {
    type: String,
    enum: [
      'construction',
      'remodeling',
      'hvac',
      'plumbing',
      'electrical',
      'landscaping',
      'real-estate',
      'property-management',
      'retail',
      'healthcare',
      'professional-services',
      'other'
    ]
  },

  // Screenshots & media
  screenshots: [{
    url: String,
    caption: String
  }],
  demoVideoUrl: String,

  // Featured
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date
}, {
  timestamps: true
});

// Indexes for discovery
communityAgentTemplateSchema.index({ status: 1, category: 1 });
communityAgentTemplateSchema.index({ status: 1, 'stats.installs': -1 });
communityAgentTemplateSchema.index({ status: 1, 'stats.rating': -1 });
communityAgentTemplateSchema.index({ tags: 1 });
communityAgentTemplateSchema.index({ industry: 1 });

// Generate slug from name
communityAgentTemplateSchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

const CommunityAgentTemplate = mongoose.model('CommunityAgentTemplate', communityAgentTemplateSchema);

export default CommunityAgentTemplate;
