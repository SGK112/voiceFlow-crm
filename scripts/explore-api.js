import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

async function exploreAPI() {
  try {
    console.log('🔍 Exploring ElevenLabs API endpoints...\n');

    // Try to get phone numbers
    console.log('1. Checking available phone numbers...');
    try {
      const phoneResponse = await axios.get(
        'https://api.elevenlabs.io/v1/convai/phone-numbers',
        {
          headers: { 'xi-api-key': ELEVENLABS_API_KEY }
        }
      );
      console.log('✅ Phone numbers found:');
      console.log(JSON.stringify(phoneResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Phone numbers endpoint:', error.response?.status, error.response?.data?.detail || error.message);
    }

    console.log('\n2. Checking batch calling endpoints...');
    try {
      const batchResponse = await axios.get(
        'https://api.elevenlabs.io/v1/convai/batches',
        {
          headers: { 'xi-api-key': ELEVENLABS_API_KEY }
        }
      );
      console.log('✅ Batches found:');
      console.log(JSON.stringify(batchResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Batches endpoint:', error.response?.status, error.response?.data?.detail || error.message);
    }

    console.log('\n3. Checking calls endpoint...');
    try {
      const callsResponse = await axios.get(
        'https://api.elevenlabs.io/v1/convai/calls',
        {
          headers: { 'xi-api-key': ELEVENLABS_API_KEY }
        }
      );
      console.log('✅ Calls found:');
      console.log(JSON.stringify(callsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Calls endpoint:', error.response?.status, error.response?.data?.detail || error.message);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

exploreAPI();
