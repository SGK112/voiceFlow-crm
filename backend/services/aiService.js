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
