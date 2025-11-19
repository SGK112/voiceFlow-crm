import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PHONE_ID = 'phnum_2701kacmjq23fzaacdgqwt0qty0b';
const AGENT_ID = 'agent_4401kacmh26fet9asap21g1516p5';
const WEBHOOK_URL = 'https://f66af302a875.ngrok-free.app/api/webhooks/call-completed';

console.log('🔧 Fixing phone number assignment and webhook...\n');
console.log('   Phone ID:', PHONE_ID);
console.log('   Agent ID:', AGENT_ID);
console.log('   Webhook URL:', WEBHOOK_URL);
console.log('');

try {
  // Assign phone to agent with webhook
  const response = await axios.patch(
    `https://api.elevenlabs.io/v1/convai/phone-numbers/${PHONE_ID}`,
    {
      agent_id: AGENT_ID,
      webhook_url: WEBHOOK_URL
    },
    {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('✅ Phone number assigned successfully!');
  console.log('');

  // Verify the assignment
  const verifyResponse = await axios.get(
    `https://api.elevenlabs.io/v1/convai/phone-numbers/${PHONE_ID}`,
    { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY } }
  );

  const phone = verifyResponse.data;

  console.log('📞 Verification:');
  console.log('   Number:', phone.number);
  console.log('   Agent ID:', phone.agent_id);
  console.log('   Webhook URL:', phone.webhook_url);
  console.log('');

  if (phone.agent_id === AGENT_ID && phone.webhook_url === WEBHOOK_URL) {
    console.log('✅ CONFIGURATION SUCCESSFUL!');
    console.log('');
    console.log('📞 Test the system:');
    console.log('   1. Call (602) 833-7194');
    console.log('   2. Have a conversation with the agent');
    console.log('   3. Book a consultation (provide email, date, time)');
    console.log('   4. When call ends, webhook will fire');
    console.log('   5. Check your email for calendar invite');
    console.log('');
    console.log('🔍 Monitor webhook activity:');
    console.log('   - Check backend logs for "📞 Received call completion webhook"');
    console.log('   - Check for "✅ Call saved"');
    console.log('   - Check for "📧 Sending consultation confirmation"');
  } else {
    console.log('⚠️  Warning: Configuration may not have applied correctly');
  }

} catch (error) {
  console.error('❌ Error:', error.response?.data || error.message);
  console.error('');
  console.error('Full error:', error.response?.data);
}
