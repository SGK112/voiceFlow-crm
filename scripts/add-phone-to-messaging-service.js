import twilio from 'twilio';
import 'dotenv/config';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER; // +16028337194
const MESSAGING_SERVICE_SID = 'MGa86452ccc15de86eee32177817a09d90';

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

async function addPhoneToMessagingService() {
  try {
    console.log('📱 Adding phone to messaging service...\n');
    console.log(`   Phone: ${TWILIO_PHONE_NUMBER}`);
    console.log(`   Service: ${MESSAGING_SERVICE_SID}\n`);

    // First, get the phone number SID
    const phoneNumbers = await client.incomingPhoneNumbers.list({
      phoneNumber: TWILIO_PHONE_NUMBER
    });

    if (phoneNumbers.length === 0) {
      throw new Error(`Phone number ${TWILIO_PHONE_NUMBER} not found`);
    }

    const phoneNumberSid = phoneNumbers[0].sid;
    console.log(`   Phone Number SID: ${phoneNumberSid}\n`);

    // Add the phone number to the messaging service
    const phoneNumber = await client.messaging.v1
      .services(MESSAGING_SERVICE_SID)
      .phoneNumbers
      .create({ phoneNumberSid: phoneNumberSid });

    console.log('✅ Phone number added to messaging service!');
    console.log(`   Phone: ${phoneNumber.phoneNumber}`);
    console.log(`   SID: ${phoneNumber.sid}\n`);

    // Update the phone number to use the messaging service
    await client.incomingPhoneNumbers(phoneNumberSid).update({
      smsUrl: '', // Clear the SMS URL - messaging service will handle it
      messagingServiceSid: MESSAGING_SERVICE_SID
    });

    console.log('✅ Phone number updated to use messaging service!\n');

    // Verify the configuration
    const updatedPhone = await client.incomingPhoneNumbers(phoneNumberSid).fetch();
    console.log('📋 Updated Configuration:');
    console.log(`   Phone: ${updatedPhone.phoneNumber}`);
    console.log(`   Messaging Service: ${updatedPhone.messagingServiceSid}`);
    console.log(`   SMS URL: ${updatedPhone.smsUrl || '(using messaging service)'}\n`);

    console.log('🎉 All done! The phone number is now part of the messaging service.');
    console.log('   This should resolve the A2P messaging errors.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 20001) {
      console.log('\n💡 The phone number may already be in the messaging service.');
    }
    process.exit(1);
  }
}

addPhoneToMessagingService();
