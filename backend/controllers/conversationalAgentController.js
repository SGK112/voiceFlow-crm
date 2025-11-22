/**
 * Conversational Agent Controller
 *
 * Handles multimodal (text + voice) conversational AI agents
 */

import ElevenLabsConversationalService from '../services/elevenLabsConversationalService.js';
import VoiceAgent from '../models/VoiceAgent.js';

const conversationalService = new ElevenLabsConversationalService();

/**
 * Create a demo conversational agent with text capabilities
 * POST /api/conversational-agents/demo
 */
export const createDemoAgent = async (req, res) => {
  try {
    const { userId } = req.user;

    console.log('\n🎯 [DEMO AGENT] Creating multimodal conversational agent');

    // Demo agent configuration
    const demoConfig = {
      name: 'VoiceFlow Demo Agent - Multimodal',
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah - professional female voice
      language: 'en',
      enableTextInput: true,
      prompt: `You are a friendly AI assistant demonstrating ElevenLabs' multimodal conversational capabilities.

**YOUR CAPABILITIES:**
You can understand and respond to BOTH voice and text inputs during our conversation. Users can:
- Speak to you naturally
- Type messages while speaking
- Switch between voice and text seamlessly

**YOUR PERSONALITY:**
- Friendly, helpful, and engaging
- Tech-savvy but approachable
- Patient and clear in explanations

**CONVERSATION FLOW:**

1. **Greeting**
"Hi! I'm your VoiceFlow demo agent. I can understand both your voice AND text messages! Try speaking to me, or type something - I respond to both!"

2. **Demonstrate Text Capability**
When users type:
"Great! I see you're typing. This is perfect for sharing:
- Email addresses
- Phone numbers
- Specific IDs or codes
- Complex information that's hard to say out loud"

3. **Use Cases to Mention**
"This multimodal capability is perfect for:
- Customer service (speak naturally, type account numbers)
- Scheduling (say your preferences, type exact dates/times)
- Shopping (describe what you want, type product codes)
- Healthcare (discuss symptoms, type medications precisely)
- Real estate (describe preferences, type specific addresses)"

4. **Interactive Demo**
Encourage users to try different things:
- "Try asking me something out loud"
- "Now try typing a question"
- "You can even interrupt me mid-sentence!"
- "Type your email address - much easier than spelling it out"

5. **Key Features to Highlight**
- Real-time transcription of speech
- Simultaneous text and voice processing
- Natural interruptions
- Context preservation across modalities
- Low latency responses

**HANDLING TEXT MESSAGES:**
When you receive text input:
- Acknowledge it: "I see you typed [content]"
- Respond appropriately
- Offer to continue via voice OR text

**HANDLING VOICE:**
When they speak:
- Respond naturally
- Suggest text for complex information
- Keep responses conversational

**SAMPLE INTERACTIONS:**

User (voice): "What can you do?"
You: "I can have full conversations with you using BOTH voice and text! Try typing your email address - it's much easier than spelling it letter by letter."

User (text): "john.doe@example.com"
You: "Perfect! Got it - john.doe@example.com. See how easy that was? This is exactly why multimodal is so powerful. What else would you like to know?"

User (voice): "Can you help me schedule an appointment?"
You: "Absolutely! Tell me when you'd like to schedule it, and feel free to type the exact date if that's easier."

**IMPORTANT:**
- Always be enthusiastic about demonstrating capabilities
- Encourage users to try BOTH input methods
- Show real-world use cases
- Make it interactive and fun!

Let's have a great conversation!`,
      firstMessage: "Hi! 👋 I'm your VoiceFlow demo agent. I can understand BOTH your voice and text messages! Try speaking to me, or type something below - I respond to both!"
    };

    // Create the agent in ElevenLabs
    const elevenLabsAgent = await conversationalService.createConversationalAgent(demoConfig);

    console.log(`✅ [DEMO AGENT] Created in ElevenLabs: ${elevenLabsAgent.agent_id}`);

    // Save to database
    const agent = await VoiceAgent.create({
      userId: req.user._id,
      name: demoConfig.name,
      type: 'custom',
      customType: 'demo_multimodal',
      elevenLabsAgentId: elevenLabsAgent.agent_id,
      voiceId: demoConfig.voiceId,
      voiceName: 'Sarah',
      script: demoConfig.prompt,
      firstMessage: demoConfig.firstMessage,
      enabled: true,
      status: 'active',
      configuration: {
        temperature: 0.8,
        language: 'en',
        enableTextInput: true,
        multimodal: true
      }
    });

    console.log(`✅ [DEMO AGENT] Saved to database: ${agent._id}`);

    // Generate widget embed code
    const widgetCode = conversationalService.getWidgetEmbedCode(elevenLabsAgent.agent_id);

    res.json({
      success: true,
      message: 'Demo agent created successfully',
      agent: {
        id: agent._id,
        elevenLabsAgentId: elevenLabsAgent.agent_id,
        name: agent.name,
        voiceId: agent.voiceId,
        voiceName: agent.voiceName,
        multimodal: true,
        enableTextInput: true
      },
      widget: {
        embedCode: widgetCode,
        instructions: 'Add this code to your HTML to embed the conversational widget'
      },
      testing: {
        signedUrl: await conversationalService.getSignedUrl(elevenLabsAgent.agent_id)
      }
    });

  } catch (error) {
    console.error('❌ [DEMO AGENT] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Start a conversational session with an agent
 * POST /api/conversational-agents/session/start
 */
export const startConversationalSession = async (req, res) => {
  try {
    const { agentId, customVariables = {} } = req.body;

    console.log(`🚀 [SESSION] Starting session with agent: ${agentId}`);

    // Verify agent exists and belongs to user
    const agent = await VoiceAgent.findOne({
      _id: req.body.agentId,
      userId: req.user._id
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Get signed URL for the session
    const signedUrl = await conversationalService.getSignedUrl(agent.elevenLabsAgentId);

    res.json({
      success: true,
      session: {
        agentId: agent.elevenLabsAgentId,
        signedUrl,
        multimodal: true,
        enableTextInput: agent.configuration?.enableTextInput !== false
      }
    });

  } catch (error) {
    console.error('❌ [SESSION] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get widget embed code for an agent
 * GET /api/conversational-agents/:id/widget
 */
export const getWidgetCode = async (req, res) => {
  try {
    const agent = await VoiceAgent.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const widgetCode = conversationalService.getWidgetEmbedCode(agent.elevenLabsAgentId);

    res.json({
      success: true,
      agent: {
        id: agent._id,
        name: agent.name,
        elevenLabsAgentId: agent.elevenLabsAgentId
      },
      widget: {
        embedCode: widgetCode,
        instructions: 'Add this code to your website to embed the conversational widget',
        customizationUrl: `https://elevenlabs.io/app/conversational-ai/agent/${agent.elevenLabsAgentId}`
      }
    });

  } catch (error) {
    console.error('❌ [WIDGET] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Test conversational agent with text message
 * POST /api/conversational-agents/test-text
 */
export const testTextMessage = async (req, res) => {
  try {
    const { agentId, message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log(`💬 [TEST] Testing text message to agent ${agentId}: "${message}"`);

    // Create a temporary session for testing
    const session = await conversationalService.startSession(agentId, {
      enableTextInput: true,
      onAgentResponse: (text) => {
        console.log(`🤖 Agent responded: "${text}"`);
      }
    });

    // Wait for connection
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Send test message
    session.sendText(message);

    // Keep session open for response
    setTimeout(() => {
      session.end();
    }, 10000); // Close after 10 seconds

    res.json({
      success: true,
      message: 'Test message sent successfully',
      sessionId: session.id,
      note: 'Session will close automatically after 10 seconds'
    });

  } catch (error) {
    console.error('❌ [TEST] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get active conversational sessions
 * GET /api/conversational-agents/sessions
 */
export const getActiveSessions = async (req, res) => {
  try {
    const sessions = conversationalService.getActiveSessions();

    res.json({
      success: true,
      sessions: sessions.map(s => ({
        sessionId: s.id,
        agentId: s.agentId,
        isConnected: s.isConnected,
        isMuted: s.isMuted
      })),
      total: sessions.length
    });

  } catch (error) {
    console.error('❌ [SESSIONS] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  createDemoAgent,
  startConversationalSession,
  getWidgetCode,
  testTextMessage,
  getActiveSessions
};
