/**
 * Simple Appointment Confirmation Call
 *
 * This agent just has a conversation with Josh.
 * When the call ends, the post-call webhook automatically:
 * - Sends SMS with signup link
 * - Sends calendar invite email
 * - Sends lead notification to team
 *
 * No tools needed - everything happens after the call!
 */

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import dotenv from 'dotenv';

dotenv.config();

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

async function createSimpleAgent() {
  console.log('\n🤖 Creating simple appointment agent...\n');

  try {
    const agent = await client.conversationalAi.agents.create({
      name: 'Simple Appointment Agent - Josh',
      conversationConfig: {
        agent: {
          prompt: {
            prompt: `You are Sarah from Remodely, a friendly appointment coordinator.

CUSTOMER: Josh B (480-255-5887, joshb@surprisegranite.com)
APPOINTMENT: Monday at 12:00 PM - Kitchen Remodeling Consultation

YOUR TASK:
Have a brief, professional conversation to confirm the appointment.

CONVERSATION (30-45 seconds):

1. GREETING
"Hi Josh! This is Sarah from Remodely. How are you doing today?"

Wait for response.

2. APPOINTMENT CONFIRMATION
"I'm calling to confirm your kitchen remodeling consultation for Monday at noon. Does that time still work for you?"

Wait for response.

3. EXPLAIN WHAT'S NEXT
"Perfect! After this call, I'll text you a link to create your account on our platform. You'll also receive a calendar invite and confirmation email with all the details."

4. ASK IF QUESTIONS
"Do you have any questions about the consultation or what to expect?"

Wait briefly for response.

5. FRIENDLY CLOSE
"Great! We're really excited to help you with your kitchen remodel. You'll get all the info via text and email in just a moment. Have a wonderful day, Josh!"

6. HANG UP
Then simply stop talking and the call will end.

RULES:
- Keep it under 45 seconds
- Be warm and professional
- Don't try to send anything during the call
- Just have the conversation
- Let the system handle the rest after you hang up`,
            llm: 'gemini-2.5-flash',
            temperature: 0.7
          },
          firstMessage: "Hi Josh! This is Sarah from Remodely. How are you doing today?",
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
          maxDurationSeconds: 90 // Auto-end after 90 seconds
        }
      }
    });

    console.log('✅ Agent created!');
    console.log('   Agent ID:', agent.agentId);
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
      callName: 'Simple Appointment Call - Josh',
      agentId,
      agentPhoneNumberId: process.env.ELEVENLABS_PHONE_NUMBER_ID,
      recipients: [{ phoneNumber: '+14802555887' }]
    });

    console.log('✅ Call initiated!');
    console.log('   Batch ID:', call.batchId);
    console.log('\n📱 What happens:');
    console.log('   1. Phone rings, Sarah calls to confirm appointment');
    console.log('   2. Brief friendly conversation (30-45 seconds)');
    console.log('   3. Call ends');
    console.log('   4. POST-CALL AUTOMATION triggers:');
    console.log('      → SMS with Remodely.ai/signup link');
    console.log('      → Calendar invite to joshb@surprisegranite.com');
    console.log('      → Lead notification to help.remodely@gmail.com');

    return call;

  } catch (error) {
    console.error('❌ Failed:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Remodely - Simple Appointment Confirmation\n');
  console.log('='.repeat(60));

  try {
    const agent = await createSimpleAgent();
    const call = await makeCall(agent.agentId);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS - Call in progress!');
    console.log('='.repeat(60));
    console.log('\n💡 After the call ends, check:');
    console.log('   - SMS on your phone');
    console.log('   - Email at joshb@surprisegranite.com');
    console.log('   - Email at help.remodely@gmail.com');

  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

main();
