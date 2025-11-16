import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  timezone: {
    type: String,
    default: 'America/New_York'
  },
  meetingType: {
    type: String,
    enum: ['demo', 'sales', 'support', 'consultation'],
    default: 'demo'
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  source: {
    type: String,
    default: 'website'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  calendarEventId: {
    type: String
  },
  meetingLink: {
    type: String
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  confirmationEmailSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
meetingSchema.index({ email: 1, date: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ createdAt: -1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
