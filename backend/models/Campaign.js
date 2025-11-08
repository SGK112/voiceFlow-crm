import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VoiceAgent',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'running', 'paused', 'completed', 'failed'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['outbound', 'inbound'],
    default: 'outbound'
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    callHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '17:00'
      }
    },
    daysOfWeek: {
      type: [Number], // 0-6 (Sunday-Saturday)
      default: [1, 2, 3, 4, 5] // Mon-Fri
    }
  },
  contacts: [{
    name: String,
    phone: {
      type: String,
      required: true
    },
    email: String,
    company: String,
    customFields: {
      type: Map,
      of: String
    },
    status: {
      type: String,
      enum: ['pending', 'calling', 'completed', 'failed', 'no-answer', 'busy'],
      default: 'pending'
    },
    callAttempts: {
      type: Number,
      default: 0
    },
    lastCallDate: Date,
    callLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CallLog'
    }
  }],
  settings: {
    maxRetries: {
      type: Number,
      default: 3
    },
    retryDelay: {
      type: Number, // Minutes between retries
      default: 60
    },
    callsPerHour: {
      type: Number,
      default: 30
    },
    voicemail: {
      enabled: {
        type: Boolean,
        default: true
      },
      detectEnabled: {
        type: Boolean,
        default: true
      },
      leaveMessage: {
        type: Boolean,
        default: false
      }
    }
  },
  script: {
    template: String,
    variables: [String] // e.g., ['name', 'company', 'product']
  },
  stats: {
    totalContacts: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    },
    noAnswer: {
      type: Number,
      default: 0
    },
    busy: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number, // Total minutes
      default: 0
    },
    totalCost: {
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
    }
  }
}, {
  timestamps: true
});

campaignSchema.index({ userId: 1, status: 1, createdAt: -1 });
campaignSchema.index({ agentId: 1 });

// Method to get next contact to call
campaignSchema.methods.getNextContact = function() {
  return this.contacts.find(contact =>
    contact.status === 'pending' &&
    contact.callAttempts < this.settings.maxRetries
  );
};

// Method to check if campaign should be calling now
campaignSchema.methods.shouldCallNow = function() {
  if (this.status !== 'running' && this.status !== 'scheduled') return false;

  const now = new Date();
  const schedule = this.schedule;

  // Check date range
  if (schedule.startDate && now < schedule.startDate) return false;
  if (schedule.endDate && now > schedule.endDate) return false;

  // Check day of week
  const dayOfWeek = now.getDay();
  if (!schedule.daysOfWeek.includes(dayOfWeek)) return false;

  // Check time of day
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM
  if (currentTime < schedule.callHours.start || currentTime > schedule.callHours.end) {
    return false;
  }

  return true;
};

// Method to update stats after a call
campaignSchema.methods.updateStats = function(callResult) {
  this.stats.completed++;

  if (callResult.status === 'completed') {
    this.stats.totalDuration += callResult.durationMinutes || 0;
    this.stats.totalCost += callResult.cost?.totalCost || 0;

    if (callResult.leadsCapured?.qualified) {
      this.stats.leadsGenerated++;
    }
    if (callResult.leadsCapured?.appointmentBooked) {
      this.stats.appointmentsBooked++;
    }
  } else if (callResult.status === 'failed') {
    this.stats.failed++;
  } else if (callResult.status === 'no-answer') {
    this.stats.noAnswer++;
  } else if (callResult.status === 'busy') {
    this.stats.busy++;
  }
};

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;
