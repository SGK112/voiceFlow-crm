import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function queryStripeAccount() {
  console.log('🔍 Querying Stripe Account...\n');

  try {
    // Get all products
    console.log('📦 Products:');
    const products = await stripe.products.list({ limit: 100 });
    for (const product of products.data) {
      console.log(`\n  - ${product.name} (${product.id})`);
      console.log(`    Active: ${product.active}`);
      console.log(`    Description: ${product.description || 'N/A'}`);
    }

    console.log('\n\n💰 Prices:');
    const prices = await stripe.prices.list({ limit: 100 });
    for (const price of prices.data) {
      const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'N/A';
      const interval = price.recurring ? `/${price.recurring.interval}` : ' (one-time)';
      console.log(`\n  - ${price.id}`);
      console.log(`    Product: ${price.product}`);
      console.log(`    Amount: ${amount}${interval}`);
      console.log(`    Active: ${price.active}`);
    }

    console.log('\n\n🎫 Existing Price IDs from .env:');
    console.log(`  STARTER: ${process.env.STRIPE_STARTER_PRICE_ID}`);
    console.log(`  PROFESSIONAL: ${process.env.STRIPE_PROFESSIONAL_PRICE_ID}`);
    console.log(`  ENTERPRISE: ${process.env.STRIPE_ENTERPRISE_PRICE_ID}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

queryStripeAccount();
