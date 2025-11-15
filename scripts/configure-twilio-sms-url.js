import twilio from 'twilio';
import 'dotenv/config';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://f66af302a875.ngrok-free.app';

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

async function configureSmsUrl() {
  try {
    console.log('🔧 Configuring Twilio SMS URL...\n');
    console.log(`   Phone Number: ${TWILIO_PHONE_NUMBER}`);
    console.log(`   SMS URL: ${WEBHOOK_URL}/api/webhooks/twilio/sms\n`);

    // Find the phone number SID
    const phoneNumbers = await client.incomingPhoneNumbers.list({
      phoneNumber: TWILIO_PHONE_NUMBER
    });

    if (phoneNumbers.length === 0) {
      throw new Error(`Phone number ${TWILIO_PHONE_NUMBER} not found in Twilio account`);
    }

    const phoneNumberSid = phoneNumbers[0].sid;
    console.log(`   Phone Number SID: ${phoneNumberSid}\n`);

    // Update the SMS URL
    const updatedNumber = await client.incomingPhoneNumbers(phoneNumberSid)
      .update({
        smsUrl: `${WEBHOOK_URL}/api/webhooks/twilio/sms`,
        smsMethod: 'POST',
        smsFallbackUrl: `${WEBHOOK_URL}/api/webhooks/twilio/sms-fallback`,
        smsFallbackMethod: 'POST'
      });

    console.log('✅ SMS URL configured successfully!\n');
    console.log('📋 Configuration:');
    console.log(`   SMS URL: ${updatedNumber.smsUrl}`);
    console.log(`   SMS Method: ${updatedNumber.smsMethod}`);
    console.log(`   Fallback URL: ${updatedNumber.smsFallbackUrl}\n`);

    console.log('🎯 Now when customers reply to SMS messages:');
    console.log('   • Twilio will send the message to your backend');
    console.log('   • Your backend can process the reply');
    console.log('   • You can send automated responses\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

configureSmsUrl();
