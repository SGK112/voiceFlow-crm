import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

/**
 * ElevenLabs Webhook Configuration Script
 *
 * This script helps diagnose and configure webhook settings for post-call emails.
 *
 * Note: Workspace-level webhooks must be configured through the dashboard at:
 * https://elevenlabs.io/app/conversational-ai/settings
 *
 * However, this script:
 * 1. Tests if your webhook URL is publicly accessible
 * 2. Verifies agent configuration
 * 3. Provides alternative solutions
 */

async function configureWebhookSettings() {
  try {
    console.log('🔍 ElevenLabs Webhook Configuration Helper\n');

    const WEBHOOK_URL = process.env.WEBHOOK_URL || process.env.BASE_URL;
    const AGENT_ID = process.env.ELEVENLABS_DEMO_AGENT_ID;
    const API_KEY = process.env.ELEVENLABS_API_KEY;

    console.log('📋 Current Configuration:');
    console.log(`   Webhook URL: ${WEBHOOK_URL}`);
    console.log(`   Agent ID: ${AGENT_ID}`);
    console.log('');

    // Test 1: Check if webhook URL is accessible
    console.log('1️⃣ Testing webhook URL accessibility...');
    try {
      const testUrl = `${WEBHOOK_URL}/api/webhooks/elevenlabs/conversation-event`;
      const response = await axios.post(testUrl, {
        test: true,
        event_type: 'test'
      }, {
        timeout: 5000,
        validateStatus: () => true // Accept any status
      });

      if (response.status === 200 || response.status === 404) {
        console.log(`   ✅ Webhook URL is accessible (status: ${response.status})`);
      } else {
        console.log(`   ⚠️  Webhook returned status: ${response.status}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('   ❌ Webhook URL is NOT accessible (connection refused)');
        console.log('   💡 This is likely why emails aren\'t being sent');
        console.log('');
        console.log('   Solutions:');
        console.log('   1. Start ngrok: ngrok http 5001');
        console.log('   2. Update WEBHOOK_URL in .env with the ngrok URL');
        console.log('   3. OR use a production deployment with a public URL');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('   ❌ Webhook URL timed out');
      } else {
        console.log(`   ❌ Error testing webhook: ${error.message}`);
      }
    }

    // Test 2: Verify agent exists
    console.log('\n2️⃣ Verifying agent configuration...');
    try {
      const response = await axios.get(
        `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
        {
          headers: {
            'xi-api-key': API_KEY
          }
        }
      );

      console.log(`   ✅ Agent found: ${response.data.name || 'Demo Agent'}`);
      console.log(`   Voice ID: ${response.data.conversation_config?.tts?.voice_id}`);
    } catch (error) {
      console.log(`   ❌ Error fetching agent: ${error.response?.data?.detail || error.message}`);
    }

    // Provide recommendations
    console.log('\n📝 RECOMMENDATIONS:\n');
    console.log('Option 1: Use Per-Call Webhooks (Current Approach)');
    console.log('   ✓ Already implemented in code');
    console.log('   ✓ Webhook URL passed with each call');
    console.log('   ✗ Requires publicly accessible URL (ngrok or production)');
    console.log('');
    console.log('Option 2: Configure Workspace Webhooks (Dashboard)');
    console.log('   ✓ Works for all calls automatically');
    console.log('   ✓ One-time configuration');
    console.log('   ✗ Must be done through dashboard (no API)');
    console.log('   → Visit: https://elevenlabs.io/app/conversational-ai/settings');
    console.log('');
    console.log('Option 3: Use Alternative Approach');
    console.log('   ✓ Poll for call completion instead of webhooks');
    console.log('   ✓ Works without public URL');
    console.log('   ✗ Adds delay (not real-time)');
    console.log('');

    console.log('💡 IMMEDIATE SOLUTION:');
    console.log('   To enable webhooks right now:');
    console.log('   1. Run: ngrok http 5001');
    console.log('   2. Copy the https:// URL from ngrok');
    console.log('   3. Update .env: WEBHOOK_URL=<your-ngrok-url>');
    console.log('   4. Restart the server');
    console.log('   5. Test the demo call again');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

configureWebhookSettings();
