import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  enabled: {
    type: Boolean,
    default: false
  },
  trigger: {
    type: {
      type: String,
      enum: ['call_completed', 'call_initiated', 'lead_created', 'lead_qualified', 'appointment_booked', 'payment_received', 'manual', 'schedule'],
      required: true
    },
    conditions: {
      agentTypes: [String], // ['lead_gen', 'booking', etc.]
      callStatus: [String], // ['completed', 'failed', etc.]
      leadQualified: Boolean,
      appointmentBooked: Boolean,
      paymentCaptured: Boolean,
      sentiment: [String], // ['positive', 'negative', 'neutral']
      minimumDuration: Number, // in seconds
      customFields: Map // Custom conditions
    },
    schedule: {
      type: String, // Cron expression for scheduled workflows
      timezone: String
    }
  },
  actions: [{
    id: String, // Unique ID for this action node
    type: {
      type: String,
      enum: [
        // Communication
        'send_sms', 'send_email', 'make_call', 'send_slack',
        // CRM
        'create_lead', 'update_lead', 'create_task', 'update_deal', 'add_note',
        // Calendar
        'create_calendar_event', 'send_calendar_invite',
        // Integrations
        'google_sheets_add_row', 'webhook', 'api_call',
        // Utilities
        'delay', 'condition', 'loop'
      ],
      required: true
    },
    name: String, // User-friendly name
    config: {
      // For send_sms
      to: String, // Phone number or variable {{lead_phone}}
      message: String, // SMS body with variables

      // For send_email
      recipient: String, // Email or variable {{lead_email}}
      subject: String,
      body: String,
      attachments: [String],

      // For make_call
      agentId: mongoose.Schema.Types.ObjectId,
      phoneNumber: String, // Or variable

      // For send_slack
      channel: String,
      text: String,

      // For create_lead/update_lead
      leadData: Map,
      leadId: String, // Variable or ID

      // For create_task
      taskTitle: String,
      taskDescription: String,
      taskType: String,
      taskPriority: String,
      taskDueDate: String, // Can be relative like "+2 days"

      // For create_calendar_event
      calendar: String, // 'google', 'outlook'
      eventTitle: String,
      eventDescription: String,
      eventStart: String,
      eventEnd: String,
      attendees: [String],

      // For google_sheets
      spreadsheetId: String,
      sheetName: String,
      values: Map,

      // For webhook/api_call
      url: String,
      method: String, // GET, POST, etc.
      headers: Map,
      body: Map,

      // For delay
      duration: Number, // milliseconds
      unit: String, // 'minutes', 'hours', 'days'

      // For condition (if/else logic)
      condition: String, // Expression like "{{lead_qualified}} === true"
      trueActions: [String], // Array of action IDs to run if true
      falseActions: [String], // Array of action IDs to run if false

      // For loop
      items: String, // Variable containing array
      actionId: String // Action to repeat for each item
    },
    position: {
      x: Number,
      y: Number
    },
    nextAction: String // ID of next action (for sequential flows)
  }],
  variables: {
    type: Map,
    of: String,
    default: {} // Store custom variables for this workflow
  },
  execution: {
    totalRuns: { type: Number, default: 0 },
    successfulRuns: { type: Number, default: 0 },
    failedRuns: { type: Number, default: 0 },
    lastRunAt: Date,
    lastRunStatus: {
      type: String,
      enum: ['success', 'failed', 'running'],
    },
    lastRunError: String,
    averageExecutionTime: Number // milliseconds
  },
  integrations: [{
    service: {
      type: String,
      enum: ['google_calendar', 'google_sheets', 'twilio', 'sendgrid', 'slack', 'stripe', 'zapier', 'custom']
    },
    connected: { type: Boolean, default: false },
    credentials: {
      type: Map,
      of: String
    },
    lastSyncedAt: Date
  }],
  category: {
    type: String,
    enum: ['lead_nurture', 'follow_up', 'customer_service', 'sales', 'marketing', 'operations', 'custom'],
    default: 'custom'
  },
  template: {
    type: Boolean,
    default: false // True if this is a template workflow
  },
  templateId: String, // Reference to template if created from one
  version: {
    type: Number,
    default: 1
  },
  tags: [String]
}, {
  timestamps: true
});

// Indexes for performance
workflowSchema.index({ userId: 1, enabled: 1 });
workflowSchema.index({ 'trigger.type': 1, enabled: 1 });
workflowSchema.index({ template: 1 });

// Virtual for success rate
workflowSchema.virtual('successRate').get(function() {
  if (this.execution.totalRuns === 0) return 0;
  return ((this.execution.successfulRuns / this.execution.totalRuns) * 100).toFixed(2);
});

const Workflow = mongoose.model('Workflow', workflowSchema);

export default Workflow;
