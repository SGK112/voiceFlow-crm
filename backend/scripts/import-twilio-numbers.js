import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import '../config/database.js'; // This ensures connection happens

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import models
import User from '../models/User.js';
import PhoneNumber from '../models/PhoneNumber.js';

// Your Twilio numbers
const TWILIO_NUMBERS = [
  {
    phoneNumber: '+16028337194',
    sid: 'PN54e75c91250a447fa1d5a085232a1fc8',
    friendlyName: 'SMS Demo Line',
    capabilities: { voice: true, sms: true, mms: true }
  },
  {
    phoneNumber: '+16028335307',
    sid: 'PN0c73817ce2bdc29b6b2b664276dc2dea',
    friendlyName: 'Surprise Granite - Main Line',
    capabilities: { voice: true, sms: true, mms: true }
  },
  {
    phoneNumber: '+16028334780',
    sid: 'PN14cbc458f8f486f55796612209ce8de8',
    friendlyName: "David's Number (A2P Registered)",
    capabilities: { voice: true, sms: true, mms: true }
  }
];

async function importNumbers() {
  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a user (using the first user in the database)
    let user = await User.findOne();

    if (!user) {
      console.log('⚠️  No users found in database. Creating a demo user...');
      user = await User.create({
        name: 'Demo User',
        email: 'demo@voiceflow.com',
        password: 'demo123' // This will be hashed by the User model
      });
      console.log('✅ Demo user created');
    }

    console.log(`\n📞 Importing ${TWILIO_NUMBERS.length} Twilio numbers for user: ${user.email}\n`);

    for (const numberData of TWILIO_NUMBERS) {
      try {
        // Check if number already exists
        const existing = await PhoneNumber.findOne({ phoneNumber: numberData.phoneNumber });

        if (existing) {
          console.log(`⏭️  ${numberData.phoneNumber} - Already exists (${numberData.friendlyName})`);
          continue;
        }

        // Create new phone number record
        const phoneNumber = await PhoneNumber.create({
          userId: user._id,
          phoneNumber: numberData.phoneNumber,
          friendlyName: numberData.friendlyName,
          twilioSid: numberData.sid,
          capabilities: numberData.capabilities,
          status: 'active'
        });

        console.log(`✅ ${phoneNumber.phoneNumber} - Imported successfully (${phoneNumber.friendlyName})`);
      } catch (error) {
        console.error(`❌ Failed to import ${numberData.phoneNumber}:`, error.message);
      }
    }

    console.log('\n🎉 Import complete!');
    console.log('\nYour numbers are now available in VoiceFlow:');

    const allNumbers = await PhoneNumber.find({ userId: user._id });
    allNumbers.forEach(num => {
      console.log(`   📞 ${num.phoneNumber} - ${num.friendlyName}`);
    });

    console.log('\n💡 You can now use these numbers in the Inbound/Outbound Call nodes!');

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the import
importNumbers();
