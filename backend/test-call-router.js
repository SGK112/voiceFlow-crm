/**
 * Test script for LangGraph Call Router
 *
 * Usage: node backend/test-call-router.js
 */

import dotenv from 'dotenv';
import { getCallRouter } from './ai-agents/routers/callRouter.js';

// Load environment variables
dotenv.config();

// Test scenarios
const testScenarios = [
  {
    name: 'Voicemail Detection',
    callId: 'test-vm-001',
    transcript: "Hi, you've reached John's voicemail. Please leave a message after the beep..."
  },
  {
    name: 'Sales Intent',
    callId: 'test-sales-001',
    transcript: "Hi, I'm interested in getting a quote for a kitchen remodel. I'd like to schedule a consultation."
  },
  {
    name: 'Support Request',
    callId: 'test-support-001',
    transcript: "Hello, I need help with my recent invoice. There seems to be an error in the billing amount."
  },
  {
    name: 'General Information',
    callId: 'test-info-001',
    transcript: "What are your business hours? I want to know when I can call back."
  },
  {
    name: 'Ambiguous Query',
    callId: 'test-ambiguous-001',
    transcript: "Um, hi... I was calling about... you know, the thing."
  }
];

async function runTests() {
  console.log('🧪 Testing LangGraph Call Router\n');
  console.log('═'.repeat(80));

  const router = getCallRouter();

  for (const scenario of testScenarios) {
    console.log(`\n📞 Test: ${scenario.name}`);
    console.log(`   Transcript: "${scenario.transcript}"`);
    console.log('   ───────────────────────────────────────');

    try {
      const result = await router.route(scenario.callId, scenario.transcript);

      console.log(`   ✅ Intent: ${result.intent} (${Math.round(result.confidence * 100)}% confidence)`);
      console.log(`   📍 Route: ${result.route}`);
      console.log(`   🎯 Action: ${result.shouldTerminate ? 'TERMINATE CALL' : 'CONTINUE'}`);
      console.log(`   💬 Response Preview: ${result.response?.substring(0, 80)}...`);

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log('✅ All tests completed!\n');
  process.exit(0);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
