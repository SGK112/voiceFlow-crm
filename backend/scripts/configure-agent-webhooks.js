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
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://f66af302a875.ngrok-free.app';

// Webhook tools for Marketing Demo Agent (has customer info from form)
const demoAgentTools = [
  {
    type: 'webhook',
    name: 'send_signup_link',
    description: 'Send signup link to customer via email when they say "send me the link", "sign me up", "email me", or similar phrases',
    config: {
      url: `${WEBHOOK_URL}/api/agent-webhooks/send-signup-link`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    parameters: {
      type: 'object',
      properties: {
        customer_name: {
          type: 'string',
          description: 'Customer name from the conversation or dynamic variable {{customer_name}}'
        },
        customer_email: {
          type: 'string',
          description: 'Customer email from dynamic variable {{lead_email}} or collected during conversation'
        },
        customer_phone: {
          type: 'string',
          description: 'Customer phone number from dynamic variable {{lead_phone}}'
        },
        call_id: {
          type: 'string',
          description: 'The current call ID for tracking'
        }
      },
      required: ['customer_email']
    }
  },
  {
    type: 'webhook',
    name: 'book_appointment',
    description: 'Book an appointment when customer wants to schedule a call, demo, or consultation',
    config: {
      url: `${WEBHOOK_URL}/api/agent-webhooks/book-appointment`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    parameters: {
      type: 'object',
      properties: {
        customer_name: {
          type: 'string',
          description: 'Customer name from {{customer_name}} or conversation'
        },
        customer_email: {
          type: 'string',
          description: 'Customer email from {{lead_email}}'
        },
        customer_phone: {
          type: 'string',
          description: 'Customer phone number from {{lead_phone}}'
        },
        appointment_date: {
          type: 'string',
          description: 'Appointment date in format YYYY-MM-DD'
        },
        appointment_time: {
          type: 'string',
          description: 'Appointment time in format HH:MM AM/PM'
        },
        appointment_type: {
          type: 'string',
          description: 'Type of appointment (Demo, Consultation, Follow-up, etc.)'
        },
        notes: {
          type: 'string',
          description: 'Any additional notes about the appointment'
        },
        call_id: {
          type: 'string',
          description: 'The current call ID for tracking'
        }
      },
      required: ['customer_email', 'appointment_date', 'appointment_time']
    }
  }
];

// Webhook tools for SMS Demo Agent (needs to collect customer info first)
const smsAgentTools = [
  {
    type: 'webhook',
    name: 'collect_lead_info',
    description: 'Store customer information collected during the call when you have gathered their name, email, phone, and business type',
    config: {
      url: `${WEBHOOK_URL}/api/agent-webhooks/collect-lead-info`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    parameters: {
      type: 'object',
      properties: {
        customer_name: {
          type: 'string',
          description: 'Customer name collected during conversation'
        },
        customer_email: {
          type: 'string',
          description: 'Customer email collected during conversation'
        },
        customer_phone: {
          type: 'string',
          description: 'Customer phone number from {{customer_phone}} or collected during conversation'
        },
        business_type: {
          type: 'string',
          description: 'Type of business (contractor, plumber, electrician, etc.)'
        },
        interested_in: {
          type: 'string',
          description: 'What features they are interested in'
        },
        notes: {
          type: 'string',
          description: 'Any additional notes from the conversation'
        },
        call_id: {
          type: 'string',
          description: 'The current call ID for tracking'
        }
      },
      required: ['customer_name', 'customer_phone']
    }
  },
  {
    type: 'webhook',
    name: 'send_signup_link',
    description: 'Send signup link to customer via email when they say "send me the link", "sign me up", "email me", or similar phrases. Make sure you have collected their email first.',
    config: {
      url: `${WEBHOOK_URL}/api/agent-webhooks/send-signup-link`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    parameters: {
      type: 'object',
      properties: {
        customer_name: {
          type: 'string',
          description: 'Customer name collected during conversation'
        },
        customer_email: {
          type: 'string',
          description: 'Customer email collected during conversation'
        },
        customer_phone: {
          type: 'string',
          description: 'Customer phone number from {{customer_phone}}'
        },
        call_id: {
          type: 'string',
          description: 'The current call ID for tracking'
        }
      },
      required: ['customer_email']
    }
  },
  {
    type: 'webhook',
    name: 'book_appointment',
    description: 'Book an appointment when customer wants to schedule a call, demo, or consultation',
    config: {
      url: `${WEBHOOK_URL}/api/agent-webhooks/book-appointment`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    parameters: {
      type: 'object',
      properties: {
        customer_name: {
          type: 'string',
          description: 'Customer name collected during conversation'
        },
        customer_email: {
          type: 'string',
          description: 'Customer email collected during conversation'
        },
        customer_phone: {
          type: 'string',
          description: 'Customer phone number from {{customer_phone}}'
        },
        appointment_date: {
          type: 'string',
          description: 'Appointment date in format YYYY-MM-DD'
        },
        appointment_time: {
          type: 'string',
          description: 'Appointment time in format HH:MM AM/PM'
        },
        appointment_type: {
          type: 'string',
          description: 'Type of appointment (Demo, Consultation, Follow-up, etc.)'
        },
        notes: {
          type: 'string',
          description: 'Any additional notes about the appointment'
        },
        call_id: {
          type: 'string',
          description: 'The current call ID for tracking'
        }
      },
      required: ['customer_email', 'appointment_date', 'appointment_time']
    }
  }
];

async function configureAgentWebhooks(agentId, agentName, tools) {
  try {
    console.log(`\n🔧 Configuring webhooks for ${agentName} (${agentId})...`);

    // Get current agent configuration
    const getResponse = await axios.get(
      `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
      { headers: { 'xi-api-key': API_KEY } }
    );

    const currentAgent = getResponse.data;
    console.log(`📋 Current Agent: ${currentAgent.name}`);

    // Update agent with client tools
    const updatedConfig = {
      ...currentAgent,
      conversation_config: {
        ...currentAgent.conversation_config,
        agent: {
          ...currentAgent.conversation_config.agent,
          prompt: {
            ...currentAgent.conversation_config.agent.prompt,
            tools: tools
          }
        }
      }
    };

    const updateResponse = await axios.patch(
      `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
      updatedConfig,
      {
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Webhooks configured successfully!`);
    console.log(`\n🔧 Configured ${tools.length} webhook tools:`);
    tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name} - ${tool.description.substring(0, 60)}...`);
    });

    return updateResponse.data;

  } catch (error) {
    console.error(`\n❌ Error configuring ${agentName}:`, error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

async function main() {
  console.log(`\n🚀 Configuring ElevenLabs Agent Webhooks...`);
  console.log(`📍 Webhook Base URL: ${WEBHOOK_URL}\n`);

  try {
    // Configure Marketing Demo Agent
    await configureAgentWebhooks(
      DEMO_AGENT_ID,
      'Marketing Demo Agent',
      demoAgentTools
    );

    // Configure SMS Demo Agent
    await configureAgentWebhooks(
      SMS_AGENT_ID,
      'SMS Demo Agent',
      smsAgentTools
    );

    console.log(`\n✅ All agents configured successfully!\n`);
    console.log(`📝 Next steps:`);
    console.log(`   1. Test calling the marketing agent with form data`);
    console.log(`   2. During the call, say "send me the link" to trigger webhook`);
    console.log(`   3. Test SMS-triggered calls and say "send me the link"`);
    console.log(`   4. Try booking an appointment with either agent\n`);

  } catch (error) {
    console.error('\n❌ Configuration failed');
    process.exit(1);
  }
}

main();
