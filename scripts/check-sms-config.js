import twilio from 'twilio';
import 'dotenv/config';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const MESSAGING_SERVICE_SID = 'MGa86452ccc15de86eee32177817a09d90';

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

async function checkSMSConfig() {
  try {
    console.log('🔍 Checking SMS Configuration...\n');

    // Check phone number configuration
    console.log('📱 Phone Number Configuration:');
    const phoneNumbers = await client.incomingPhoneNumbers.list({
      phoneNumber: TWILIO_PHONE_NUMBER
    });

    if (phoneNumbers.length > 0) {
      const phone = phoneNumbers[0];
      console.log(`   Phone: ${phone.phoneNumber}`);
      console.log(`   SMS URL: ${phone.smsUrl || '(none)'}`);
      console.log(`   SMS Method: ${phone.smsMethod || '(none)'}`);
      console.log(`   Messaging Service: ${phone.messagingServiceSid || '(none)'}\n`);
    }

    // Check messaging service configuration
    console.log('📨 Messaging Service Configuration:');
    const service = await client.messaging.v1.services(MESSAGING_SERVICE_SID).fetch();
    console.log(`   Service SID: ${service.sid}`);
    console.log(`   Friendly Name: ${service.friendlyName}`);
    console.log(`   Inbound Request URL: ${service.inboundRequestUrl || '(none)'}`);
    console.log(`   Inbound Method: ${service.inboundMethod || '(none)'}\n`);

    // Check phone numbers in messaging service
    console.log('📲 Phone Numbers in Messaging Service:');
    const serviceNumbers = await client.messaging.v1.services(MESSAGING_SERVICE_SID)
      .phoneNumbers
      .list();

    serviceNumbers.forEach(num => {
      console.log(`   ${num.phoneNumber}`);
    });

    console.log('\n✅ Configuration check complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSMSConfig();
