import VoiceAgent from '../models/VoiceAgent.js';
import CallLog from '../models/CallLog.js';
import User from '../models/User.js';
import ElevenLabsService from '../services/elevenLabsService.js';

// Use centralized ElevenLabs service with platform credentials
const elevenLabsService = new ElevenLabsService();

export const getAgents = async (req, res) => {
  try {
    const agents = await VoiceAgent.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAgentById = async (req, res) => {
  try {
    const agent = await VoiceAgent.findOne({ _id: req.params.id, userId: req.user._id });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAgent = async (req, res) => {
  try {
    const {
      name,
      type,
      customType,
      voiceId,
      voiceName,
      script,
      firstMessage,
      phoneNumber,
      language,
      temperature
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Agent name is required' });
    }

    if (!script) {
      return res.status(400).json({ message: 'Agent script/prompt is required' });
    }

    // Get user to check subscription limits
    const user = await User.findById(req.user._id);

    // Check subscription limits based on plan
    const agentCount = await VoiceAgent.countDocuments({ userId: req.user._id });
    const planLimits = {
      trial: 1,
      starter: 1,
      professional: 5,
      enterprise: Infinity
    };

    const maxAgents = planLimits[user.plan] || 1;
    if (agentCount >= maxAgents) {
      return res.status(403).json({
        message: `Your ${user.plan} plan allows up to ${maxAgents} agent(s). Upgrade to create more agents.`
      });
    }

    // Determine voice to use
    let selectedVoiceId = voiceId;
    let selectedVoiceName = voiceName;

    // If using a prebuilt type and no voice specified, use default for that type
    if (!selectedVoiceId && type && type !== 'custom') {
      const prebuiltAgents = elevenLabsService.getPrebuiltAgents();
      const prebuiltAgent = prebuiltAgents[type];
      if (prebuiltAgent) {
        selectedVoiceId = prebuiltAgent.voiceId;
        selectedVoiceName = prebuiltAgent.name;
      }
    }

    // Default to a good general voice if still not specified
    if (!selectedVoiceId) {
      selectedVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // Sarah - warm, professional female voice
      selectedVoiceName = 'Sarah';
    }

    // Create agent in ElevenLabs using PLATFORM credentials
    let elevenLabsAgent;
    try {
      elevenLabsAgent = await elevenLabsService.createAgent({
        name: name,
        voiceId: selectedVoiceId,
        script: script,
        firstMessage: firstMessage || `Hi! I'm calling from {{company_name}}. How are you today?`,
        language: language || 'en'
      });

      console.log(`✅ Created agent in ElevenLabs: ${elevenLabsAgent.agent_id}`);
    } catch (error) {
      console.error('Failed to create agent in ElevenLabs:', error.message);
      return res.status(500).json({
        message: 'Failed to create voice agent in ElevenLabs. Please try again or contact support.',
        error: error.message
      });
    }

    // Save to database with REAL elevenLabsAgentId
    const agent = await VoiceAgent.create({
      userId: req.user._id,
      name: name,
      type: type || 'custom',
      customType: customType,
      elevenLabsAgentId: elevenLabsAgent.agent_id,
      voiceId: selectedVoiceId,
      voiceName: selectedVoiceName,
      script: script,
      firstMessage: firstMessage || `Hi! I'm calling from {{company_name}}. How are you today?`,
      phoneNumber,
      configuration: {
        temperature: temperature || 0.8,
        maxDuration: 300,
        language: language || 'en'
      },
      availability: {
        enabled: true,
        timezone: 'America/New_York',
        hours: {
          monday: { start: '09:00', end: '17:00', enabled: true },
          tuesday: { start: '09:00', end: '17:00', enabled: true },
          wednesday: { start: '09:00', end: '17:00', enabled: true },
          thursday: { start: '09:00', end: '17:00', enabled: true },
          friday: { start: '09:00', end: '17:00', enabled: true },
          saturday: { start: '09:00', end: '17:00', enabled: false },
          sunday: { start: '09:00', end: '17:00', enabled: false }
        }
      }
    });

    console.log(`✅ Saved agent to database: ${agent._id}`);
    res.status(201).json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const agent = await VoiceAgent.findOne({ _id: req.params.id, userId: req.user._id });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const { name, script, phoneNumber, enabled, availability, configuration } = req.body;

    if (name) agent.name = name;
    if (script) agent.script = script;
    if (phoneNumber !== undefined) agent.phoneNumber = phoneNumber;
    if (enabled !== undefined) agent.enabled = enabled;
    if (availability) agent.availability = { ...agent.availability, ...availability };
    if (configuration) agent.configuration = { ...agent.configuration, ...configuration };

    if (script && agent.elevenLabsAgentId) {
      try {
        await elevenLabsService.updateAgent(agent.elevenLabsAgentId, {
          name: agent.name,
          script: agent.script
        });
      } catch (error) {
        console.error('Failed to update ElevenLabs agent:', error);
      }
    }

    await agent.save();
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAgent = async (req, res) => {
  try {
    const agent = await VoiceAgent.findOne({ _id: req.params.id, userId: req.user._id });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    await agent.deleteOne();
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAgentCalls = async (req, res) => {
  try {
    const agent = await VoiceAgent.findOne({ _id: req.params.id, userId: req.user._id });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const calls = await CallLog.find({ agentId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(calls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVoices = async (req, res) => {
  try {
    const voices = await elevenLabsService.getVoices();
    res.json(voices);
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ message: 'Failed to fetch voices from ElevenLabs' });
  }
};

export const getAgentTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: 'lead_qualification',
        name: 'Lead Qualification Agent',
        type: 'lead_gen',
        description: 'Qualify inbound leads by asking discovery questions',
        icon: '🎯',
        script: `You are a friendly lead qualification specialist for {{company_name}}.

Your goal is to qualify leads by understanding their needs and timeline.

LEAD INFORMATION:
- Name: {{lead_name}}
- Email: {{lead_email}}
- Source: {{lead_source}}

CONVERSATION FLOW:
1. Greet them warmly: "Hi {{lead_name}}! Thanks for your interest in {{company_name}}."
2. Ask about their specific needs
3. Understand their timeline (urgent, next 3 months, just exploring)
4. Gauge their budget range
5. Determine if they're decision maker
6. Book appointment if qualified

QUALIFICATION CRITERIA:
- Has specific need
- Timeline within 6 months
- Budget awareness
- Decision maker or influencer

Be conversational, not interrogative. Make it feel natural!`,
        firstMessage: `Hi {{lead_name}}! This is calling from {{company_name}}. How are you today?`,
        voiceId: 'EXAVITQu4vr4xnSDxMaL',
        voiceName: 'Sarah'
      },
      {
        id: 'appointment_booking',
        name: 'Appointment Booking Agent',
        type: 'booking',
        description: 'Schedule appointments and consultations',
        icon: '📅',
        script: `You are a helpful appointment booking assistant for {{company_name}}.

Your goal is to book an appointment for {{lead_name}}.

LEAD DETAILS:
- Name: {{lead_name}}
- Email: {{lead_email}}
- Phone: {{lead_phone}}

AVAILABLE TIME SLOTS:
- Weekdays: 9 AM - 5 PM
- Consultations are 30-60 minutes

CONVERSATION FLOW:
1. Confirm their interest in scheduling
2. Ask what days/times work best
3. Offer 2-3 specific time slot options
4. Confirm their contact info ({{lead_email}}, {{lead_phone}})
5. Set the appointment
6. Send confirmation and next steps

TONE: Friendly, efficient, accommodating
Be flexible and helpful!`,
        firstMessage: `Hi {{lead_name}}! I'm calling to help schedule your consultation with {{company_name}}. Do you have a few minutes?`,
        voiceId: 'TxGEqnHWrfWFTfGW9XjX',
        voiceName: 'Mike'
      },
      {
        id: 'customer_feedback',
        name: 'Customer Feedback Survey',
        type: 'custom',
        customType: 'feedback',
        description: 'Collect customer satisfaction feedback',
        icon: '⭐',
        script: `You are conducting a brief customer satisfaction survey for {{company_name}}.

CUSTOMER: {{lead_name}}

SURVEY QUESTIONS:
1. How would you rate your overall experience? (1-10)
2. What did you like most about our service?
3. What could we improve?
4. Would you recommend us to others?
5. Any additional comments?

TONE: Appreciative, genuine interest in feedback
KEEP IT BRIEF: 2-3 minutes maximum

Thank them for their time and feedback!`,
        firstMessage: `Hi {{lead_name}}! This is from {{company_name}}. Do you have 2 minutes for a quick satisfaction survey?`,
        voiceId: 'XrExE9yKIg1WjnnlVkGX',
        voiceName: 'Lisa'
      },
      {
        id: 'payment_reminder',
        name: 'Payment Reminder Agent',
        type: 'collections',
        description: 'Professional payment reminder calls',
        icon: '💰',
        script: `You are a professional accounts specialist for {{company_name}}.

CUSTOMER: {{lead_name}}

Your goal is to collect payment professionally and courteously.

CONVERSATION FLOW:
1. Greet professionally
2. Mention outstanding balance (without specific amount unless they ask)
3. Ask if there are any issues preventing payment
4. Offer payment options (credit card, ACH, payment plan)
5. Get commitment on payment date
6. Confirm contact info

TONE: Professional, firm but respectful
NEVER: Threaten, be rude, or aggressive
ALWAYS: Be understanding and solution-oriented

If they commit to payment, confirm the date and method.`,
        firstMessage: `Hello {{lead_name}}, this is from {{company_name}}. I'm calling regarding your account. Do you have a moment?`,
        voiceId: 'pNInz6obpgDQGcFmaJgB',
        voiceName: 'James'
      },
      {
        id: 'event_reminder',
        name: 'Event Reminder Agent',
        type: 'custom',
        customType: 'reminder',
        description: 'Remind customers about upcoming events',
        icon: '🎉',
        script: `You are calling to remind {{lead_name}} about their upcoming event with {{company_name}}.

EVENT DETAILS:
- Customer: {{lead_name}}
- Contact: {{lead_phone}}, {{lead_email}}

CONVERSATION FLOW:
1. Greet warmly
2. Remind them about the event/appointment
3. Confirm they're still planning to attend
4. Answer any questions
5. Provide any prep instructions if needed
6. Get confirmation

TONE: Enthusiastic, helpful
Make them feel excited about the event!`,
        firstMessage: `Hi {{lead_name}}! This is calling from {{company_name}} with a friendly reminder about your upcoming appointment.`,
        voiceId: 'EXAVITQu4vr4xnSDxMaL',
        voiceName: 'Sarah'
      },
      {
        id: 'winback_campaign',
        name: 'Win-Back Campaign Agent',
        type: 'promo',
        description: 'Re-engage inactive customers with special offers',
        icon: '🎁',
        script: `You are calling to win back a former customer for {{company_name}}.

CUSTOMER: {{lead_name}}

Your goal is to re-engage them with a special offer.

CONVERSATION FLOW:
1. Acknowledge they were a valued customer
2. Ask why they stopped using the service (listen!)
3. Address their concerns
4. Present exclusive win-back offer
5. Create urgency (limited time)
6. Get commitment or book follow-up

SPECIAL OFFER:
- 20% off their next purchase
- Exclusive access to new features
- Waived fees for 3 months

TONE: Appreciative, understanding, excited to have them back`,
        firstMessage: `Hi {{lead_name}}! This is from {{company_name}}. We noticed it's been a while and wanted to reach out personally.`,
        voiceId: 'XrExE9yKIg1WjnnlVkGX',
        voiceName: 'Lisa'
      }
    ];

    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAgentPerformance = async (req, res) => {
  try {
    const agent = await VoiceAgent.findOne({ _id: req.params.id, userId: req.user._id });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const totalCalls = await CallLog.countDocuments({ agentId: req.params.id });
    const successfulCalls = await CallLog.countDocuments({ agentId: req.params.id, status: 'completed' });

    const avgDuration = await CallLog.aggregate([
      { $match: { agentId: agent._id } },
      { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
    ]);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const callsByDay = await CallLog.aggregate([
      {
        $match: {
          agentId: agent._id,
          createdAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalCalls,
      successfulCalls,
      successRate: totalCalls > 0 ? ((successfulCalls / totalCalls) * 100).toFixed(2) : 0,
      averageDuration: avgDuration.length > 0 ? Math.round(avgDuration[0].avgDuration) : 0,
      leadsGenerated: agent.performance.leadsGenerated,
      callsByDay
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
