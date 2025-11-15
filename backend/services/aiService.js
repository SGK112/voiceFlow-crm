import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Service supporting multiple providers
 * Provides prompt optimization, call insights, and suggestions
 */
class AIService {
  constructor() {
    this.providers = {
      openai: process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null,
      anthropic: process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null,
      google: process.env.GOOGLE_AI_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY) : null
    };

    // Determine which provider to use (priority: OpenAI > Anthropic > Google)
    this.activeProvider = this.getActiveProvider();

    if (!this.activeProvider) {
      console.warn('⚠️ No AI provider configured. AI features will be disabled.');
    } else {
      console.log(`✅ AI Service initialized with ${this.activeProvider} provider`);
    }
  }

  getActiveProvider() {
    if (this.providers.openai) return 'openai';
    if (this.providers.anthropic) return 'anthropic';
    if (this.providers.google) return 'google';
    return null;
  }

  isAvailable() {
    return this.activeProvider !== null;
  }

  /**
   * Improve a voice agent script with AI suggestions
   */
  async improveScript(script, agentType, context = {}) {
    if (!this.isAvailable()) {
      throw new Error('AI service not available. Please configure an AI provider API key.');
    }

    const prompt = `You are an expert voice agent script writer for conversational AI.

Agent Type: ${agentType}
Current Script:
${script}

Context:
- Company: ${context.companyName || 'Not specified'}
- Industry: ${context.industry || 'General'}
- Goal: ${context.goal || 'Effective communication'}

Please improve this voice agent script by:
1. Making it more conversational and natural
2. Adding clear objection handling
3. Including better call-to-action
4. Optimizing for phone conversation flow
5. Adding relevant personalization variables

Provide the improved script with clear sections and {{variable}} placeholders where appropriate.`;

    return await this.chat(prompt);
  }

  /**
   * Generate suggestions for improving agent performance
   */
  async generateScriptSuggestions(script, agentType) {
    if (!this.isAvailable()) {
      throw new Error('AI service not available.');
    }

    const prompt = `Analyze this voice agent script and provide 3-5 specific, actionable suggestions to improve it:

Agent Type: ${agentType}
Script:
${script}

Focus on:
- Conversation flow
- Call success rate optimization
- Objection handling
- Personalization opportunities
- Professional tone

Return suggestions as a JSON array of objects with "title" and "description" fields.`;

    const response = await this.chat(prompt);

    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI suggestions:', e);
    }

    // Fallback to plain text suggestions
    return [{ title: 'AI Suggestion', description: response }];
  }

  /**
   * Analyze call data and provide insights
   */
  async analyzeCallData(calls, agentInfo) {
    if (!this.isAvailable()) {
      throw new Error('AI service not available.');
    }

    const callSummary = calls.map(call => ({
      duration: call.duration,
      status: call.status,
      outcome: call.outcome,
      transcript: call.transcript ? call.transcript.substring(0, 500) : null
    }));

    const prompt = `Analyze these voice agent call results and provide actionable insights:

Agent: ${agentInfo.name} (${agentInfo.type})
Total Calls: ${calls.length}
Call Data Sample:
${JSON.stringify(callSummary, null, 2)}

Provide:
1. Performance summary (2-3 sentences)
2. Top 3 insights or patterns
3. 2-3 specific recommendations for improvement

Format as JSON with "summary", "insights" (array), and "recommendations" (array) fields.`;

    const response = await this.chat(prompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI analysis:', e);
    }

    return {
      summary: response,
      insights: [],
      recommendations: []
    };
  }

  /**
   * Generate a complete agent script from a description
   */
  async generateScript(description, agentType, context = {}) {
    if (!this.isAvailable()) {
      throw new Error('AI service not available.');
    }

    const prompt = `Generate a professional voice agent script for:

Type: ${agentType}
Description: ${description}
Company: ${context.companyName || 'Your Company'}
Industry: ${context.industry || 'General'}

Create a complete, conversational script that includes:
1. Natural greeting
2. Clear purpose statement
3. Discovery questions (if applicable)
4. Objection handling
5. Call-to-action
6. Professional closing

Use {{company_name}}, {{lead_name}}, {{lead_email}}, {{lead_phone}} variables where appropriate.
Make it sound natural for a phone conversation, not scripted.`;

    return await this.chat(prompt);
  }

  /**
   * Help configure a specific workflow node
   */
  async configureNode(nodeType, userRequest, currentConfig = {}, context = {}) {
    if (!this.isAvailable()) {
      throw new Error('AI service not available.');
    }

    const nodeDescriptions = {
      trigger: 'Webhook trigger - starts the workflow when an event occurs',
      save_lead: 'Saves customer information to the CRM database',
      send_sms: 'Sends an SMS text message to a phone number',
      send_email: 'Sends an email message',
      notify_team: 'Sends a notification to team on Slack',
      wait: 'Pauses workflow execution for a specified duration',
      condition: 'Branches workflow based on conditional logic',
      custom_code: 'Runs custom JavaScript code',
      n8n_connect: 'Connects to external n8n workflow'
    };

    const prompt = `You are helping a user configure a workflow automation node.

Node Type: ${nodeType}
Description: ${nodeDescriptions[nodeType] || 'Workflow node'}
User Request: ${userRequest}
Current Configuration: ${JSON.stringify(currentConfig, null, 2)}

The user is asking for help with: "${userRequest}"

Please provide a helpful response that:
1. Explains what this node does in simple terms
2. Suggests appropriate parameter values based on their request
3. Returns ONLY a JSON object with the suggested configuration

Return format:
{
  "explanation": "Brief explanation of what this configuration will do",
  "parameters": {
    // Suggested parameter values for this node type
  },
  "tips": "Any helpful tips or best practices"
}

For reference, here are common parameter patterns:
- Variables use {{$json.fieldName}} syntax
- Phone numbers should be in E.164 format: +1234567890
- Email addresses should be validated
- Messages can include dynamic variables like {{$json.name}}

Return ONLY valid JSON, no markdown formatting.`;

    const response = await this.chat(prompt, { maxTokens: 1000, temperature: 0.7 });

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse node configuration JSON:', e);
      // Fallback response
      return {
        explanation: response,
        parameters: {},
        tips: 'Try being more specific about what you want this step to do.'
      };
    }

    throw new Error('AI did not return valid configuration JSON');
  }

  /**
   * Generate a workflow from natural language description
   */
  async generateWorkflow(description, workflowType = 'general', context = {}) {
    if (!this.isAvailable()) {
      throw new Error('AI service not available.');
    }

    const prompt = `You are an expert workflow automation designer. Generate a complete workflow based on this description:

Description: ${description}
Workflow Type: ${workflowType}
Company: ${context.companyName || 'Company'}
Industry: ${context.industry || 'General'}

Available node types:
1. TRIGGER nodes: webhook (when something happens), schedule (time-based)
2. ACTION nodes: save_lead (save to CRM), send_sms (text message), send_email (email), notify_team (Slack), custom HTTP request
3. LOGIC nodes: wait (delay), condition (if/then), custom_code (JavaScript)

Generate a workflow with these specifications:
- Start with ONE trigger node
- Add 2-6 action/logic nodes that accomplish the goal
- Each node should have realistic parameters
- Use variables like {{$json.name}}, {{$json.email}}, {{$json.phone}} to pass data between nodes

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "name": "Workflow Name",
  "description": "Brief description",
  "nodes": [
    {
      "id": "trigger",
      "type": "trigger",
      "label": "When This Happens",
      "position": {"x": 100, "y": 100},
      "parameters": {}
    },
    {
      "id": "action1",
      "type": "save_lead",
      "label": "Save Lead",
      "position": {"x": 350, "y": 100},
      "parameters": {
        "name": "{{$json.name}}",
        "phone": "{{$json.phone}}",
        "email": "{{$json.email}}"
      }
    }
  ],
  "connections": [
    {"from": "trigger", "to": "action1"}
  ]
}`;

    const response = await this.chat(prompt, { maxTokens: 2500, temperature: 0.7 });

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse workflow JSON:', e);
      throw new Error('Failed to generate valid workflow structure');
    }

    throw new Error('AI did not return valid workflow JSON');
  }

  /**
   * Chat with AI provider (unified interface)
   */
  async chat(prompt, options = {}) {
    const maxTokens = options.maxTokens || 1500;
    const temperature = options.temperature || 0.7;

    try {
      switch (this.activeProvider) {
        case 'openai':
          return await this.chatOpenAI(prompt, maxTokens, temperature);

        case 'anthropic':
          return await this.chatAnthropic(prompt, maxTokens, temperature);

        case 'google':
          return await this.chatGoogle(prompt, maxTokens, temperature);

        default:
          throw new Error('No AI provider available');
      }
    } catch (error) {
      console.error('AI Service Error:', error.message);
      throw new Error(`AI request failed: ${error.message}`);
    }
  }

  async chatOpenAI(prompt, maxTokens, temperature) {
    const response = await this.providers.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: temperature
    });
    return response.choices[0].message.content;
  }

  async chatAnthropic(prompt, maxTokens, temperature) {
    const response = await this.providers.anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: maxTokens,
      temperature: temperature,
      messages: [{ role: 'user', content: prompt }]
    });
    return response.content[0].text;
  }

  async chatGoogle(prompt, maxTokens, temperature) {
    const model = this.providers.google.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature
      }
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

export default AIService;
