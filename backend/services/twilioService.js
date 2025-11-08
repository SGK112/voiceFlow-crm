import twilio from 'twilio';
import PhoneNumber from '../models/PhoneNumber.js';

class TwilioService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.client = twilio(this.accountSid, this.authToken);
  }

  // Purchase a new phone number
  async purchasePhoneNumber(areaCode = null, country = 'US') {
    try {
      // Search for available numbers
      const availableNumbers = await this.client.availablePhoneNumbers(country)
        .local
        .list({
          areaCode: areaCode,
          voiceEnabled: true,
          smsEnabled: true,
          limit: 5
        });

      if (availableNumbers.length === 0) {
        throw new Error('No available phone numbers found');
      }

      // Purchase the first available number
      const selectedNumber = availableNumbers[0].phoneNumber;
      const purchasedNumber = await this.client.incomingPhoneNumbers.create({
        phoneNumber: selectedNumber,
        voiceUrl: `${process.env.API_URL}/api/webhooks/twilio/voice`,
        voiceFallbackUrl: `${process.env.API_URL}/api/webhooks/twilio/voice-fallback`,
        statusCallbackUrl: `${process.env.API_URL}/api/webhooks/twilio/status`,
        smsUrl: `${process.env.API_URL}/api/webhooks/twilio/sms`,
        smsFallbackUrl: `${process.env.API_URL}/api/webhooks/twilio/sms-fallback`
      });

      // Save to database
      const phoneNumber = await PhoneNumber.create({
        phoneNumber: purchasedNumber.phoneNumber,
        provider: 'twilio',
        providerId: purchasedNumber.sid,
        type: 'both',
        status: 'active',
        capabilities: {
          voice: purchasedNumber.capabilities.voice,
          sms: purchasedNumber.capabilities.sms,
          mms: purchasedNumber.capabilities.mms
        },
        configuration: {
          voiceUrl: purchasedNumber.voiceUrl,
          voiceFallbackUrl: purchasedNumber.voiceFallbackUrl,
          statusCallbackUrl: purchasedNumber.statusCallbackUrl,
          smsUrl: purchasedNumber.smsUrl,
          smsFallbackUrl: purchasedNumber.smsFallbackUrl
        },
        monthlyCost: 2.00
      });

      return phoneNumber;
    } catch (error) {
      console.error('Error purchasing phone number:', error);
      throw new Error('Failed to purchase phone number: ' + error.message);
    }
  }

  // Import existing Twilio phone numbers
  async importExistingNumbers() {
    try {
      const twilioNumbers = await this.client.incomingPhoneNumbers.list();
      const imported = [];

      for (const twilioNumber of twilioNumbers) {
        // Check if already in database
        const existing = await PhoneNumber.findOne({
          phoneNumber: twilioNumber.phoneNumber
        });

        if (!existing) {
          const phoneNumber = await PhoneNumber.create({
            phoneNumber: twilioNumber.phoneNumber,
            provider: 'twilio',
            providerId: twilioNumber.sid,
            type: 'both',
            status: 'active',
            capabilities: {
              voice: twilioNumber.capabilities.voice,
              sms: twilioNumber.capabilities.sms,
              mms: twilioNumber.capabilities.mms
            },
            configuration: {
              voiceUrl: twilioNumber.voiceUrl,
              voiceFallbackUrl: twilioNumber.voiceFallbackUrl,
              statusCallbackUrl: twilioNumber.statusCallbackUrl,
              smsUrl: twilioNumber.smsUrl,
              smsFallbackUrl: twilioNumber.smsFallbackUrl
            },
            monthlyCost: 2.00
          });

          imported.push(phoneNumber);
        }
      }

      return imported;
    } catch (error) {
      console.error('Error importing phone numbers:', error);
      throw new Error('Failed to import phone numbers: ' + error.message);
    }
  }

  // Configure phone number for ElevenLabs forwarding
  async configureForElevenLabs(phoneNumberSid, elevenLabsAgentId) {
    try {
      // Generate TwiML for forwarding to ElevenLabs
      const twimlUrl = `${process.env.API_URL}/api/webhooks/twilio/elevenlabs-forward?agentId=${elevenLabsAgentId}`;

      const updatedNumber = await this.client.incomingPhoneNumbers(phoneNumberSid)
        .update({
          voiceUrl: twimlUrl,
          voiceMethod: 'POST'
        });

      return updatedNumber;
    } catch (error) {
      console.error('Error configuring phone number:', error);
      throw new Error('Failed to configure phone number: ' + error.message);
    }
  }

  // Make outbound call
  async makeCall(from, to, twimlUrl, statusCallback = null) {
    try {
      const call = await this.client.calls.create({
        from: from,
        to: to,
        url: twimlUrl,
        statusCallback: statusCallback,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
      });

      return call;
    } catch (error) {
      console.error('Error making call:', error);
      throw new Error('Failed to make call: ' + error.message);
    }
  }

  // Make outbound call with ElevenLabs
  async makeCallWithElevenLabs(from, to, elevenLabsAgentId) {
    try {
      const twimlUrl = `${process.env.API_URL}/api/webhooks/twilio/elevenlabs-outbound?agentId=${elevenLabsAgentId}`;
      const statusCallback = `${process.env.API_URL}/api/webhooks/twilio/call-status`;

      return await this.makeCall(from, to, twimlUrl, statusCallback);
    } catch (error) {
      console.error('Error making call with ElevenLabs:', error);
      throw new Error('Failed to make call with ElevenLabs: ' + error.message);
    }
  }

  // Generate TwiML for ElevenLabs WebSocket connection
  generateElevenLabsTwiML(elevenLabsAgentId, customMessage = null) {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    // Connect to ElevenLabs Conversational AI via WebSocket
    const connect = response.connect();
    connect.stream({
      url: `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${elevenLabsAgentId}`,
      parameters: {
        api_key: process.env.ELEVENLABS_API_KEY
      }
    });

    return response.toString();
  }

  // Release phone number (delete from Twilio)
  async releasePhoneNumber(phoneNumberSid) {
    try {
      await this.client.incomingPhoneNumbers(phoneNumberSid).remove();

      // Update in database
      await PhoneNumber.findOneAndUpdate(
        { providerId: phoneNumberSid },
        { status: 'inactive' }
      );

      return { success: true };
    } catch (error) {
      console.error('Error releasing phone number:', error);
      throw new Error('Failed to release phone number: ' + error.message);
    }
  }

  // Get phone number usage stats
  async getNumberUsage(phoneNumber, startDate, endDate) {
    try {
      const calls = await this.client.calls.list({
        from: phoneNumber,
        startTimeAfter: startDate,
        startTimeBefore: endDate
      });

      const messages = await this.client.messages.list({
        from: phoneNumber,
        dateSentAfter: startDate,
        dateSentBefore: endDate
      });

      return {
        totalCalls: calls.length,
        totalMessages: messages.length,
        callDurations: calls.reduce((sum, call) => sum + (parseInt(call.duration) || 0), 0)
      };
    } catch (error) {
      console.error('Error getting number usage:', error);
      throw new Error('Failed to get number usage: ' + error.message);
    }
  }
}

export default TwilioService;
