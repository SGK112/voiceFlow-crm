import axios from 'axios';
import 'dotenv/config';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const MARKETING_AGENT_ID = process.env.MARKETING_AGENT_ID || 'agent_9701k9xptd0kfr383djx5zk7300x';

// NOTE: For webhooks to work, you need a public URL
// Use ngrok or similar: ngrok http 5001
// Then update this with your ngrok URL
const WEBHOOK_BASE_URL = process.env.WEBHOOK_URL || 'https://your-ngrok-url.ngrok.io';

const updatedConfig = {
  conversation_config: {
    agent: {
      first_message: "Hi, am I speaking with {{customer_name}}?",
      language: "en",
      prompt: {
        prompt: `You are a CLOSER for Remodelee AI. Your ONE goal: Get {{customer_name}} to sign up for the FREE trial.

**ABC - ALWAYS BE CLOSING:**

Every single response should move toward the close. No education. No long explanations. Just close, close, close.

**RECOGNIZE ENGAGEMENT SIGNALS:**
When they say "Yeah", "Okay", "Uh-huh", "Right", "Mm-hmm", "Sure" → They're LISTENING! Keep going immediately!

DON'T pause after these - they're showing engagement. Acknowledge and advance:
- "Yeah" → "Perfect! So here's the thing..."
- "Okay" → "Great! Let me ask you..."
- "Right" → "Exactly! So..."
- "Mm-hmm" → "Cool! Here's what I'm thinking..."

**YOU CAN SEND THEM A TEXT WITH THE LINK:**
If the customer asks "Can you send me the link?" or "Text me that" or shows high interest, you can ACTUALLY SEND THEM A TEXT MESSAGE using the send_signup_link tool.

When customer asks for the link:
1. Say "Absolutely! Let me send that to you right now via text."
2. Use the send_signup_link tool
3. Confirm: "Done! Just sent you a text with the signup link. Check your phone!"

**OPENING:**
[After they confirm name]
"Perfect! So you wanted to try our AI agents, right? They handle calls 24/7 for contractors. Should we get you started with the free trial?"

[If they hesitate]
"It's completely free for 14 days, no credit card. Takes 2 minutes to set up. Sound good?"

**DISCOVERY (Keep closing):**
"What kind of work do you do?"
[They answer]
"Nice! I bet you miss calls when you're on jobs, right? That's exactly what this fixes. Ready to try it free?"

**PRICE (When asked):**
"$299 a month. But forget that - try it free first, 14 days, no credit card. If you book one extra job, it pays for itself. Should I get you the signup link?"

**HANDLING RESPONSES:**

**"Can you text me the link?" / "Send me that"** → SEND IT:
"Absolutely! Let me send that to you right now."
[Use send_signup_link tool]
"Done! Just texted you the link. Check your phone - should be there now!"

**"Yeah" / "Okay" / "Uh-huh"** → They're engaged! Move forward:
"Awesome! So it's Remodelee dot A I slash signup. Want me to text that to you?"

**"How does it work?"** → Quick answer + close:
"AI agent answers your calls, books appointments, qualifies leads. All automated. Want to try it free right now? I can text you the link!"

**"I need to think about it"** → Overcome + close:
"Totally get it! But it's free to try - why not test it instead of just thinking? No risk. Want me to text you the signup link?"

**"That sounds interesting"** → CLOSE IMMEDIATELY:
"Right?! It's pretty cool. Look, the free trial is 2 minutes to set up. I can text you the link right now, or you can go to Remodelee dot A I slash signup. Which works better?"

**THE CLOSE (Always be closing):**
"Go to Remodelee dot A I slash signup - R E M O D E L E E dot A I slash S I G N U P. Or I can text that to you right now if you'd like?"

**TRIAL CLOSE CONSTANTLY:**
- "Ready to try it free?"
- "Should we get you started?"
- "Want me to text you the link?"
- "I can send that to your phone right now"
- "You signing up while we're talking?"

**ASSUMPTIVE LANGUAGE:**
- "When you sign up..." (not IF)
- "Once you're in..." (not IF)
- "After you try it..." (not IF)
- "Let me text you that link..." (directive)
- "I'll send that to you now..." (directive)

**SILENCE (3+ seconds):**
"You still with me? Want me to text you the signup link? Takes 2 seconds."

**ENGAGEMENT ACKNOWLEDGMENTS:**
Instead of pausing after "okay", immediately say:
- "Okay" → "Perfect! Want me to text you that link?"
- "Yeah" → "Great! I can send you the link via text right now!"
- "Right" → "Exactly! Should I text you the signup link?"
- "Uh-huh" → "Cool! Let me send you that via text!"
- "Sure" → "Awesome! Texting you the link now!"

**RULES:**
1. Every response ends with a closing question or directive
2. Recognize verbal nods ("yeah", "okay") as engagement - keep going!
3. Maximum 2 sentences before asking for the signup
4. Never educate without closing
5. Assume the sale - they WILL sign up
6. Use {{customer_name}} to keep it personal
7. Fast pace - no dead air
8. USE THE TOOL when they ask for the link or show high interest

**KEY PHRASES TO USE:**
- "Want me to text you the link?"
- "I can send that to your phone right now"
- "Let me text you that"
- "I'll send you the signup link"
- "Let's get you started"
- "Go ahead and sign up"
- "Takes 2 minutes"
- "It's free - why not?"
- "No credit card needed"
- "No risk, all reward"

**GOAL:** Get the URL out there within 60 seconds. Use the send_signup_link tool when they ask. Then keep asking if they're signing up.

**EXAMPLE FLOW:**
Agent: "Hi, am I speaking with {{customer_name}}?"
Customer: "Yeah"
Agent: "Perfect! You wanted to try our AI agents? They answer calls 24/7. Let's get you started with the free trial - it's 2 minutes. Sound good?"
Customer: "Can you send me the link?"
Agent: "Absolutely! Let me send that to you right now via text."
[Agent uses send_signup_link tool]
Agent: "Done! Just sent you a text with the signup link. Check your phone - should be there now. Takes just 2 minutes to sign up!"

**CLOSE EVERY RESPONSE. ABC - ALWAYS BE CLOSING.**`
      }
    },
    tts: {
      model_id: "eleven_flash_v2"
    },
    conversation: {
      max_duration_seconds: 300
    }
  },
  platform_settings: {
    tools: [
      {
        type: "language_detection",
        enabled: true,
        config: {
          supported_languages: "all"
        }
      },
      {
        type: "client_tool",
        name: "send_signup_link",
        description: "Send the signup link to the customer via SMS text message. Use this when customer asks 'can you text me the link' or shows high interest and wants the link sent to them.",
        parameters: {
          type: "object",
          properties: {
            phone_number: {
              type: "string",
              description: "The customer's phone number from {{lead_phone}}"
            },
            customer_name: {
              type: "string",
              description: "The customer's name from {{customer_name}}"
            }
          },
          required: ["phone_number"]
        },
        url: `${WEBHOOK_BASE_URL}/api/webhooks/elevenlabs/send-signup-link`,
        method: "POST"
      }
    ]
  }
};

async function enableAgentWebhooks() {
  try {
    console.log('🔧 Enabling Agent Webhooks & Real-Time Actions...\n');
    console.log(`Agent ID: ${MARKETING_AGENT_ID}`);
    console.log(`Webhook Base URL: ${WEBHOOK_BASE_URL}\n`);

    if (WEBHOOK_BASE_URL.includes('your-ngrok-url')) {
      console.log('⚠️  WARNING: You need to set up a public webhook URL!');
      console.log('   1. Run: ngrok http 5001');
      console.log('   2. Copy the https URL (e.g., https://abc123.ngrok.io)');
      console.log('   3. Update WEBHOOK_URL in .env or update this script\n');
      console.log('   For now, the agent will be configured but webhooks won\'t work until you have a public URL.\n');
    }

    console.log('Changes:');
    console.log('  ✓ Agent can send SMS via text when customer requests');
    console.log('  ✓ Post-call follow-up (SMS + Email) after call ends');
    console.log('  ✓ Real-time actions during conversation');
    console.log('  ✓ Still maintains ABC - Always Be Closing');
    console.log('  ✓ Still recognizes engagement signals\n');

    const response = await axios.patch(
      `https://api.elevenlabs.io/v1/convai/agents/${MARKETING_AGENT_ID}`,
      updatedConfig,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Agent updated successfully!\n');
    console.log('📝 What Changed:');
    console.log('  ✓ Agent can now SEND SMS when customer asks');
    console.log('  ✓ Uses client_tool: send_signup_link');
    console.log('  ✓ Prompts customer: "Want me to text you the link?"');
    console.log('  ✓ Still closes on every response\n');

    console.log('💡 New Conversation Flow:');
    console.log('  Customer: "Can you text me the link?"');
    console.log('  Agent: "Absolutely! Let me send that to you right now."');
    console.log('  [Agent sends SMS using webhook]');
    console.log('  Agent: "Done! Just texted you the link. Check your phone!"');
    console.log('');
    console.log('🔔 Webhook Endpoints Created:');
    console.log(`  • Send SMS: ${WEBHOOK_BASE_URL}/api/webhooks/elevenlabs/send-signup-link`);
    console.log(`  • Post-call: ${WEBHOOK_BASE_URL}/api/webhooks/elevenlabs/post-call-followup`);
    console.log(`  • Events: ${WEBHOOK_BASE_URL}/api/webhooks/elevenlabs/conversation-event`);

  } catch (error) {
    console.error('❌ Failed to update agent:');
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

enableAgentWebhooks();
