import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const DEMO_AGENT_ID = process.env.ELEVENLABS_DEMO_AGENT_ID;
const API_KEY = process.env.ELEVENLABS_API_KEY;

async function debugAgentConfig() {
  try {
    console.log(`\n🔍 Fetching full agent configuration...`);

    const response = await axios.get(
      `https://api.elevenlabs.io/v1/convai/agents/${DEMO_AGENT_ID}`,
      { headers: { 'xi-api-key': API_KEY } }
    );

    const agent = response.data;

    console.log(`\n📋 Agent: ${agent.name}`);
    console.log(`\n🔧 Full conversation_config structure:`);
    console.log(JSON.stringify(agent.conversation_config, null, 2));

  } catch (error) {
    console.error(`\n❌ Error:`, error.response?.data || error.message);
  }
}

debugAgentConfig();
