import mongoose from 'mongoose';
import dotenv from 'dotenv';
import N8nWorkflow from './backend/models/N8nWorkflow.js';
import User from './backend/models/User.js';

dotenv.config();

const workflowTemplates = [
  {
    type: 'save_lead',
    name: 'Save Lead to CRM',
    category: 'crm',
    description: 'Automatically save call leads to CRM database',
    tags: ['lead', 'crm', 'automation'],
    workflowJson: {
      nodes: [
        {
          id: 'trigger-1',
          type: 'custom',
          data: {
            label: 'Webhook Trigger',
            icon: '⚡',
            color: '#10b981',
            description: 'Call completed'
          },
          position: { x: 100, y: 200 }
        },
        {
          id: 'action-1',
          type: 'custom',
          data: {
            label: 'Save Lead',
            icon: '📝',
            color: '#3b82f6',
            description: 'Save to database'
          },
          position: { x: 350, y: 200 }
        }
      ],
      connections: [
        {
          id: 'edge-1',
          source: 'trigger-1',
          target: 'action-1',
          type: 'smoothstep',
          animated: true
        }
      ]
    }
  },
  {
    type: 'send_sms',
    name: 'Send SMS After Call',
    category: 'communication',
    description: 'Send follow-up SMS to customer after call ends',
    tags: ['sms', 'communication', 'follow-up'],
    workflowJson: {
      nodes: [
        {
          id: 'trigger-2',
          type: 'custom',
          data: {
            label: 'Call Ended',
            icon: '📞',
            color: '#10b981',
            description: 'Trigger on call end'
          },
          position: { x: 100, y: 200 }
        },
        {
          id: 'action-2',
          type: 'custom',
          data: {
            label: 'Send SMS',
            icon: '💬',
            color: '#8b5cf6',
            description: 'Text customer'
          },
          position: { x: 350, y: 200 }
        }
      ],
      connections: [
        {
          id: 'edge-2',
          source: 'trigger-2',
          target: 'action-2',
          type: 'smoothstep',
          animated: true
        }
      ]
    }
  },
  {
    type: 'send_email',
    name: 'Send Follow-up Email',
    category: 'communication',
    description: 'Send email to lead after initial contact',
    tags: ['email', 'communication', 'nurture'],
    workflowJson: {
      nodes: [
        {
          id: 'trigger-3',
          type: 'custom',
          data: {
            label: 'New Lead',
            icon: '⚡',
            color: '#10b981',
            description: 'Lead created'
          },
          position: { x: 100, y: 200 }
        },
        {
          id: 'action-3',
          type: 'custom',
          data: {
            label: 'Send Email',
            icon: '📧',
            color: '#ec4899',
            description: 'Welcome email'
          },
          position: { x: 350, y: 200 }
        }
      ],
      connections: [
        {
          id: 'edge-3',
          source: 'trigger-3',
          target: 'action-3',
          type: 'smoothstep',
          animated: true
        }
      ]
    }
  },
  {
    type: 'slack_notification',
    name: 'Slack Team Notification',
    category: 'team',
    description: 'Notify team on Slack about new qualified leads',
    tags: ['slack', 'notification', 'team'],
    workflowJson: {
      nodes: [
        {
          id: 'trigger-4',
          type: 'custom',
          data: {
            label: 'Qualified Lead',
            icon: '⚡',
            color: '#10b981',
            description: 'High-value lead'
          },
          position: { x: 100, y: 200 }
        },
        {
          id: 'action-4',
          type: 'custom',
          data: {
            label: 'Notify Team',
            icon: '🔔',
            color: '#f59e0b',
            description: 'Post to Slack'
          },
          position: { x: 350, y: 200 }
        }
      ],
      connections: [
        {
          id: 'edge-4',
          source: 'trigger-4',
          target: 'action-4',
          type: 'smoothstep',
          animated: true
        }
      ]
    }
  },
  {
    type: 'custom',
    name: 'Quote Follow-Up Sequence',
    category: 'sales',
    description: 'Automated 7-day follow-up sequence for sent quotes',
    tags: ['sales', 'quote', 'follow-up', 'automation'],
    workflowJson: {
      nodes: [
        {
          id: 'trigger-5',
          type: 'custom',
          data: {
            label: 'Quote Sent',
            icon: '📋',
            color: '#10b981',
            description: 'Quote delivered'
          },
          position: { x: 100, y: 200 }
        },
        {
          id: 'wait-1',
          type: 'custom',
          data: {
            label: 'Wait 3 Days',
            icon: '⏱️',
            color: '#6b7280',
            description: 'Delay 72 hours'
          },
          position: { x: 350, y: 200 }
        },
        {
          id: 'action-5a',
          type: 'custom',
          data: {
            label: 'Send Email',
            icon: '📧',
            color: '#ec4899',
            description: 'Check-in email'
          },
          position: { x: 600, y: 150 }
        },
        {
          id: 'wait-2',
          type: 'custom',
          data: {
            label: 'Wait 4 Days',
            icon: '⏱️',
            color: '#6b7280',
            description: 'Delay 96 hours'
          },
          position: { x: 850, y: 150 }
        },
        {
          id: 'action-5b',
          type: 'custom',
          data: {
            label: 'Make Call',
            icon: '📞',
            color: '#8b5cf6',
            description: 'Follow-up call'
          },
          position: { x: 1100, y: 150 }
        }
      ],
      connections: [
        {
          id: 'edge-5a',
          source: 'trigger-5',
          target: 'wait-1',
          type: 'smoothstep',
          animated: true
        },
        {
          id: 'edge-5b',
          source: 'wait-1',
          target: 'action-5a',
          type: 'smoothstep',
          animated: true
        },
        {
          id: 'edge-5c',
          source: 'action-5a',
          target: 'wait-2',
          type: 'smoothstep',
          animated: true
        },
        {
          id: 'edge-5d',
          source: 'wait-2',
          target: 'action-5b',
          type: 'smoothstep',
          animated: true
        }
      ]
    }
  }
];

async function createLocalWorkflows() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get first user
    const user = await User.findOne().sort({ createdAt: -1 });
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      process.exit(1);
    }

    console.log(`👤 Creating workflows for: ${user.email}`);

    // Delete existing workflows for this user
    await N8nWorkflow.deleteMany({ userId: user._id });
    console.log('🗑️  Cleared existing workflows');

    // Create workflows
    const created = [];
    for (const template of workflowTemplates) {
      const workflow = await N8nWorkflow.create({
        userId: user._id,
        name: template.name,
        type: template.type,
        category: template.category,
        description: template.description,
        tags: template.tags,
        workflowJson: template.workflowJson,
        enabled: true,
        triggerConditions: {}
      });
      created.push(workflow);
      console.log(`✅ Created: ${workflow.name}`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`═══════════════════════════════════════`);
    console.log(`Total workflows created: ${created.length}`);
    console.log(`User: ${user.email}`);
    console.log(`\n🌐 View in browser:`);
    console.log(`   ${process.env.CLIENT_URL}/app/workflows`);
    console.log(`═══════════════════════════════════════\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createLocalWorkflows();
