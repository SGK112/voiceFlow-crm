import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
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
  description: String,
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'follow_up', 'demo', 'task', 'reminder'],
    required: true,
    default: 'task'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  dueDate: {
    type: Date,
    index: true
  },
  completedAt: Date,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  relatedContact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  relatedDeal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  },
  relatedCall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CallLog'
  },
  autoCreatedBy: {
    type: String,
    enum: ['manual', 'voice_agent', 'n8n_workflow', 'campaign'],
    default: 'manual'
  },
  voiceAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VoiceAgent'
  },
  triggeredWorkflows: [{
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'N8nWorkflow'
    },
    triggeredAt: Date,
    event: String
  }],
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    minutesBefore: Number,
    sent: Boolean,
    sentAt: Date
  }],
  tags: [String],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

taskSchema.index({ user: 1, status: 1, dueDate: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });
taskSchema.index({ createdAt: -1 });

taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed' && this.status !== 'cancelled';
});

taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = null;
    }
  }
  next();
});

export default mongoose.model('Task', taskSchema);
