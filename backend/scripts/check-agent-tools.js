import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const DEMO_AGENT_ID = process.env.ELEVENLABS_DEMO_AGENT_ID;
const SMS_AGENT_ID = process.env.ELEVENLABS_SMS_AGENT_ID;
const API_KEY = process.env.ELEVENLABS_API_KEY;

async function checkAgentTools(agentId, agentName) {
  try {
    console.log(`\n🔍 Checking ${agentName} (${agentId})...`);

    const response = await axios.get(
      `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
      { headers: { 'xi-api-key': API_KEY } }
    );

    const agent = response.data;

    console.log(`\n📋 Agent: ${agent.name}`);
    console.log(`🔧 Tools:`);

    const tools = agent.conversation_config?.agent?.prompt?.tools || [];

    if (tools.length === 0) {
      console.log(`   ❌ No tools configured`);
    } else {
      tools.forEach((tool, index) => {
        console.log(`\n   ${index + 1}. ${tool.name || 'Unnamed Tool'}`);
        console.log(`      Type: ${tool.type}`);
        console.log(`      URL: ${tool.config?.url || 'N/A'}`);
        console.log(`      Description: ${tool.description || 'N/A'}`);
      });
    }

    return agent;
  } catch (error) {
    console.error(`\n❌ Error checking ${agentName}:`, error.response?.data || error.message);
  }
}

async function main() {
  console.log(`\n🔍 Checking ElevenLabs Agent Webhook Configurations...\n`);

  await checkAgentTools(DEMO_AGENT_ID, 'Marketing Demo Agent');
  await checkAgentTools(SMS_AGENT_ID, 'SMS Demo Agent');

  console.log(`\n✅ Check complete!\n`);
}

main();
