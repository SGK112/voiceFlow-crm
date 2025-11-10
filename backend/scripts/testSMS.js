import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables FIRST before importing services
dotenv.config({ path: join(__dirname, '../../.env') });

// Now import the service after env vars are loaded
const { default: usageAlertService } = await import('../services/usageAlertService.js');

async function testSMS() {
  console.log('🧪 Testing SMS Notification...\n');

  // Test phone number
  const testPhone = '+14802555887'; // User's test number

  console.log(`📱 Sending test SMS to: ${testPhone}`);
  console.log(`📞 From Twilio number: ${process.env.TWILIO_PHONE_NUMBER}\n`);

  try {
    const result = await usageAlertService.testSMS(testPhone);

    console.log('\n✅ SMS TEST SUCCESSFUL!');
    console.log(`   Message SID: ${result.sid}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   To: ${result.to}`);
    console.log(`   From: ${result.from}`);

  } catch (error) {
    console.error('\n❌ SMS TEST FAILED!');
    console.error(`   Error: ${error.message}`);

    if (error.code === 20003) {
      console.error('\n   ⚠️  Authentication Error - Check your Twilio credentials:');
      console.error(`   TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '✓ Set' : '✗ Missing'}`);
      console.error(`   TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '✓ Set' : '✗ Missing'}`);
    } else if (error.code === 21211) {
      console.error('\n   ⚠️  Invalid phone number format. Should be: +14802555887');
    } else if (error.code === 21608) {
      console.error('\n   ⚠️  Twilio number not configured or invalid');
      console.error(`   TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER}`);
    }
  }
}

testSMS();
