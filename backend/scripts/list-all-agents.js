import mongoose from 'mongoose';
import dotenv from 'dotenv';
import VoiceAgent from '../models/VoiceAgent.js';

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB\n');

const agents = await VoiceAgent.find({});

console.log(`Found ${agents.length} total agents:\n`);

for (const agent of agents) {
  console.log(`📞 ${agent.name}`);
  console.log(`   DB ID: ${agent._id}`);
  console.log(`   ElevenLabs ID: ${agent.elevenLabsAgentId || 'NONE'}`);
  console.log(`   User ID: ${agent.userId || 'NONE'}`);
  console.log(`   Type: ${agent.type}`);
  console.log(`   Enabled: ${agent.enabled}`);
  console.log('');
}

await mongoose.disconnect();
