import mongoose from 'mongoose';

const phoneNumberSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  provider: {
    type: String,
    enum: ['twilio', 'elevenlabs', 'vapi'],
    default: 'twilio'
  },
  providerId: {
    type: String, // SID from Twilio, ID from other providers
    required: true
  },
  type: {
    type: String,
    enum: ['inbound', 'outbound', 'both'],
    default: 'both'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  currentlyAssignedTo: {
    type: String, // 'campaign:{campaignId}' or 'agent:{agentId}' or null
    default: null
  },
  capabilities: {
    voice: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    mms: {
      type: Boolean,
      default: false
    }
  },
  configuration: {
    voiceUrl: String,
    voiceFallbackUrl: String,
    statusCallbackUrl: String,
    smsUrl: String,
    smsFallbackUrl: String
  },
  usage: {
    totalCalls: {
      type: Number,
      default: 0
    },
    totalMinutes: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    },
    lastUsed: Date
  },
  monthlyCost: {
    type: Number,
    default: 2.00 // Twilio phone number cost
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

phoneNumberSchema.index({ status: 1, currentlyAssignedTo: 1 });

// Method to check if number is available
phoneNumberSchema.methods.isAvailable = function() {
  return this.status === 'active' && !this.currentlyAssignedTo;
};

// Method to assign to campaign or agent
phoneNumberSchema.methods.assignTo = async function(resourceType, resourceId) {
  if (!this.isAvailable()) {
    throw new Error('Phone number is not available');
  }
  this.currentlyAssignedTo = `${resourceType}:${resourceId}`;
  await this.save();
};

// Method to release assignment
phoneNumberSchema.methods.release = async function() {
  this.currentlyAssignedTo = null;
  await this.save();
};

// Static method to get available number
phoneNumberSchema.statics.getAvailableNumber = async function(type = 'both') {
  return await this.findOne({
    status: 'active',
    currentlyAssignedTo: null,
    $or: [
      { type: type },
      { type: 'both' }
    ]
  });
};

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);

export default PhoneNumber;
