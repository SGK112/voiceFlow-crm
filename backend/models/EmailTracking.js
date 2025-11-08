import mongoose from 'mongoose';

const emailTrackingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  to: [{
    email: String,
    name: String
  }],
  from: {
    email: String,
    name: String
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  bodyHtml: String,
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'],
    default: 'queued',
    index: true
  },
  relatedContact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    index: true
  },
  relatedDeal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  sentAt: Date,
  deliveredAt: Date,
  opens: [{
    timestamp: Date,
    ipAddress: String,
    userAgent: String,
    location: String
  }],
  clicks: [{
    timestamp: Date,
    url: String,
    ipAddress: String,
    userAgent: String
  }],
  bounceReason: String,
  errorMessage: String,
  trackingPixelUrl: String,
  trackingEnabled: {
    type: Boolean,
    default: true
  },
  isAutomatic: {
    type: Boolean,
    default: false
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'N8nWorkflow'
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }],
  tags: [String]
}, {
  timestamps: true
});

emailTrackingSchema.index({ user: 1, status: 1, sentAt: -1 });
emailTrackingSchema.index({ relatedContact: 1, sentAt: -1 });
emailTrackingSchema.index({ sentAt: -1 });

emailTrackingSchema.virtual('openCount').get(function() {
  return this.opens ? this.opens.length : 0;
});

emailTrackingSchema.virtual('clickCount').get(function() {
  return this.clicks ? this.clicks.length : 0;
});

emailTrackingSchema.virtual('wasOpened').get(function() {
  return this.opens && this.opens.length > 0;
});

emailTrackingSchema.virtual('wasClicked').get(function() {
  return this.clicks && this.clicks.length > 0;
});

emailTrackingSchema.methods.recordOpen = function(ipAddress, userAgent, location) {
  if (!this.opens) this.opens = [];

  this.opens.push({
    timestamp: new Date(),
    ipAddress,
    userAgent,
    location
  });

  if (this.status === 'delivered' || this.status === 'sent') {
    this.status = 'opened';
  }

  return this.save();
};

emailTrackingSchema.methods.recordClick = function(url, ipAddress, userAgent) {
  if (!this.clicks) this.clicks = [];

  this.clicks.push({
    timestamp: new Date(),
    url,
    ipAddress,
    userAgent
  });

  if (this.status === 'delivered' || this.status === 'sent' || this.status === 'opened') {
    this.status = 'clicked';
  }

  return this.save();
};

export default mongoose.model('EmailTracking', emailTrackingSchema);
