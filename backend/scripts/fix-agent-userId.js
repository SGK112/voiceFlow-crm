import mongoose from 'mongoose';
import dotenv from 'dotenv';
import VoiceAgent from '../models/VoiceAgent.js';
import User from '../models/User.js';

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB\n');

const AGENT_ID = 'agent_4401kacmh26fet9asap21g1516p5';

// Find all agents with this ElevenLabs ID
const agents = await VoiceAgent.find({ elevenLabsAgentId: AGENT_ID });

console.log(`Found ${agents.length} agent(s) with ID ${AGENT_ID}:\n`);

for (const agent of agents) {
  console.log('Agent:', agent.name);
  console.log('   DB ID:', agent._id);
  console.log('   User ID:', agent.userId);
  console.log('   Type:', agent.type);
  console.log('');

  // If no userId, assign it to the first user
  if (!agent.userId) {
    const user = await User.findOne();
    console.log('⚠️  No userId - assigning to:', user.email);
    agent.userId = user._id;
    await agent.save();
    console.log('✅ Updated!');
  }
}

console.log('\n✅ All agents have userIds now');

await mongoose.disconnect();
