import mongoose from 'mongoose';

const phoneNumberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  twilioSid: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['purchased', 'ported'],
    default: 'purchased'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'porting', 'failed'],
    default: 'active'
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  assignedAgentName: String,
  portRequestSid: String,
  currentProvider: String,
  accountNumber: String,
  callsReceived: {
    type: Number,
    default: 0
  },
  callsMade: {
    type: Number,
    default: 0
  },
  smsReceived: {
    type: Number,
    default: 0
  },
  smsSent: {
    type: Number,
    default: 0
  },
  monthlyCost: {
    type: Number,
    default: 2.00
  },
  stripeSubscriptionItemId: String,
  friendlyName: String,
  capabilities: {
    voice: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    mms: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

phoneNumberSchema.index({ userId: 1, status: 1 });
phoneNumberSchema.index({ phoneNumber: 1 });
phoneNumberSchema.index({ twilioSid: 1 });

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);

export default PhoneNumber;
