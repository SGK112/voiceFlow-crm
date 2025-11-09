import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const PHONE_NUMBER_ID = 'phnum_1801k7xb68cefjv89rv10f90qykv';

async function testPhoneEndpoint(customerPhone) {
  try {
    console.log('📞 Testing phone number endpoint...\\n');
    console.log(`Phone Number ID: ${PHONE_NUMBER_ID}`);
    console.log(`Customer Phone: ${customerPhone}\\n`);

    // Try calling from phone number endpoint instead
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/convai/phone-numbers/${PHONE_NUMBER_ID}/call`,
      {
        customer_phone_number: customerPhone
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Call initiated successfully!\\n');
    console.log('Call Details:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\\n❌ Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

const customerPhone = process.argv[2] || '+14802555887';
testPhoneEndpoint(customerPhone);
