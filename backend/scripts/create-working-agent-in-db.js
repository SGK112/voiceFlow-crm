import mongoose from 'mongoose';
import dotenv from 'dotenv';
import VoiceAgent from '../models/VoiceAgent.js';
import User from '../models/User.js';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB\n');

const AGENT_ID = 'agent_4401kacmh26fet9asap21g1516p5';
const PHONE_NUMBER = '+16028337194';

// Find a user to assign this agent to (use the first user or create test user)
let user = await User.findOne();

if (!user) {
  console.log('⚠️  No users found, creating test user...');
  user = await User.create({
    name: 'Test User',
    email: 'test@surprisegranite.com',
    password: 'temppassword123',
    plan: 'professional'
  });
  console.log('✅ Test user created:', user._id);
}

console.log('👤 Using user:', user.email, '(', user._id, ')\n');

// Check if agent already exists
let agent = await VoiceAgent.findOne({ elevenLabsAgentId: AGENT_ID });

if (agent) {
  console.log('✅ Agent already exists in database');
  console.log('   ID:', agent._id);
  console.log('   Name:', agent.name);
  console.log('   User:', agent.userId);
} else {
  console.log('📝 Creating agent in database...');

  agent = await VoiceAgent.create({
    userId: user._id,
    name: 'Surprise Granite - Inbound Support',
    type: 'support', // Using valid enum value
    elevenLabsAgentId: AGENT_ID,
    voiceId: 'cgSgspJ2msm6clMCkdW9', // Jessica
    voiceName: 'Jessica',
    phoneNumber: PHONE_NUMBER,
    script: `You are Sarah, a friendly and professional intake coordinator for Surprise Granite.`,
    firstMessage: 'Hey! Thanks for calling Surprise Granite. We do direct onsite consultations for countertops and remodeling. What can I help you with today?',
    configuration: {
      temperature: 0.7,
      maxDuration: 600,
      language: 'en',
      business_address: '123 Main St, Surprise, AZ 85374'
    },
    enabled: true
  });

  console.log('✅ Agent created in database');
  console.log('   ID:', agent._id);
  console.log('   Name:', agent.name);
  console.log('   ElevenLabs ID:', agent.elevenLabsAgentId);
}

console.log('\n✅ Setup complete!');
console.log('   Agent in database with userId:', agent.userId);
console.log('   Webhook will now work properly');

await mongoose.disconnect();
