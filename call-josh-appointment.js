/**
 * Appointment Booking Agent - Real World Test
 *
 * Customer: Josh B
 * Email: joshb@surprisegranite.com
 * Phone: 480-255-5887
 * Appointment: Monday at 12:00 PM (noon)
 *
 * Flow:
 * 1. Call customer
 * 2. Greet and confirm appointment details
 * 3. Send SMS with signup link (Remodely.ai/signup)
 * 4. Send confirmation email to customer
 * 5. Send lead notification to help.remodely@gmail.com
 * 6. End call
 */

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import dotenv from 'dotenv';

dotenv.config();

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

const CUSTOMER = {
  name: 'Josh',
  fullName: 'Josh B',
  phone: '+14802555887',
  email: 'joshb@surprisegranite.com',
  appointment: {
    day: 'Monday',
    time: '12:00 PM',
    date: '2025-11-24', // Next Monday
    service: 'Kitchen Remodeling Consultation'
  }
};

async function createAppointmentAgent() {
  console.log('\n🤖 Creating appointment booking agent...\n');

  try {
    const agent = await client.conversationalAi.agents.create({
      name: 'Appointment Booking Agent - Josh Test',
      conversationConfig: {
        agent: {
          prompt: {
            prompt: `You are Sarah, a professional appointment coordinator for Remodely - a kitchen and bathroom remodeling company.

CUSTOMER INFORMATION:
- Name: ${CUSTOMER.fullName}
- Phone: ${CUSTOMER.phone}
- Email: ${CUSTOMER.email}
- Appointment: ${CUSTOMER.appointment.day} at ${CUSTOMER.appointment.time}
- Service: ${CUSTOMER.appointment.service}

YOUR TASK:
Call the customer to confirm their appointment and send them all necessary information.

CONVERSATION FLOW (Keep under 90 seconds):

1. GREETING & INTRODUCTION (10 seconds)
"Hi ${CUSTOMER.name}! This is Sarah calling from Remodely, your kitchen and bathroom remodeling specialists. How are you today?"

Wait for response.

2. APPOINTMENT CONFIRMATION (15 seconds)
"I'm calling to confirm your ${CUSTOMER.appointment.service} scheduled for ${CUSTOMER.appointment.day} at ${CUSTOMER.appointment.time}. Does that still work for you?"

Wait for response.

3. SEND SIGNUP LINK VIA SMS (20 seconds)
"Perfect! I'm going to text you a link right now to create your account on our platform. This will make scheduling future appointments much easier."

IMMEDIATELY USE send_sms tool with these EXACT parameters:
{
  "to": "${CUSTOMER.phone}",
  "message": "Hi ${CUSTOMER.name}! Thanks for choosing Remodely for your kitchen remodel. Create your account here: https://Remodely.ai/signup - See you ${CUSTOMER.appointment.day} at ${CUSTOMER.appointment.time}! - Sarah from Remodely"
}

4. CONFIRM SMS SENT (5 seconds)
After send_sms returns success:
"Great! I just sent you that text with the signup link. You should have it now."

5. SEND CONFIRMATION EMAIL (20 seconds)
"I'm also sending you a confirmation email with all the appointment details."

IMMEDIATELY USE send_email tool with these EXACT parameters:
{
  "to": "${CUSTOMER.email}",
  "subject": "Appointment Confirmed - ${CUSTOMER.appointment.day} at ${CUSTOMER.appointment.time}",
  "body": "Hi ${CUSTOMER.fullName},\\n\\nYour appointment is confirmed!\\n\\nService: ${CUSTOMER.appointment.service}\\nDate: ${CUSTOMER.appointment.day}, ${CUSTOMER.appointment.date}\\nTime: ${CUSTOMER.appointment.time}\\n\\nWe're excited to help transform your space!\\n\\nCreate your account: https://Remodely.ai/signup\\n\\nBest regards,\\nSarah\\nRemodely - Kitchen & Bathroom Remodeling\\nPhone: (602) 833-4780\\nEmail: help.remodely@gmail.com"
}

6. SEND INTERNAL LEAD NOTIFICATION (15 seconds)
"Let me also update our team about your appointment."

IMMEDIATELY USE send_email tool AGAIN with these EXACT parameters:
{
  "to": "help.remodely@gmail.com",
  "subject": "New Lead: ${CUSTOMER.fullName} - Appointment ${CUSTOMER.appointment.day} ${CUSTOMER.appointment.time}",
  "body": "New appointment booked:\\n\\nCustomer: ${CUSTOMER.fullName}\\nPhone: ${CUSTOMER.phone}\\nEmail: ${CUSTOMER.email}\\n\\nAppointment Details:\\nService: ${CUSTOMER.appointment.service}\\nDate: ${CUSTOMER.appointment.day}, ${CUSTOMER.appointment.date}\\nTime: ${CUSTOMER.appointment.time}\\n\\nStatus: Confirmed via phone call\\nSMS sent: Yes (with signup link)\\nConfirmation email sent: Yes\\n\\nAction Required: Prepare for consultation"
}

7. CLOSING (10 seconds)
After both emails are sent:
"Perfect! You should receive the confirmation email shortly, and I've notified our team. Is there anything else I can help you with before ${CUSTOMER.appointment.day}?"

Wait briefly for response.

"Great! We're looking forward to seeing you ${CUSTOMER.appointment.day} at ${CUSTOMER.appointment.time}. Have a wonderful day, ${CUSTOMER.name}!"

8. END CALL
IMMEDIATELY USE end_call tool.

CRITICAL RULES:
- MUST use send_sms tool - don't just talk about it
- MUST use send_email tool TWICE (once for customer, once for internal notification)
- MUST use end_call tool after goodbye
- Keep conversation professional and efficient
- Total call should be under 90 seconds
- Actually INVOKE the tools, don't skip them

EXAMPLE OF CORRECT TOOL USAGE:
[Agent says something] → [USES tool] → [Waits for result] → [Confirms tool worked] → [Continues]

DO NOT just describe what you would do - ACTUALLY DO IT by invoking the tools!`,
            llm: 'gemini-2.5-flash',
            temperature: 0.7
          },
          firstMessage: `Hi ${CUSTOMER.name}! This is Sarah from Remodely. How are you today?`,
          language: 'en'
        },
        tts: {
          voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah voice
          model: 'eleven_flash_v2_5',
          optimizeStreamingLatency: 3
        },
        asr: {
          quality: 'high',
          provider: 'elevenlabs'
        }
      }
    });

    console.log('✅ Agent created successfully!');
    console.log('   Agent ID:', agent.agentId);
    console.log('   Agent Name:', agent.name || 'Appointment Booking Agent');
    console.log('\n📋 Agent will:');
    console.log('   1. Call Josh and confirm appointment');
    console.log('   2. Send SMS with Remodely.ai/signup link');
    console.log('   3. Send confirmation email to joshb@surprisegranite.com');
    console.log('   4. Send lead notification to help.remodely@gmail.com');
    console.log('   5. End call properly');

    return agent;

  } catch (error) {
    console.error('❌ Failed to create agent:', error.message);
    if (error.body) {
      console.error('   Details:', JSON.stringify(error.body, null, 2));
    }
    throw error;
  }
}

async function makeAppointmentCall(agentId) {
  console.log('\n📞 Initiating appointment confirmation call...\n');

  try {
    const call = await client.conversationalAi.batchCalls.create({
      callName: `Appointment Confirmation - ${CUSTOMER.fullName}`,
      agentId: agentId,
      agentPhoneNumberId: process.env.ELEVENLABS_PHONE_NUMBER_ID,
      recipients: [
        {
          phoneNumber: CUSTOMER.phone
        }
      ]
    });

    console.log('✅ Call initiated!');
    console.log('   Batch ID:', call.batchId);
    console.log('   Calling:', CUSTOMER.phone, `(${CUSTOMER.fullName})`);

    console.log('\n📱 What will happen:');
    console.log('   1. Your phone will ring');
    console.log('   2. Sarah will confirm your Monday 12 PM appointment');
    console.log('   3. You\'ll receive SMS: "Create your account here: https://Remodely.ai/signup"');
    console.log('   4. You\'ll receive email confirmation at joshb@surprisegranite.com');
    console.log('   5. help.remodely@gmail.com will get lead notification');
    console.log('   6. Call will end automatically');

    console.log('\n🔍 Monitor webhook logs for:');
    console.log('   - Tool: send_sms (to Josh)');
    console.log('   - Tool: send_email (to Josh - confirmation)');
    console.log('   - Tool: send_email (to help.remodely - lead notification)');
    console.log('   - Tool: end_call');

    return call;

  } catch (error) {
    console.error('❌ Failed to initiate call:', error.message);
    if (error.body) {
      console.error('   Details:', JSON.stringify(error.body, null, 2));
    }
    throw error;
  }
}

async function main() {
  console.log('🚀 Remodely Appointment Booking System - Live Test\n');
  console.log('='.repeat(70));
  console.log('Customer: Josh B');
  console.log('Phone: 480-255-5887');
  console.log('Email: joshb@surprisegranite.com');
  console.log('Appointment: Monday at 12:00 PM - Kitchen Remodeling Consultation');
  console.log('='.repeat(70));

  try {
    // Create agent
    const agent = await createAppointmentAgent();

    // Make the call
    const call = await makeAppointmentCall(agent.agentId);

    console.log('\n' + '='.repeat(70));
    console.log('✅ APPOINTMENT BOOKING CALL IN PROGRESS');
    console.log('='.repeat(70));
    console.log('\n📞 Answer your phone and interact with Sarah!');
    console.log('\n💡 Check:');
    console.log('   - Phone: SMS with signup link');
    console.log('   - Email (joshb@): Appointment confirmation');
    console.log('   - Email (help.remodely@): Lead notification');
    console.log('\n⏱️  Expected duration: ~90 seconds');

  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ FAILED');
    console.error('='.repeat(70));
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
