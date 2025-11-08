# MCP Setup Guide for VoiceFlow CRM

This guide will help you set up MCP servers so Claude Desktop can automatically create ElevenLabs agents and n8n workflows.

---

## Current Status

Looking at your `claude_desktop_config.json`:

✅ **n8n MCP** - Already configured and working
✅ **ElevenLabs API Key** - Already set
❌ **ElevenLabs MCP** - Package not installed (needs setup)

---

## Step 1: Install ElevenLabs MCP Server

The ElevenLabs MCP package doesn't exist as a standard package yet, but we can use the ElevenLabs API directly through a custom MCP server or via HTTP requests.

### Option A: Use Standard HTTP/Fetch MCP (Recommended)

Since there's no official ElevenLabs MCP, we'll use the `@modelcontextprotocol/server-fetch` MCP which can make HTTP requests to any API including ElevenLabs.

```bash
# Install the fetch MCP server
npm install -g @modelcontextprotocol/server-fetch
```

Then update your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://remodely.app.n8n.cloud/",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlNzVjOWY3Zi01MjNjLTQxNTktYmU0Ny1kNDJlMmRkMDgxZWEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwNTkwMzA3fQ.boC0Iy_aWbjdas_eub25O2fVfnqDFzWAo-D32sIcdJ4"
      }
    }
  }
}
```

### Option B: Create Custom ElevenLabs MCP Server

If you want a dedicated ElevenLabs MCP server, create one:

```bash
# Create directory for custom MCP server
mkdir -p ~/mcp-servers/elevenlabs
cd ~/mcp-servers/elevenlabs

# Initialize npm project
npm init -y

# Install dependencies
npm install @modelcontextprotocol/sdk elevenlabs
```

Create `~/mcp-servers/elevenlabs/index.js`:

```javascript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ElevenLabsClient } from 'elevenlabs';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  console.error('ELEVENLABS_API_KEY environment variable is required');
  process.exit(1);
}

const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY
});

const server = new Server({
  name: 'elevenlabs-mcp',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  }
});

// Tool: Create Conversational AI Agent
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'create_conversational_agent') {
    const { name, prompt, voice_id, tools } = request.params.arguments;

    try {
      const agent = await client.conversationalAI.createAgent({
        name: name,
        prompt: {
          prompt: prompt,
        },
        voice_id: voice_id || 'default',
        tools: tools || []
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            agent_id: agent.agent_id,
            message: `Agent "${name}" created successfully`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  // Tool: List Agents
  if (request.params.name === 'list_agents') {
    try {
      const agents = await client.conversationalAI.getAgents();

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(agents, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// List available tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'create_conversational_agent',
        description: 'Creates a new ElevenLabs conversational AI agent',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the agent'
            },
            prompt: {
              type: 'string',
              description: 'System prompt for the agent'
            },
            voice_id: {
              type: 'string',
              description: 'Voice ID to use (optional)'
            },
            tools: {
              type: 'array',
              description: 'Array of custom tools for the agent',
              items: {
                type: 'object'
              }
            }
          },
          required: ['name', 'prompt']
        }
      },
      {
        name: 'list_agents',
        description: 'Lists all existing ElevenLabs conversational AI agents',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ElevenLabs MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

Make it executable:

```bash
chmod +x ~/mcp-servers/elevenlabs/index.js
```

Update your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "elevenlabs": {
      "command": "node",
      "args": ["/Users/homepc/mcp-servers/elevenlabs/index.js"],
      "env": {
        "ELEVENLABS_API_KEY": "sk_cd3bed51d94fdfaf8ae2b7b3815c9cdde05ca3e7b0b807e0"
      }
    },
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://remodely.app.n8n.cloud/",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlNzVjOWY3Zi01MjNjLTQxNTktYmU0Ny1kNDJlMmRkMDgxZWEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwNTkwMzA3fQ.boC0Iy_aWbjdas_eub25O2fVfnqDFzWAo-D32sIcdJ4"
      }
    }
  }
}
```

---

## Step 2: Restart Claude Desktop

After updating the config:

1. **Quit Claude Desktop completely** (Cmd+Q)
2. **Reopen Claude Desktop**
3. MCP servers will initialize

---

## Step 3: Use MCP Tools in Claude Desktop

Once setup, you can ask Claude Desktop things like:

### Create ElevenLabs Agents

```
Using the ElevenLabs MCP, create 5 conversational AI agents based on the
configurations in /Users/homepc/voiceflow-crm/ELEVENLABS_AGENT_SETUP.md:

1. Lead Generation Agent
2. Booking Agent
3. Collections Agent
4. Promotions Agent
5. Support Agent

For each agent, return the agent_id so I can add them to my Render environment variables.
```

### Create n8n Workflows

```
Using the n8n MCP, create 5 workflows:

1. lead-capture webhook
2. book-appointment webhook
3. payment-reminder webhook
4. send-promotion webhook
5. create-ticket webhook

Configure each to receive data from ElevenLabs agents and integrate with the
VoiceFlow CRM API at https://srv-d47fel2li9vc738mgcl0.onrender.com
```

---

## Step 4: Alternative - Use Direct API Calls

If MCP setup is too complex, you can use direct API calls from Claude Code (this terminal):

### Create ElevenLabs Agent via API

```bash
curl -X POST "https://api.elevenlabs.io/v1/convai/agents/create" \
  -H "xi-api-key: sk_cd3bed51d94fdfaf8ae2b7b3815c9cdde05ca3e7b0b807e0" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lead Generation Agent",
    "conversation_config": {
      "agent": {
        "prompt": {
          "prompt": "You are a professional lead generation specialist..."
        },
        "first_message": "Hi! Thanks for calling VoiceFlow CRM...",
        "language": "en"
      }
    }
  }'
```

Would you like me to:
1. Create the custom ElevenLabs MCP server for you?
2. Use direct API calls to create the agents right now?
3. Create a script that sets up everything automatically?

---

## Recommended Approach

**For immediate results:** Use direct API calls (I can do this now)

**For long-term convenience:** Set up custom MCP server (one-time setup, then easy to use)

Let me know which approach you prefer!
