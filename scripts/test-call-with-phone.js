import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const LEAD_GEN_AGENT_ID = process.env.ELEVENLABS_LEAD_GEN_AGENT_ID;

// Using one of the available phone numbers
const PHONE_NUMBER_ID = 'phnum_1801k7xb68cefjv89rv10f90qykv'; // +16028334780

async function makeTestCall(customerPhone) {
  try {
    console.log('📞 Initiating test call...\\n');
    console.log(`Agent ID: ${LEAD_GEN_AGENT_ID}`);
    console.log(`Phone Number ID: ${PHONE_NUMBER_ID}`);
    console.log(`Customer Phone: ${customerPhone}`);
    console.log(`API Key: ${ELEVENLABS_API_KEY.substring(0, 15)}...\\n`);

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/convai/agents/${LEAD_GEN_AGENT_ID}/initiate`,
      {
        agent_phone_number_id: PHONE_NUMBER_ID,
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
    console.error('\\n❌ Error making call:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

const customerPhone = process.argv[2] || '+14802555887';
makeTestCall(customerPhone);
