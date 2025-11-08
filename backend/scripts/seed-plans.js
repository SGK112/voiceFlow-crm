import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Subscription Plan Schema
const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  callLimit: {
    type: Number, // Minutes per month
    required: true
  },
  features: [{
    type: String
  }],
  stripeProductId: String,
  stripePriceId: String,
  overageRate: {
    type: Number, // Cost per minute over limit
    default: 0.60
  },
  agentLimit: {
    type: Number,
    default: 1
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

// Plans data
const plans = [
  {
    name: 'trial',
    displayName: 'Free Trial',
    price: 0,
    callLimit: 50, // 50 minutes
    agentLimit: 1,
    features: [
      '14 Days Free',
      '1 AI Voice Agent',
      '50 Minutes Included',
      'Lead Capture & CRM',
      'Email Notifications',
      'Basic Support'
    ],
    overageRate: 0,
    active: true
  },
  {
    name: 'starter',
    displayName: 'Starter',
    price: 99,
    callLimit: 200,
    agentLimit: 1,
    features: [
      '1 AI Voice Agent',
      '200 Minutes/Month',
      '~40 calls (5 min each)',
      'Lead Capture & CRM',
      'Email Notifications',
      'Phone Number Included'
    ],
    overageRate: 0.60,
    stripePriceId: process.env.STRIPE_PRICE_STARTER || '',
    active: true
  },
  {
    name: 'professional',
    displayName: 'Professional',
    price: 299,
    callLimit: 1000,
    agentLimit: 5,
    features: [
      '5 AI Voice Agents',
      '1,000 Minutes/Month',
      '~200 calls (5 min each)',
      'Advanced Workflows',
      'SMS & Email Automation',
      'Calendar Integration',
      'Priority Support'
    ],
    overageRate: 0.50,
    stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL || '',
    active: true
  },
  {
    name: 'enterprise',
    displayName: 'Enterprise',
    price: 999,
    callLimit: 5000,
    agentLimit: 999,
    features: [
      'Unlimited AI Agents',
      '5,000 Minutes/Month',
      '~1,000 calls included',
      'Custom Workflows',
      'White-Label Options',
      'Dedicated Account Manager',
      'Custom AI Training'
    ],
    overageRate: 0.40,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
    active: true
  }
];

// Seed function
const seedPlans = async () => {
  try {
    await connectDB();

    console.log('🌱 Seeding subscription plans...');

    // Clear existing plans
    await SubscriptionPlan.deleteMany({});
    console.log('🗑️  Cleared existing plans');

    // Insert new plans
    const createdPlans = await SubscriptionPlan.insertMany(plans);
    console.log(`✅ Created ${createdPlans.length} subscription plans:`);

    createdPlans.forEach(plan => {
      console.log(`   - ${plan.displayName}: $${plan.price}/month (${plan.callLimit} minutes)`);
    });

    console.log('\n✨ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedPlans();
