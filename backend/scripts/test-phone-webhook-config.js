import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PHONE_ID = 'phnum_2701kacmjq23fzaacdgqwt0qty0b';
const AGENT_ID = 'agent_4401kacmh26fet9asap21g1516p5';

console.log('🔍 Testing phone number and webhook configuration...\n');

try {
  // Check phone number configuration
  const phoneResponse = await axios.get(
    `https://api.elevenlabs.io/v1/convai/phone-numbers/${PHONE_ID}`,
    { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY } }
  );

  const phone = phoneResponse.data;

  console.log('📞 Phone Number Configuration:');
  console.log('   Number:', phone.number);
  console.log('   Agent ID:', phone.agent_id || '❌ NOT ASSIGNED');
  console.log('   Webhook URL:', phone.webhook_url || '❌ NOT CONFIGURED');
  console.log('   Status:', phone.agent_id === AGENT_ID ? '✅ CORRECT AGENT' : '⚠️ WRONG AGENT');

  if (!phone.webhook_url) {
    console.log('\n⚠️  PROBLEM: No webhook URL configured!');
    console.log('   Webhooks will NOT fire on call completion.');
  } else if (!phone.webhook_url.includes('call-completed')) {
    console.log('\n⚠️  PROBLEM: Webhook URL is wrong!');
    console.log('   Expected: /api/webhooks/call-completed');
    console.log('   Got:', phone.webhook_url);
  } else {
    console.log('\n✅ Webhook is properly configured!');
  }

  if (phone.agent_id !== AGENT_ID) {
    console.log('\n⚠️  PROBLEM: Phone assigned to wrong agent or no agent!');
    console.log('   Expected:', AGENT_ID);
    console.log('   Got:', phone.agent_id);
  } else {
    console.log('✅ Phone assigned to correct agent!');
  }

  // Check agent configuration
  console.log('\n🤖 Checking agent configuration...');
  const agentResponse = await axios.get(
    `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
    { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY } }
  );

  const agent = agentResponse.data;
  console.log('   Agent Name:', agent.name);
  console.log('   Voice ID:', agent.conversation_config?.tts?.voice_id);
  console.log('   Model:', agent.conversation_config?.tts?.model_id);

  // Summary
  console.log('\n📋 SUMMARY:');
  const phoneOk = phone.agent_id === AGENT_ID;
  const webhookOk = phone.webhook_url && phone.webhook_url.includes('call-completed');

  if (phoneOk && webhookOk) {
    console.log('✅ EVERYTHING IS CONFIGURED CORRECTLY!');
    console.log('\n📞 You can test by calling: (602) 833-7194');
    console.log('   When the call completes, webhook will fire to:');
    console.log('   ' + phone.webhook_url);
  } else {
    console.log('❌ CONFIGURATION ISSUES FOUND:');
    if (!phoneOk) console.log('   - Phone not assigned to correct agent');
    if (!webhookOk) console.log('   - Webhook URL not configured or incorrect');
    console.log('\n🔧 Run the fix script to correct this.');
  }

} catch (error) {
  console.error('❌ Error:', error.response?.data || error.message);
}
