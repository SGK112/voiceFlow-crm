import axios from 'axios';
import 'dotenv/config';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const MARKETING_AGENT_ID = process.env.MARKETING_AGENT_ID || 'agent_9701k9xptd0kfr383djx5zk7300x';

async function checkAgentConfig() {
  try {
    console.log('🔍 Checking current agent configuration...\n');
    console.log(`Agent ID: ${MARKETING_AGENT_ID}\n`);

    const response = await axios.get(
      `https://api.elevenlabs.io/v1/convai/agents/${MARKETING_AGENT_ID}`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      }
    );

    const agent = response.data;

    console.log('📋 Agent Configuration:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('First Message:', agent.conversation_config?.agent?.first_message);
    console.log('\nLanguage:', agent.conversation_config?.agent?.language);
    console.log('\nTTS Model:', agent.conversation_config?.tts?.model_id);

    console.log('\n🛠️  Tools Configured:');
    const tools = agent.conversation_config?.agent?.prompt?.tools || [];
    const platformTools = agent.platform_settings?.tools || [];
    const toolIds = agent.conversation_config?.agent?.prompt?.tool_ids || [];

    if (tools.length > 0) {
      console.log('\n  📋 Prompt Tools:');
      tools.forEach((tool, i) => {
        console.log(`\n  Tool ${i + 1}:`);
        console.log(`    Type: ${tool.type}`);
        console.log(`    Name: ${tool.name}`);
        console.log(`    Description: ${tool.description}`);
        if (tool.url) {
          console.log(`    URL: ${tool.url}`);
        }
      });
    }

    if (platformTools.length > 0) {
      console.log('\n  🌐 Platform Tools:');
      platformTools.forEach((tool, i) => {
        console.log(`\n  Tool ${i + 1}:`);
        console.log(`    Type: ${tool.type}`);
        console.log(`    Name: ${tool.name}`);
      });
    }

    if (toolIds.length > 0) {
      console.log(`\n  🆔 Tool IDs: ${toolIds.join(', ')}`);
    }

    if (tools.length === 0 && platformTools.length === 0 && toolIds.length === 0) {
      console.log('  ⚠️  No tools configured!');
    }

    console.log('\n📝 Prompt Length:', agent.conversation_config?.agent?.prompt?.prompt?.length || 0, 'characters');

    console.log('\n✅ Agent configuration retrieved successfully!');

  } catch (error) {
    console.error('❌ Failed to get agent config:');
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

checkAgentConfig();
