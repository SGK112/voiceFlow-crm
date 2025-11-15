import axios from 'axios';
import 'dotenv/config';

const N8N_API_URL = process.env.N8N_API_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;

/**
 * Creates an n8n workflow that listens to ElevenLabs conversation events
 * and triggers SMS/email based on keywords in the conversation.
 *
 * This workflow eliminates the need for ElevenLabs client tools (which can't
 * be configured via API) and provides full automation for the plug-and-play system.
 */

const workflow = {
  name: 'ElevenLabs SMS/Email Automation',
  nodes: [
    // Webhook node - receives ElevenLabs conversation events
    {
      parameters: {
        httpMethod: 'POST',
        path: 'elevenlabs-conversation',
        responseMode: 'responseNode',
        options: {}
      },
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [250, 300]
    },

    // Function node - extract conversation data
    {
      parameters: {
        functionCode: `
// Extract conversation data from ElevenLabs webhook
const event = $input.item.json;

// Get transcript from various event types
let transcript = '';
let conversationId = event.conversation_id || '';
let phoneNumber = '';
let customerName = '';

// Extract transcript based on event type
if (event.type === 'agent.spoke' || event.type === 'user.spoke') {
  transcript = event.text || event.transcript || '';
} else if (event.transcript) {
  transcript = event.transcript;
}

// Try to extract phone number from transcript or metadata
const phoneMatch = transcript.match(/\\+?1?\\d{10}/);
if (phoneMatch) {
  phoneNumber = phoneMatch[0];
}

// Try to extract customer name from transcript
const nameMatch = transcript.match(/(?:my name is|I'm|I am)\\s+([A-Z][a-z]+)/i);
if (nameMatch) {
  customerName = nameMatch[1];
}

return {
  json: {
    conversationId,
    transcript,
    phoneNumber,
    customerName,
    rawEvent: event
  }
};
`
      },
      name: 'Extract Data',
      type: 'n8n-nodes-base.function',
      typeVersion: 1,
      position: [450, 300]
    },

    // IF node - check for SMS trigger keywords
    {
      parameters: {
        conditions: {
          string: [
            {
              value1: '={{$json.transcript}}',
              operation: 'regex',
              value2: '/(can you )?(text|send)( me)?( the)?( link| signup)?/i'
            }
          ]
        }
      },
      name: 'Check for SMS Request',
      type: 'n8n-nodes-base.if',
      typeVersion: 1,
      position: [650, 300]
    },

    // HTTP Request - Send SMS via backend API
    {
      parameters: {
        method: 'POST',
        url: `${process.env.WEBHOOK_URL || 'https://f66af302a875.ngrok-free.app'}/api/webhooks/elevenlabs/send-signup-link`,
        bodyParameters: {
          parameters: [
            {
              name: 'phone_number',
              value: '={{$json.phoneNumber}}'
            },
            {
              name: 'customer_name',
              value: '={{$json.customerName}}'
            }
          ]
        },
        options: {}
      },
      name: 'Send SMS',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 2,
      position: [850, 250]
    },

    // IF node - check for email trigger (conversation ended)
    {
      parameters: {
        conditions: {
          string: [
            {
              value1: '={{$json.rawEvent.type}}',
              value2: 'conversation.ended'
            }
          ]
        }
      },
      name: 'Check Conversation Ended',
      type: 'n8n-nodes-base.if',
      typeVersion: 1,
      position: [650, 500]
    },

    // HTTP Request - Send post-call email
    {
      parameters: {
        method: 'POST',
        url: `${process.env.WEBHOOK_URL || 'https://f66af302a875.ngrok-free.app'}/api/webhooks/elevenlabs/post-call-followup`,
        bodyParameters: {
          parameters: [
            {
              name: 'conversation_id',
              value: '={{$json.conversationId}}'
            },
            {
              name: 'customer_email',
              value: '={{$json.customerEmail}}'
            },
            {
              name: 'customer_name',
              value: '={{$json.customerName}}'
            }
          ]
        },
        options: {}
      },
      name: 'Send Email',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 2,
      position: [850, 450]
    },

    // Respond to webhook
    {
      parameters: {
        respondWith: 'json',
        responseBody: '={"status": "success", "message": "Event processed"}'
      },
      name: 'Respond',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1,
      position: [1050, 300]
    }
  ],
  connections: {
    'Webhook': {
      main: [[{
        node: 'Extract Data',
        type: 'main',
        index: 0
      }]]
    },
    'Extract Data': {
      main: [[
        {
          node: 'Check for SMS Request',
          type: 'main',
          index: 0
        },
        {
          node: 'Check Conversation Ended',
          type: 'main',
          index: 0
        }
      ]]
    },
    'Check for SMS Request': {
      main: [[{
        node: 'Send SMS',
        type: 'main',
        index: 0
      }]]
    },
    'Send SMS': {
      main: [[{
        node: 'Respond',
        type: 'main',
        index: 0
      }]]
    },
    'Check Conversation Ended': {
      main: [[{
        node: 'Send Email',
        type: 'main',
        index: 0
      }]]
    },
    'Send Email': {
      main: [[{
        node: 'Respond',
        type: 'main',
        index: 0
      }]]
    }
  },
  settings: {
    saveExecutionProgress: true,
    saveManualExecutions: true,
    saveDataErrorExecution: 'all',
    saveDataSuccessExecution: 'all',
    executionTimeout: 3600,
    timezone: 'America/Denver'
  },
  staticData: null,
  tags: ['elevenlabs', 'sms', 'email', 'automation']
};

async function createWorkflow() {
  try {
    console.log('🔧 Creating n8n workflow for ElevenLabs SMS/Email automation...\n');

    if (!N8N_API_KEY) {
      console.log('⚠️  N8N_API_KEY not set. Workflow JSON created but not deployed.');
      console.log('   To deploy manually:');
      console.log('   1. Go to n8n dashboard');
      console.log('   2. Create new workflow');
      console.log('   3. Import JSON from scripts/n8n-workflows/elevenlabs-sms-automation.json\n');

      // Save workflow JSON for manual import
      const fs = await import('fs');
      const path = await import('path');
      const workflowDir = path.join(process.cwd(), 'scripts', 'n8n-workflows');

      if (!fs.existsSync(workflowDir)) {
        fs.mkdirSync(workflowDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(workflowDir, 'elevenlabs-sms-automation.json'),
        JSON.stringify(workflow, null, 2)
      );

      console.log('✅ Workflow JSON saved to: scripts/n8n-workflows/elevenlabs-sms-automation.json\n');
      return;
    }

    // Create workflow via n8n API
    const response = await axios.post(
      `${N8N_API_URL}/api/v1/workflows`,
      workflow,
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ n8n workflow created successfully!\n');
    console.log('📋 Workflow Details:');
    console.log(`   Name: ${workflow.name}`);
    console.log(`   Webhook URL: ${N8N_API_URL}/webhook/elevenlabs-conversation`);
    console.log(`   Workflow ID: ${response.data.id}\n`);

    console.log('🎯 Next Steps:');
    console.log('   1. Activate the workflow in n8n dashboard');
    console.log('   2. Configure ElevenLabs agent to send conversation events to:');
    console.log(`      ${N8N_API_URL}/webhook/elevenlabs-conversation`);
    console.log('   3. Test with a phone call!\n');

    console.log('📝 How it works:');
    console.log('   • ElevenLabs sends conversation events to n8n webhook');
    console.log('   • n8n detects keywords like "text me" or "send link"');
    console.log('   • n8n triggers backend SMS/email endpoints');
    console.log('   • Full automation without ElevenLabs client tools!\n');

  } catch (error) {
    console.error('❌ Error creating workflow:', error.response?.data || error.message);
    process.exit(1);
  }
}

createWorkflow();
