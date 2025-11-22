/**
 * Call Using Dashboard-Configured Agent
 *
 * This script makes a call using an agent that was configured in the
 * ElevenLabs dashboard with tools already attached.
 *
 * SETUP REQUIRED:
 * 1. Go to https://elevenlabs.io/app/conversational-ai
 * 2. Create tools: send_sms, send_email, end_call
 * 3. Create agent and attach the tools
 * 4. Copy the agent ID and paste it below
 */

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import dotenv from 'dotenv';

dotenv.config();

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

// ⚠️ REPLACE THIS WITH YOUR AGENT ID FROM THE DASHBOARD
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID || 'YOUR_AGENT_ID_HERE';

async function makeCallWithDashboardAgent() {
  console.log('📞 Making call with dashboard-configured agent\n');
  console.log('Agent ID:', AGENT_ID);
  console.log('Target:', '+14802555887 (Josh)');
  console.log('\n');

  if (AGENT_ID === 'YOUR_AGENT_ID_HERE') {
    console.error('❌ ERROR: Please set ELEVENLABS_AGENT_ID in .env file\n');
    console.log('Steps to get agent ID:');
    console.log('1. Go to https://elevenlabs.io/app/conversational-ai');
    console.log('2. Create or select an agent');
    console.log('3. Copy the agent ID from the URL or settings');
    console.log('4. Add to .env: ELEVENLABS_AGENT_ID=agent_xxxxx');
    console.log('\nSee ELEVENLABS_TOOLS_SETUP.md for complete instructions.\n');
    process.exit(1);
  }

  try {
    const call = await client.conversationalAi.batchCalls.create({
      callName: 'Dashboard Agent Test Call',
      agentId: AGENT_ID,
      agentPhoneNumberId: process.env.ELEVENLABS_PHONE_NUMBER_ID,
      recipients: [
        {
          phoneNumber: '+14802555887'
        }
      ]
    });

    console.log('✅ Call initiated!');
    console.log('   Batch ID:', call.batchId);
    console.log('\n📱 Phone should ring shortly...');
    console.log('\n✨ If your agent has tools configured:');
    console.log('   - Watch for SMS during the call');
    console.log('   - Watch for email during the call');
    console.log('   - Call should end automatically');
    console.log('\n📊 Monitor backend logs for webhook activity.');

  } catch (error) {
    console.error('\n❌ Failed to make call:', error.message);
    if (error.body) {
      console.error('Details:', JSON.stringify(error.body, null, 2));
    }

    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify agent ID is correct');
    console.log('2. Check ELEVENLABS_API_KEY');
    console.log('3. Check ELEVENLABS_PHONE_NUMBER_ID');
    console.log('4. Ensure agent exists in dashboard');
    process.exit(1);
  }
}

makeCallWithDashboardAgent();
