import axios from 'axios';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

async function restoreFromTemplate(agentId, templateName = 'demo-agent-template') {
  try {
    console.log('📋 Restoring Agent from Template...\n');

    // Load template
    const templatePath = path.join(__dirname, 'templates', `${templateName}.json`);
    const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

    console.log(`Template: ${template.name}`);
    console.log(`Description: ${template.description}`);
    console.log(`Status: ${template.status}\n`);

    // Apply configuration to agent
    const response = await axios.patch(
      `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
      template.configuration,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Agent restored from template!\n');
    console.log('📋 Configuration Applied:');
    console.log(`  • First Message: ${template.configuration.conversation_config.agent.first_message}`);
    console.log(`  • Tool: ${template.configuration.conversation_config.agent.prompt.tools[0].name}`);
    console.log(`  • Auto SMS: ${template.backend_configuration.auto_sms_on_call_start}`);
    console.log(`  • SMS Method: ${template.backend_configuration.sms_via_webhook_only ? 'Webhook Only' : 'Auto + Webhook'}\n`);

    console.log('🧪 How to Test:');
    template.testing_instructions.how_to_test.forEach(step => {
      console.log(`  ${step}`);
    });

    console.log(`\n💡 Expected: ${template.testing_instructions.expected_behavior}`);
    console.log(`🎯 Wow Factor: ${template.testing_instructions.wow_factor}\n`);

  } catch (error) {
    console.error('❌ Failed to restore template:');
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Get agent ID from command line or use default
const agentId = process.argv[2] || process.env.MARKETING_AGENT_ID || 'agent_9701k9xptd0kfr383djx5zk7300x';
const templateName = process.argv[3] || 'demo-agent-template';

console.log(`Restoring agent ${agentId} from template ${templateName}...\n`);
restoreFromTemplate(agentId, templateName);
