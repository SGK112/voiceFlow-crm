import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const AGENT_ID = process.env.ELEVENLABS_DEMO_AGENT_ID || 'agent_9301k802kktwfbhrbe9bam7f1spe';
const API_KEY = process.env.ELEVENLABS_API_KEY;

async function disableAgentSMS() {
  try {
    console.log(`\n🔍 Fetching agent configuration for: ${AGENT_ID}\n`);

    // Get current agent configuration
    const response = await axios.get(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        headers: {
          'xi-api-key': API_KEY
        }
      }
    );

    const agent = response.data;
    console.log(`📋 Agent Name: ${agent.name}`);
    console.log(`📋 Agent ID: ${agent.agent_id}`);

    // Check if agent has client tools (SMS/MMS capabilities)
    const clientTools = agent.conversation_config?.client_tools || [];
    console.log(`\n🛠️  Client Tools: ${clientTools.length > 0 ? clientTools.map(t => t.name).join(', ') : 'None'}`);

    // Check the prompt for SMS/MMS references
    const prompt = agent.prompt?.prompt || '';
    const hasSMSReferences = prompt.toLowerCase().includes('sms') || prompt.toLowerCase().includes('text message');

    console.log(`\n📝 Prompt contains SMS references: ${hasSMSReferences ? 'YES' : 'NO'}`);

    if (clientTools.length > 0 || hasSMSReferences) {
      console.log('\n⚠️  This agent has SMS/MMS capabilities that may not be working.');
      console.log('\n🔧 RECOMMENDED ACTIONS:');
      console.log('   1. Remove client_tools from agent configuration');
      console.log('   2. Update prompt to remove SMS/MMS instructions');
      console.log('\n💡 To disable SMS/MMS:');
      console.log('   - Edit agent in ElevenLabs dashboard');
      console.log('   - Remove any "Client Tools" configured');
      console.log('   - Update prompt to remove SMS/MMS references');
      console.log(`   - Dashboard: https://elevenlabs.io/app/conversational-ai/agent/${AGENT_ID}`);
    } else {
      console.log('\n✅ Agent does not have SMS/MMS capabilities - all good!');
    }

    // Display current prompt (first 500 chars)
    console.log(`\n📄 Current Prompt (first 500 chars):`);
    console.log('─'.repeat(80));
    console.log(prompt.substring(0, 500));
    if (prompt.length > 500) {
      console.log(`... (${prompt.length - 500} more characters)`);
    }
    console.log('─'.repeat(80));

    // Display client tools if any
    if (clientTools.length > 0) {
      console.log(`\n🛠️  Client Tools Configuration:`);
      clientTools.forEach((tool, i) => {
        console.log(`\n   Tool ${i + 1}: ${tool.name}`);
        console.log(`   Description: ${tool.description || 'N/A'}`);
        if (tool.parameters) {
          console.log(`   Parameters:`, JSON.stringify(tool.parameters, null, 2));
        }
      });
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

disableAgentSMS();
