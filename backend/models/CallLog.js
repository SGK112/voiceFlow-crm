import mongoose from 'mongoose';

const callLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VoiceAgent',
    required: true,
    index: true
  },
  callerName: String,
  callerPhone: {
    type: String,
    required: true
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  durationMinutes: {
    type: Number, // Duration in minutes (rounded up for billing)
    default: 0
  },
  cost: {
    costPerMinute: {
      type: Number, // ElevenLabs cost per minute (e.g., 0.10)
      default: 0.10
    },
    totalCost: {
      type: Number, // Total platform cost for this call
      default: 0
    },
    userCharge: {
      type: Number, // What customer pays (if overage)
      default: 0
    }
  },
  transcript: {
    type: String,
    default: ''
  },
  recordingUrl: String,
  status: {
    type: String,
    enum: ['completed', 'failed', 'no-answer', 'busy', 'canceled'],
    default: 'completed'
  },
  leadsCapured: {
    name: String,
    email: String,
    phone: String,
    interest: String,
    qualified: Boolean,
    appointmentBooked: Boolean,
    appointmentDate: Date,
    paymentCaptured: Boolean,
    paymentAmount: Number
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  elevenLabsCallId: String,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

callLogSchema.index({ userId: 1, createdAt: -1 });
callLogSchema.index({ agentId: 1, createdAt: -1 });

const CallLog = mongoose.model('CallLog', callLogSchema);

export default CallLog;
