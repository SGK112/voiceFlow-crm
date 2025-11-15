import axios from 'axios';
import 'dotenv/config';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = 'agent_9701k9xptd0kfr383djx5zk7300x';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://f66af302a875.ngrok-free.app';

async function configureWebhook() {
  try {
    console.log('🔧 Configuring agent webhook URL...\n');

    // First, get current agent config
    const getResponse = await axios.get(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      }
    );

    const currentConfig = getResponse.data;
    console.log('Current agent config keys:', Object.keys(currentConfig));
    console.log('Conversation config keys:', Object.keys(currentConfig.conversation_config || {}));

    // Remove conflicting tools array if tool_ids is set
    const agentPrompt = { ...currentConfig.conversation_config.agent.prompt };
    if (agentPrompt.tool_ids && agentPrompt.tool_ids.length > 0) {
      delete agentPrompt.tools;
    }

    // Update with webhook URL
    const updatePayload = {
      conversation_config: {
        ...currentConfig.conversation_config,
        agent: {
          ...currentConfig.conversation_config.agent,
          prompt: agentPrompt
        },
        webhook: {
          url: `${WEBHOOK_URL}/api/webhooks/elevenlabs/conversation-event`,
          events_to_send: ['conversation.started', 'conversation.ended', 'agent.tool_called', 'tool.called', 'user.spoke', 'agent.spoke']
        }
      }
    };

    console.log('\n📤 Sending update with webhook:', updatePayload.conversation_config.webhook);

    const response = await axios.patch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      updatePayload,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Webhook configured successfully!');
    console.log(`   URL: ${WEBHOOK_URL}/api/webhooks/elevenlabs/conversation-event`);
    console.log('   Events: conversation.started, conversation.ended, agent.tool_called, tool.called\n');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

configureWebhook();
