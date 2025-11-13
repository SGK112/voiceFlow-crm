import twilio from 'twilio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const elevenLabsAgentId = 'agent_9701k9xptd0kfr383djx5zk7300x';

const client = twilio(accountSid, authToken);

// Test phone number
const testPhoneNumber = '+14802555887';

console.log('🧪 Testing Twilio Integration...\n');
console.log('Twilio Phone Number:', twilioPhoneNumber);
console.log('Test Number:', testPhoneNumber);
console.log('ElevenLabs Agent ID:', elevenLabsAgentId);
console.log('\n' + '='.repeat(50) + '\n');

// Test 1: Send SMS
async function sendTestSMS() {
  try {
    console.log('📱 Sending SMS...');

    const message = await client.messages.create({
      body: '🎙️ Hello from VoiceFlow CRM! This is a test message from your AI assistant. Your voice AI system is ready to go! Reply to chat with us.',
      from: twilioPhoneNumber,
      to: testPhoneNumber
    });

    console.log('✅ SMS sent successfully!');
    console.log('   Message SID:', message.sid);
    console.log('   Status:', message.status);
    console.log('   Body:', message.body);

    return message;
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    throw error;
  }
}

// Test 2: Make Voice Call with ElevenLabs
async function makeTestCall() {
  try {
    console.log('\n📞 Making voice call with ElevenLabs AI agent...');

    // Generate TwiML for ElevenLabs WebSocket connection
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    // Add a greeting first
    response.say({
      voice: 'alice'
    }, 'Hello! Connecting you to our AI assistant.');

    // Connect to ElevenLabs via WebSocket
    const connect = response.connect();
    connect.stream({
      url: `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${elevenLabsAgentId}`,
      parameters: {
        api_key: process.env.ELEVENLABS_API_KEY
      }
    });

    const twiml = response.toString();

    // For testing, we'll just show the TwiML instead of making actual call
    // To make actual call, uncomment the code below
    console.log('📋 Generated TwiML:');
    console.log(twiml);

    // Make actual call:
    const call = await client.calls.create({
      twiml: twiml,
      from: twilioPhoneNumber,
      to: testPhoneNumber,
      statusCallback: `${process.env.API_URL || 'http://localhost:5001'}/api/webhooks/twilio/call-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });

    console.log('✅ Call initiated successfully!');
    console.log('   Call SID:', call.sid);
    console.log('   Status:', call.status);
    console.log('   From:', call.from);
    console.log('   To:', call.to);
    console.log('\n📱 Your phone should ring shortly! Answer to talk with the ElevenLabs AI agent.');

    return call;

  } catch (error) {
    console.error('❌ Error making call:', error.message);
    throw error;
  }
}

// Run tests
async function runTests() {
  try {
    // Test 1: Send SMS
    await sendTestSMS();

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Voice Call (just show TwiML for now)
    await makeTestCall();

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ All tests completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Check your phone for the SMS');
    console.log('   2. To make actual call, uncomment the call code in test-twilio.js');
    console.log('   3. Configure ElevenLabs agent webhooks if needed');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run all tests
runTests();
