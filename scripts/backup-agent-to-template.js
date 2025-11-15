import axios from 'axios';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

async function backupAgentToTemplate(agentId, templateName, description = '', status = 'WORKING ✅') {
  try {
    console.log('💾 Backing up Agent to Template...\n');
    console.log(`Agent ID: ${agentId}`);
    console.log(`Template Name: ${templateName}\n`);

    // Get current agent configuration
    const response = await axios.get(
      `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      }
    );

    const agentConfig = response.data;

    // Create template object
    const template = {
      name: templateName,
      description: description || `Backup of agent ${agentId}`,
      agent_id: agentId,
      configuration: {
        conversation_config: agentConfig.conversation_config
      },
      backend_configuration: {
        webhook_url: process.env.WEBHOOK_URL,
        auto_sms_on_call_start: false,
        sms_via_webhook_only: true,
        notes: "Configure backend based on this agent's tool usage"
      },
      testing_instructions: {
        how_to_test: [
          "1. Use restore-from-template.js to apply this configuration",
          "2. Test the agent according to its specific behavior",
          "3. Update these instructions based on agent purpose"
        ],
        expected_behavior: "Update with expected behavior",
        wow_factor: "Update with what makes this agent impressive"
      },
      created: new Date().toISOString().split('T')[0],
      last_tested: new Date().toISOString().split('T')[0],
      status: status
    };

    // Save to file
    const templatesDir = path.join(__dirname, 'templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    const templatePath = path.join(templatesDir, `${templateName}.json`);
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));

    console.log('✅ Agent backed up to template!\n');
    console.log(`📁 Template saved: ${templatePath}`);
    console.log(`📝 Prompt length: ${agentConfig.conversation_config?.agent?.prompt?.prompt?.length || 0} characters`);
    console.log(`🛠️  Tools: ${agentConfig.conversation_config?.agent?.prompt?.tools?.length || 0}`);

    if (agentConfig.conversation_config?.agent?.prompt?.tools?.length > 0) {
      console.log('\n🔧 Tools configured:');
      agentConfig.conversation_config.agent.prompt.tools.forEach((tool, i) => {
        console.log(`  ${i + 1}. ${tool.name} (${tool.type})`);
      });
    }

    console.log(`\n💡 To restore this template:`);
    console.log(`   node scripts/restore-from-template.js <agent_id> ${templateName}\n`);

  } catch (error) {
    console.error('❌ Failed to backup agent:');
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Get parameters from command line
const agentId = process.argv[2] || process.env.MARKETING_AGENT_ID || 'agent_9701k9xptd0kfr383djx5zk7300x';
const templateName = process.argv[3] || `agent-backup-${Date.now()}`;
const description = process.argv[4] || '';

backupAgentToTemplate(agentId, templateName, description);
