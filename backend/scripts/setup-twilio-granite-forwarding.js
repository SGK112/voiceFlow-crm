import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import twilio from 'twilio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const GRANITE_AGENT_ID = process.env.ELEVENLABS_GRANITE_AGENT_ID || 'agent_9301k802kktwfbhrbe9bam7f1spe';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://f66af302a875.ngrok-free.app';

// Available Twilio numbers from /tmp/twilio_numbers.json:
// 1. +16028337194 (PN54e75c91250a447fa1d5a085232a1fc8) - Currently used for SMS demos
// 2. +16028335307 (PN0c73817ce2bdc29b6b2b664276dc2dea) - Direct to ElevenLabs
// 3. +16028334780 (PN14cbc458f8f486f55796612209ce8de8) - David's number (A2P registered)

// We'll use +16028335307 for Surprise Granite since it's already set up for direct ElevenLabs
const PHONE_NUMBER_SID = 'PN0c73817ce2bdc29b6b2b664276dc2dea';
const PHONE_NUMBER = '+16028335307';

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

async function setupGraniteForwarding() {
  try {
    console.log('📞 Setting up Twilio forwarding for Surprise Granite...');
    console.log(`   Phone Number: ${PHONE_NUMBER}`);
    console.log(`   Agent ID: ${GRANITE_AGENT_ID}`);

    // Update the Twilio number configuration
    const updatedNumber = await client
      .incomingPhoneNumbers(PHONE_NUMBER_SID)
      .update({
        friendlyName: 'Surprise Granite - AI Front Desk',

        // Voice call configuration - Forward to ElevenLabs agent
        voiceUrl: `https://api.elevenlabs.io/v1/convai/twilio/inbound-call?agent_id=${GRANITE_AGENT_ID}`,
        voiceMethod: 'POST',
        voiceFallbackUrl: `${WEBHOOK_URL}/api/webhooks/twilio/voice-fallback`,
        voiceFallbackMethod: 'POST',

        // SMS configuration - Forward to webhook
        smsUrl: `${WEBHOOK_URL}/api/webhooks/twilio/sms`,
        smsMethod: 'POST',
        smsFallbackUrl: `${WEBHOOK_URL}/api/webhooks/twilio/sms-fallback`,
        smsFallbackMethod: 'POST',

        // Status callbacks
        statusCallback: `${WEBHOOK_URL}/api/webhooks/twilio/status`,
        statusCallbackMethod: 'POST'
      });

    console.log('✅ Twilio forwarding configured successfully!');
    console.log('\n📱 Configuration Details:');
    console.log(`   Phone Number: ${updatedNumber.phoneNumber}`);
    console.log(`   Friendly Name: ${updatedNumber.friendlyName}`);
    console.log(`   Voice URL: ${updatedNumber.voiceUrl}`);
    console.log(`   SMS URL: ${updatedNumber.smsUrl}`);

    console.log('\n🎯 Testing Instructions:');
    console.log(`\n1. Call ${PHONE_NUMBER} to test the AI agent`);
    console.log('2. The call will be answered by the Surprise Granite AI receptionist');
    console.log('3. Try asking about:');
    console.log('   - Countertop materials available');
    console.log('   - Scheduling a free in-home consultation');
    console.log('   - Pricing information');
    console.log('   - Kitchen or bathroom remodeling');
    console.log('4. Test the human handoff by asking to speak with someone');

    console.log('\n💡 SMS Feature:');
    console.log(`   Send a text to ${PHONE_NUMBER} to interact via SMS`);
    console.log('   The agent can also send appointment confirmations via text');

    console.log('\n📋 Add to .env file if not already there:');
    console.log(`GRANITE_PHONE_NUMBER=${PHONE_NUMBER}`);
    console.log(`ELEVENLABS_GRANITE_AGENT_ID=${GRANITE_AGENT_ID}`);

    return updatedNumber;

  } catch (error) {
    console.error('❌ Error setting up Twilio forwarding:', error);

    if (error.code === 20404) {
      console.error('\n💡 Phone number SID not found. Available numbers:');
      const numbers = await client.incomingPhoneNumbers.list();
      numbers.forEach(num => {
        console.log(`   ${num.phoneNumber} (${num.sid})`);
      });
    }

    throw error;
  }
}

// Run the setup
setupGraniteForwarding()
  .then(() => {
    console.log('\n✨ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });
