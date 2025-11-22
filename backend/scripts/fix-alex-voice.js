import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import VoiceAgent from '../models/VoiceAgent.js';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

async function fixAlexVoice() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the agent from database
    const agent = await VoiceAgent.findById('69210b12dd690c879bd6fbcc');

    if (!agent) {
      console.error('❌ Agent not found');
      return;
    }

    console.log('📋 Agent Details:');
    console.log('   Name:', agent.name);
    console.log('   ElevenLabs ID:', agent.elevenLabsAgentId);
    console.log('   Current Voice:', agent.voiceName, '(' + agent.voiceId + ')');
    console.log('   Script:', agent.script.substring(0, 100) + '...');
    console.log('   First Message:', agent.firstMessage);

    // Roger's voice ID
    const rogerVoiceId = 'CwhRBWXzGAHq8TQ4Fs17';

    console.log('\n🔧 Updating ElevenLabs agent to use Roger\'s voice...');

    // Update via ElevenLabs API
    const updatePayload = {
      name: agent.name,
      prompt: agent.script,
      first_message: agent.firstMessage,
      tts: {
        voice_id: rogerVoiceId,
        model_id: 'eleven_flash_v2'
      }
    };

    const response = await axios.patch(
      `${ELEVENLABS_API_URL}/convai/agents/${agent.elevenLabsAgentId}`,
      updatePayload,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ ElevenLabs agent updated successfully!');
    console.log('   Voice is now set to: Roger (' + rogerVoiceId + ')');

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Done!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixAlexVoice();
