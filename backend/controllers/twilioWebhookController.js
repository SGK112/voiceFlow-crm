import twilio from 'twilio';
import CallLog from '../models/CallLog.js';
import VoiceAgent from '../models/VoiceAgent.js';
import Campaign from '../models/Campaign.js';
import TwilioService from '../services/twilioService.js';

const twilioService = new TwilioService();

// Handle incoming Twilio voice calls
export const handleTwilioVoice = async (req, res) => {
  try {
    const { From, To, CallSid } = req.body;

    console.log(`📞 Incoming call from ${From} to ${To} (CallSid: ${CallSid})`);

    // Find agent associated with this phone number
    const agent = await VoiceAgent.findOne({
      phoneNumber: To,
      enabled: true
    });

    if (!agent) {
      console.log(`❌ No agent found for number ${To}`);

      // Return TwiML to reject call
      const VoiceResponse = twilio.twiml.VoiceResponse;
      const response = new VoiceResponse();
      response.say({
        voice: 'alice'
      }, 'Sorry, this number is not configured. Please contact support.');
      response.hangup();

      res.type('text/xml');
      return res.send(response.toString());
    }

    // Check if agent is within availability hours
    if (agent.availability && agent.availability.enabled) {
      const now = new Date();
      const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM

      const dayAvailability = agent.availability.hours[day];

      if (!dayAvailability || !dayAvailability.enabled) {
        console.log(`❌ Agent not available on ${day}`);

        const VoiceResponse = twilio.twiml.VoiceResponse;
        const response = new VoiceResponse();
        response.say({
          voice: 'alice'
        }, 'Thank you for calling. We are currently closed. Please call back during business hours.');
        response.hangup();

        res.type('text/xml');
        return res.send(response.toString());
      }

      if (currentTime < dayAvailability.start || currentTime > dayAvailability.end) {
        console.log(`❌ Call outside business hours (${currentTime})`);

        const VoiceResponse = twilio.twiml.VoiceResponse;
        const response = new VoiceResponse();
        response.say({
          voice: 'alice'
        }, `Thank you for calling. Our business hours are ${dayAvailability.start} to ${dayAvailability.end}. Please call back during these hours.`);
        response.hangup();

        res.type('text/xml');
        return res.send(response.toString());
      }
    }

    // Generate TwiML to connect to ElevenLabs
    const twiml = twilioService.generateElevenLabsTwiML(agent.elevenLabsAgentId);

    // Create call log
    await CallLog.create({
      userId: agent.userId,
      agentId: agent._id,
      callerPhone: From,
      direction: 'inbound',
      status: 'in-progress',
      elevenLabsCallId: CallSid,
      metadata: {
        twilioCallSid: CallSid,
        toNumber: To
      }
    });

    console.log(`✅ Connected call to ElevenLabs agent ${agent.elevenLabsAgentId}`);

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error handling Twilio voice webhook:', error);

    // Return error TwiML
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say({
      voice: 'alice'
    }, 'We are experiencing technical difficulties. Please try again later.');
    response.hangup();

    res.type('text/xml');
    res.send(response.toString());
  }
};

// Handle Twilio call status updates
export const handleTwilioStatus = async (req, res) => {
  try {
    const {
      CallSid,
      CallStatus,
      CallDuration,
      From,
      To
    } = req.body;

    console.log(`📊 Call status update: ${CallSid} - ${CallStatus} (${CallDuration}s)`);

    // Find and update call log
    const callLog = await CallLog.findOne({
      $or: [
        { elevenLabsCallId: CallSid },
        { 'metadata.twilioCallSid': CallSid }
      ]
    });

    if (callLog) {
      // Map Twilio status to our status
      const statusMap = {
        'completed': 'completed',
        'busy': 'busy',
        'no-answer': 'no-answer',
        'failed': 'failed',
        'canceled': 'canceled'
      };

      callLog.status = statusMap[CallStatus] || callLog.status;

      if (CallDuration) {
        callLog.duration = parseInt(CallDuration);
        callLog.durationMinutes = Math.ceil(callLog.duration / 60);

        // Calculate cost
        const costPerMinute = callLog.cost?.costPerMinute || 0.10;
        callLog.cost.totalCost = callLog.durationMinutes * costPerMinute;
      }

      await callLog.save();

      // Update campaign stats if this is a campaign call
      if (callLog.metadata?.campaignId) {
        const campaign = await Campaign.findById(callLog.metadata.campaignId);
        if (campaign) {
          campaign.updateStats(callLog);
          await campaign.save();
        }
      }

      console.log(`✅ Updated call log for ${CallSid}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error handling Twilio status webhook:', error);
    res.sendStatus(500);
  }
};

// Handle TwiML for forwarding inbound calls to ElevenLabs
export const handleElevenLabsForward = async (req, res) => {
  try {
    const { agentId } = req.query;

    if (!agentId) {
      const VoiceResponse = twilio.twiml.VoiceResponse;
      const response = new VoiceResponse();
      response.say({
        voice: 'alice'
      }, 'Configuration error. Please contact support.');
      response.hangup();

      res.type('text/xml');
      return res.send(response.toString());
    }

    const twiml = twilioService.generateElevenLabsTwiML(agentId);

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error generating ElevenLabs forward TwiML:', error);
    res.sendStatus(500);
  }
};

// Handle TwiML for outbound calls with ElevenLabs
export const handleElevenLabsOutbound = async (req, res) => {
  try {
    const { agentId } = req.query;
    const { CallSid, From, To } = req.body;

    console.log(`📞 Outbound call ${CallSid} from ${From} to ${To}`);

    if (!agentId) {
      const VoiceResponse = twilio.twiml.VoiceResponse;
      const response = new VoiceResponse();
      response.say({
        voice: 'alice'
      }, 'Configuration error.');
      response.hangup();

      res.type('text/xml');
      return res.send(response.toString());
    }

    const twiml = twilioService.generateElevenLabsTwiML(agentId);

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error generating outbound ElevenLabs TwiML:', error);

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say({
      voice: 'alice'
    }, 'Technical error. Call ended.');
    response.hangup();

    res.type('text/xml');
    res.send(response.toString());
  }
};
