import mongoose from 'mongoose';
import dotenv from 'dotenv';
import VoiceAgent from '../models/VoiceAgent.js';

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB\n');

// Find and delete Emma (the one with no ElevenLabs ID)
const emma = await VoiceAgent.findOne({ name: 'Surprise Granite - Emma (Main Reception)' });

if (emma) {
  console.log('Found Emma:');
  console.log('   DB ID:', emma._id);
  console.log('   ElevenLabs ID:', emma.elevenLabsAgentId || 'NONE');
  console.log('   User ID:', emma.userId || 'NONE');

  await VoiceAgent.deleteOne({ _id: emma._id });
  console.log('\n✅ Emma deleted');
} else {
  console.log('Emma not found');
}

await mongoose.disconnect();
