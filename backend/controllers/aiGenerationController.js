import AIService from '../services/aiService.js';
import BusinessProfile from '../models/BusinessProfile.js';

const aiService = new AIService();

/**
 * Generate agent script based on profile information
 * INTELLIGENT: Automatically pulls from user's business profile
 */
export const generateAgentScript = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      agentName,
      companyName,
      industry,
      targetAudience,
      keywords,
      voiceName,
      agentType,        // NEW: Agent type (sales, support, etc.)
      knowledge,        // NEW: Additional context/knowledge
      tools,            // NEW: Available tools/capabilities
      firstMessage      // NEW: Existing first message to enhance
    } = req.body;

    console.log('🤖 [AI GENERATION] Generating intelligent agent script...');
    console.log('   User ID:', userId);
    console.log('   Agent Name:', agentName);

    // 🎯 PULL FROM BUSINESS PROFILE FIRST - This makes it intelligent!
    let businessProfile = null;
    try {
      businessProfile = await BusinessProfile.findOne({ userId });
      if (businessProfile) {
        console.log('✅ [AI GENERATION] Found business profile - using company context!');
        console.log('   Company:', businessProfile.companyName);
        console.log('   Industry:', businessProfile.industry);
        console.log('   Service Area:', businessProfile.getServiceAreaDescription());
      }
    } catch (error) {
      console.log('⚠️  [AI GENERATION] No business profile found - using form data only');
    }

    // Build rich context from BOTH profile AND form data (form data overrides profile)
    const context = {
      agentName: agentName,
      companyName: companyName || businessProfile?.companyName || 'Your Company',
      industry: industry || businessProfile?.industry || 'general services',
      targetAudience: targetAudience || 'customers and leads',
      keywords: keywords && keywords.length > 0 ? keywords : [],
      voiceName: voiceName,
      agentType: agentType || 'custom',
      knowledge: knowledge || '',
      tools: tools || [],
      firstMessage: firstMessage || '',
      // Extra context from profile
      phone: businessProfile?.phone,
      serviceArea: businessProfile?.getServiceAreaDescription(),
      yearsInBusiness: businessProfile?.yearsInBusiness,
      paymentTerms: businessProfile?.getPaymentTermsDisplay()
    };

    console.log('📊 [AI GENERATION] Full context:', context);

    // Build intelligent, context-rich prompt
    const contextLines = [];
    contextLines.push(`Agent Name: ${context.agentName}`);
    contextLines.push(`Agent Type: ${context.agentType}`);
    contextLines.push(`Company: ${context.companyName}`);
    contextLines.push(`Industry: ${context.industry}`);
    contextLines.push(`Target Audience: ${context.targetAudience}`);

    if (context.keywords.length > 0) {
      contextLines.push(`Key Topics to Address: ${context.keywords.join(', ')}`);
    }

    if (context.voiceName) {
      contextLines.push(`Voice Persona: ${context.voiceName}`);
    }

    if (context.serviceArea && context.serviceArea !== 'Not specified') {
      contextLines.push(`Service Area: ${context.serviceArea}`);
    }

    if (context.yearsInBusiness) {
      contextLines.push(`Years in Business: ${context.yearsInBusiness}`);
    }

    if (context.knowledge && context.knowledge.trim()) {
      contextLines.push(`\nAdditional Knowledge/Context:\n${context.knowledge}`);
    }

    if (context.tools && context.tools.length > 0) {
      contextLines.push(`\nAvailable Tools/Capabilities: ${context.tools.join(', ')}`);
    }

    if (context.firstMessage && context.firstMessage.trim()) {
      contextLines.push(`\nDesired First Message Style:\n"${context.firstMessage}"`);
    }

    // Build agent type-specific requirements
    const agentTypeGuidelines = {
      'sales': 'Focus on qualifying leads, discovery questions, and booking appointments. Be persuasive but not pushy.',
      'support': 'Focus on understanding issues, troubleshooting, and providing solutions. Be helpful and patient.',
      'appointment_scheduler': 'Focus on understanding needs, checking availability, and confirming appointments. Be efficient and organized.',
      'lead_qualifier': 'Focus on asking discovery questions, understanding budget/timeline, and qualifying leads. Be thorough.',
      'customer_service': 'Focus on resolving issues, answering questions, and ensuring satisfaction. Be empathetic and solution-oriented.',
      'custom': 'Be versatile and adapt to the conversation naturally.'
    };

    const agentGuideline = agentTypeGuidelines[context.agentType] || agentTypeGuidelines['custom'];

    const prompt = `You are an expert conversational AI script writer specializing in voice agents for ${context.industry} businesses.

Create a professional, natural-sounding ${context.agentType} agent script for a voice AI agent with the following context:

${contextLines.join('\n')}

AGENT TYPE FOCUS: ${agentGuideline}

IMPORTANT REQUIREMENTS:
1. Make it sound HUMAN and CONVERSATIONAL - avoid robotic language
2. Use the customer's name naturally: {{customer_name}}
3. Include the company name when introducing: {{company_name}}
4. Be warm, friendly, and professional - match the ${context.industry} industry tone
5. Handle common objections gracefully
6. ${context.agentType === 'sales' || context.agentType === 'lead_qualifier' ? 'Ask qualifying questions (budget, timeline, decision maker)' : 'Ask clarifying questions to understand needs'}
7. ${context.keywords.length > 0 ? `Address these topics naturally: ${context.keywords.join(', ')}` : 'Focus on the customer\'s needs'}
8. Include when to offer to transfer to a human: "Let me connect you with someone who can help with that"
9. Keep responses concise - this is a PHONE conversation, not an essay
10. Use {{lead_email}}, {{lead_phone}} variables where helpful
${context.tools && context.tools.length > 0 ? `11. This agent has access to: ${context.tools.join(', ')} - incorporate these capabilities naturally` : ''}
${context.knowledge ? `12. Use this specific knowledge in the conversation: ${context.knowledge.substring(0, 200)}${context.knowledge.length > 200 ? '...' : ''}` : ''}

Generate a complete agent instruction script (400-600 words) that covers:
- Greeting and introduction${context.firstMessage ? ' (match the style of the provided first message)' : ''}
- Purpose/value proposition (tailored to ${context.agentType})
- Discovery/qualifying questions (specific to ${context.agentType})
- Objection handling approach
- When to transfer calls
- Closing/next steps

Write ONLY the script instructions, no preamble. Start directly with the agent instructions.`;

    console.log('🚀 [AI GENERATION] Calling AI with intelligent prompt...');

    const script = await aiService.chat(prompt, {
      temperature: 0.7,
      maxTokens: 1000,
      model: 'gpt-4o-mini'
    });

    console.log('✅ [AI GENERATION] Script generated successfully');
    console.log('   Length:', script.length, 'characters');
    console.log('   Preview:', script.substring(0, 150) + '...');

    res.json({
      success: true,
      script,
      context: {
        usedBusinessProfile: !!businessProfile,
        companyName: context.companyName,
        industry: context.industry
      }
    });

  } catch (error) {
    console.error('❌ [AI GENERATION] Error generating script:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate script. Please try again.',
      error: error.message
    });
  }
};

/**
 * Generate first message based on profile information
 * INTELLIGENT: Automatically pulls from user's business profile
 */
export const generateFirstMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { agentName, companyName, industry, targetAudience } = req.body;

    console.log('🤖 [AI GENERATION] Generating intelligent first message...');

    // 🎯 PULL FROM BUSINESS PROFILE
    let businessProfile = null;
    try {
      businessProfile = await BusinessProfile.findOne({ userId });
      if (businessProfile) {
        console.log('✅ [AI GENERATION] Using business profile context');
      }
    } catch (error) {
      console.log('⚠️  [AI GENERATION] No business profile - using form data');
    }

    const context = {
      agentName: agentName,
      companyName: companyName || businessProfile?.companyName || 'Your Company',
      industry: industry || businessProfile?.industry || 'general services',
      targetAudience: targetAudience || 'customers'
    };

    const prompt = `Create a warm, professional first message for a voice AI agent calling from ${context.companyName} in the ${context.industry} industry.

Context:
- Agent Name: ${context.agentName}
- Company: ${context.companyName}
- Industry: ${context.industry}
- Target Audience: ${context.targetAudience}

Requirements:
1. Keep it under 25 words
2. Be friendly and professional - match ${context.industry} industry tone
3. Use dynamic variables: {{customer_name}}, {{agent_name}}, {{company_name}}
4. Make it natural and conversational for a PHONE call
5. Include a subtle call to action or engaging question
6. Don't sound like a telemarketer - sound helpful and genuine

Generate ONLY the first message greeting. No preamble, no explanation. Just the greeting text.`;

    const firstMessage = (await aiService.chat(prompt, {
      temperature: 0.8,
      maxTokens: 100,
      model: 'gpt-4o-mini'
    })).trim().replace(/^["']|["']$/g, '');

    console.log('✅ [AI GENERATION] First message generated');
    console.log('   Message:', firstMessage);

    res.json({
      success: true,
      firstMessage,
      context: {
        usedBusinessProfile: !!businessProfile,
        companyName: context.companyName
      }
    });

  } catch (error) {
    console.error('❌ [AI GENERATION] Error generating first message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate first message. Please try again.',
      error: error.message
    });
  }
};
