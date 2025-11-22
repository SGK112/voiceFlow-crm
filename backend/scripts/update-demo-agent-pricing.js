import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserAgent from '../models/UserAgent.js';

dotenv.config();

/**
 * Update Demo Agent Pricing
 *
 * Updates all demo agents with the correct Stripe Live pricing:
 * - Starter: $149/month
 * - Professional: $299/month
 * - Enterprise: $799/month
 */

const updateDemoAgentPricing = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all demo agents (agents with "demo" in the name or specific demo agent IDs)
    const demoAgents = await UserAgent.find({
      $or: [
        { name: /demo/i },
        { name: /voiceflow/i },
        { agentId: { $regex: /demo/i } }
      ]
    });

    console.log(`\n📋 Found ${demoAgents.length} demo agents to update`);

    if (demoAgents.length === 0) {
      console.log('ℹ️  No demo agents found. Exiting...');
      process.exit(0);
    }

    // Updated pricing information
    const pricingText = `We have three tiers: Starter at $149/month, Pro at $299/month (most popular), and Enterprise at $799/month`;

    for (const agent of demoAgents) {
      console.log(`\n🔄 Updating: ${agent.name} (ID: ${agent._id})`);

      // Update the prompt/script if it contains old pricing
      if (agent.prompt && (
        agent.prompt.includes('$99') ||
        agent.prompt.includes('$999') ||
        agent.prompt.includes('$249')
      )) {
        // Replace old pricing mentions
        let updatedPrompt = agent.prompt
          .replace(/\$99\/month/g, '$149/month')
          .replace(/\$999\/month/g, '$799/month')
          .replace(/\$249\/month/g, '$299/month')
          .replace(/Most popular is \$299\/month/g, pricingText);

        agent.prompt = updatedPrompt;
        await agent.save();
        console.log('   ✅ Updated prompt with correct pricing');
      } else {
        console.log('   ℹ️  No pricing updates needed in prompt');
      }
    }

    console.log('\n✅ All demo agents updated successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Starter: $149/month');
    console.log('   - Professional: $299/month (most popular)');
    console.log('   - Enterprise: $799/month');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating demo agents:', error);
    process.exit(1);
  }
};

updateDemoAgentPricing();
