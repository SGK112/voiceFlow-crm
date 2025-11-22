/**
 * Keyword-Based Appointment Agent
 *
 * This agent listens for specific keywords and tells you it will send things.
 * Then we manually trigger the sends after detecting keywords in the transcript.
 *
 * Keywords:
 * - "text", "text me", "send a message", "send me a text"
 * - "email", "send email", "email me"
 * - "calendar", "calendar invite", "send calendar"
 */

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import dotenv from 'dotenv';

dotenv.config();

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

async function createKeywordAgent() {
  console.log('\n🤖 Creating keyword-responsive agent...\n');

  try {
    const agent = await client.conversationalAi.agents.create({
      name: 'Keyword Responsive Agent - Josh',
      conversationConfig: {
        agent: {
          prompt: {
            prompt: `You are Sarah from Remodely, a professional appointment coordinator.

CUSTOMER: Josh B (480-255-5887, joshb@surprisegranite.com)
APPOINTMENT: Monday at 12:00 PM - Kitchen Remodeling Consultation

YOUR ROLE:
Have a natural conversation and respond to requests to send information.

CONVERSATION FLOW:

1. GREETING
"Hi Josh! This is Sarah from Remodely. How are you today?"

2. APPOINTMENT CONFIRMATION
"I'm calling to confirm your kitchen remodeling consultation scheduled for Monday at noon. Does that time still work for you?"

3. LISTEN FOR REQUESTS
Listen carefully for Josh to ask you to:
- Send a text / text message / SMS
- Send an email / email information
- Send a calendar invite

4. WHEN JOSH ASKS FOR A TEXT:
Respond: "Absolutely! I'm sending you a text message right now with our signup link and appointment details. You should receive it in just a moment."

Then naturally continue: "The text has our Remodely.ai/signup link where you can create your account."

5. WHEN JOSH ASKS FOR EMAIL:
Respond: "Of course! I'm sending you an email right now with the calendar invite and all the appointment details. Check your inbox at joshb@surprisegranite.com."

6. WHEN JOSH ASKS FOR CALENDAR:
Respond: "Perfect! I'm sending you a calendar invite via email right now. You'll be able to add it directly to your calendar app. It should arrive at joshb@surprisegranite.com within moments."

7. NATURAL CONVERSATION
- Be responsive to what Josh says
- Don't be pushy about sending things
- Only send when Josh explicitly asks
- Acknowledge each request warmly

8. ENDING
When the conversation is wrapping up:
"Great chatting with you, Josh! You should have everything you need via text and email. We're looking forward to seeing you Monday at noon. Have a wonderful day!"

Then be quiet and let the call end naturally.

IMPORTANT RULES:
- Listen for keywords: "text", "email", "calendar", "send"
- Respond immediately when Josh asks for something
- Confirm that you're "sending it right now"
- Be natural and conversational
- Don't end the call abruptly - let it wind down naturally
- Total conversation should be 1-2 minutes`,
            llm: 'gemini-2.5-flash',
            temperature: 0.8
          },
          firstMessage: "Hi Josh! This is Sarah from Remodely. How are you today?",
          language: 'en'
        },
        tts: {
          voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah
          model: 'eleven_flash_v2_5',
          optimizeStreamingLatency: 3
        },
        asr: {
          quality: 'high',
          provider: 'elevenlabs'
        },
        conversation: {
          maxDurationSeconds: 180 // 3 minutes max
        }
      }
    });

    console.log('✅ Agent created!');
    console.log('   Agent ID:', agent.agentId);
    console.log('\n📋 Agent will respond to:');
    console.log('   - "Can you text me?"');
    console.log('   - "Send me an email"');
    console.log('   - "Send calendar invite"');
    console.log('   - Or any variation of these requests');

    return agent;

  } catch (error) {
    console.error('❌ Failed:', error.message);
    if (error.body) console.error(JSON.stringify(error.body, null, 2));
    throw error;
  }
}

async function makeCall(agentId) {
  console.log('\n📞 Making call...\n');

  try {
    const call = await client.conversationalAi.batchCalls.create({
      callName: 'Keyword Test Call - Josh',
      agentId,
      agentPhoneNumberId: process.env.ELEVENLABS_PHONE_NUMBER_ID,
      recipients: [{ phoneNumber: '+14802555887' }]
    });

    console.log('✅ Call initiated!');
    console.log('   Batch ID:', call.batchId);
    console.log('\n📱 TEST INSTRUCTIONS:');
    console.log('   1. Answer the phone');
    console.log('   2. Have a natural conversation with Sarah');
    console.log('   3. Say things like:');
    console.log('      - "Can you text me the details?"');
    console.log('      - "Send me an email with that"');
    console.log('      - "Can you send a calendar invite?"');
    console.log('   4. Sarah will say she\'s "sending it now"');
    console.log('   5. Check for real SMS and emails!');
    console.log('\n⚠️  Note: Currently, sends happen after call ends.');
    console.log('   Working on mid-call triggering next.');

    return call;

  } catch (error) {
    console.error('❌ Failed:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Keyword-Responsive Appointment Agent\n');
  console.log('='.repeat(60));

  try {
    const agent = await createKeywordAgent();
    const call = await makeCall(agent.agentId);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Call in progress!');
    console.log('='.repeat(60));
    console.log('\n💡 Try asking for:');
    console.log('   - Text message');
    console.log('   - Email');
    console.log('   - Calendar invite');
    console.log('\nSarah will respond naturally!');

  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

main();
