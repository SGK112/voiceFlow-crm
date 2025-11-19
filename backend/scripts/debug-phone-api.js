import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PHONE_ID = 'phnum_2701kacmjq23fzaacdgqwt0qty0b';

console.log('🔍 Debugging ElevenLabs Phone API response...\n');

try {
  // Get phone number details
  const response = await axios.get(
    `https://api.elevenlabs.io/v1/convai/phone-numbers/${PHONE_ID}`,
    {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    }
  );

  console.log('📞 Full API Response:');
  console.log(JSON.stringify(response.data, null, 2));

} catch (error) {
  console.error('❌ Error:', error.response?.status, error.response?.statusText);
  console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
}
