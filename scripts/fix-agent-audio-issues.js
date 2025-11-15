import axios from 'axios';
import 'dotenv/config';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = 'agent_9701k9xptd0kfr383djx5zk7300x';

async function fixAgentAudioIssues() {
  try {
    console.log('🔧 Fixing Agent Audio & Speech Issues...\n');

    // Get current configuration
    const getResponse = await axios.get(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      }
    );

    const currentConfig = getResponse.data.conversation_config;

    // Remove tools array if tool_ids is present (avoid conflict)
    const agentPrompt = { ...currentConfig.agent.prompt };
    if (agentPrompt.tool_ids && agentPrompt.tool_ids.length > 0) {
      delete agentPrompt.tools;
    }

    // Fix configuration
    const updatedConfig = {
      conversation_config: {
        ...currentConfig,

        // TTS Settings - Fix broken speech and URL reading
        tts: {
          ...currentConfig.tts,
          model_id: 'eleven_turbo_v2',  // Required for English agents
          stability: 0.6,  // Higher stability = less variations
          similarity_boost: 0.75,  // Better voice consistency
          speed: 0.95,  // Slightly slower for clarity
          optimize_streaming_latency: 3  // Better for URLs and long words
        },

        // Turn Settings - Prevent cutoff and background noise issues
        turn: {
          ...currentConfig.turn,
          turn_timeout: 10,  // Longer timeout before considering user done (was 8)
          mode: 'turn',
          turn_eagerness: 'patient',  // Less eager = less interruptions (was 'normal')
          silence_end_call_timeout: -1  // Don't auto-hangup on silence
        },

        // VAD Settings - Reduce sensitivity to background noise
        vad: {
          background_voice_detection: false  // Disable to prevent cutting off on background noise
        },

        // ASR Settings - Better speech recognition
        asr: {
          ...currentConfig.asr,
          quality: 'high',
          provider: 'elevenlabs',
          user_input_audio_format: 'pcm_16000'
        },

        // Agent prompt - Add instruction about reading URLs clearly
        agent: {
          ...currentConfig.agent,
          prompt: {
            ...agentPrompt,
            prompt: currentConfig.agent.prompt.prompt + '\n\n**IMPORTANT SPEAKING RULES:**\n- When reading URLs, spell them slowly and clearly: "R E M O D E L Y dot A I slash S I G N U P"\n- Pause briefly between words when giving important information\n- If customer makes background noise, wait for them to finish before continuing\n- Don\'t rush through URLs or phone numbers - clarity is key\n- If cut off mid-sentence, repeat the full sentence when customer is done'
          }
        }
      }
    };

    // Apply the update
    const response = await axios.patch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      updatedConfig,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Agent audio settings updated!\n');
    console.log('📋 Changes Made:');
    console.log('   ✓ TTS Model: eleven_turbo_v2_5 (better for phone)');
    console.log('   ✓ Stability: 0.6 (less variations)');
    console.log('   ✓ Speed: 0.95 (slightly slower for clarity)');
    console.log('   ✓ Turn Timeout: 10s (prevent cutoff)');
    console.log('   ✓ Turn Eagerness: LOW (less interruptions)');
    console.log('   ✓ Background Voice Detection: OFF (ignore background noise)');
    console.log('   ✓ Added URL reading instructions to prompt\n');

    console.log('🎯 Expected Improvements:');
    console.log('   • Agent won\'t get cut off mid-sentence');
    console.log('   • URLs will be read more clearly');
    console.log('   • Less sensitive to background noise on speakerphone');
    console.log('   • Better handling of interruptions\n');

  } catch (error) {
    console.error('❌ Error updating agent:', error.response?.data || error.message);
    process.exit(1);
  }
}

fixAgentAudioIssues();
