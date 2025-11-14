const mongoose = require('mongoose');
const { Extension } = require('../models/Extension');
require('dotenv').config();

const quickbooksExtension = {
  name: 'QuickBooks Online',
  slug: 'quickbooks-online',
  displayName: 'QuickBooks Online',
  description: 'Sync invoices, estimates, and customers with QuickBooks Online',
  longDescription: `
    Seamlessly integrate your Voiceflow CRM with QuickBooks Online to automatically sync:
    - Customers and contacts
    - Invoices and estimates
    - Payments and transactions
    - Financial reports

    Save time by eliminating duplicate data entry and keeping your books up-to-date automatically.
  `,
  category: 'accounting',
  icon: 'https://plugin.intuit.com/designsystem/assets/images/logos/quickbooks/quickbooks-icon-green.svg',
  logo: 'https://plugin.intuit.com/designsystem/assets/images/logos/quickbooks/quickbooks-horizontal.svg',
  screenshots: [
    'https://via.placeholder.com/800x600?text=QuickBooks+Integration',
    'https://via.placeholder.com/800x600?text=Invoice+Sync',
    'https://via.placeholder.com/800x600?text=Customer+Sync'
  ],

  pricing: {
    type: 'freemium',
    price: 29,
    trialDays: 14,
    features: {
      free: [
        'Manual sync',
        'Basic customer sync',
        'Invoice push to QuickBooks',
        'Up to 100 syncs/month'
      ],
      paid: [
        'Automatic sync (hourly)',
        'Real-time webhooks',
        'Bidirectional sync',
        'Unlimited syncs',
        'Payment tracking',
        'Estimate sync',
        'Priority support'
      ]
    }
  },

  developer: {
    name: 'Voiceflow Team',
    email: 'support@voiceflow.com',
    website: 'https://voiceflow.com',
    support: 'https://voiceflow.com/support'
  },

  integration: {
    type: 'oauth',
    oauthConfig: {
      authUrl: 'https://appcenter.intuit.com/connect/oauth2',
      tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      scopes: [
        'com.intuit.quickbooks.accounting',
        'openid',
        'profile',
        'email'
      ],
      // Note: clientId and clientSecret are stored in environment variables
    },
    requiredFields: []
  },

  features: [
    'Automatic invoice sync',
    'Bidirectional customer sync',
    'Real-time payment updates',
    'Estimate management',
    'Tax calculation sync',
    'Multi-currency support',
    'Custom field mapping',
    'Conflict resolution'
  ],

  capabilities: {
    sync: true,
    webhook: true,
    realtime: true,
    bidirectional: true
  },

  syncConfig: {
    enabled: true,
    frequency: 'realtime',
    entities: ['invoices', 'estimates', 'contacts', 'payments'],
    direction: 'bidirectional'
  },

  status: 'active',
  isPublished: true,
  isFeatured: true,

  stats: {
    installs: 0,
    activeInstalls: 0,
    rating: 4.8,
    reviewCount: 127
  },

  version: '1.0.0',
  changelog: [
    {
      version: '1.0.0',
      date: new Date('2025-01-15'),
      changes: [
        'Initial release',
        'Invoice sync',
        'Customer sync',
        'Payment tracking',
        'Webhook support'
      ]
    }
  ],

  documentation: {
    setupGuide: `
      # QuickBooks Online Setup Guide

      ## Step 1: Connect Your Account
      1. Click "Install" button
      2. Sign in to your QuickBooks Online account
      3. Authorize Voiceflow CRM to access your data
      4. You'll be redirected back to CRM

      ## Step 2: Configure Sync Settings
      1. Choose sync frequency (manual, hourly, or real-time)
      2. Select which data to sync
      3. Set up field mappings if needed

      ## Step 3: Initial Sync
      1. Click "Sync Now" to perform initial sync
      2. Review synced data
      3. Resolve any conflicts

      ## Troubleshooting
      - If sync fails, check your QB subscription status
      - Ensure you have admin access to QuickBooks
      - Check sync logs for detailed error messages
    `,
    apiDocs: 'https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/invoice',
    faq: [
      {
        question: 'How often does data sync?',
        answer: 'Free plan: Manual sync only. Paid plan: Real-time with webhooks or hourly automatic sync.'
      },
      {
        question: 'Is the sync bidirectional?',
        answer: 'Yes! Changes in either QuickBooks or CRM will sync to the other system.'
      },
      {
        question: 'What happens if there\'s a conflict?',
        answer: 'The most recent change wins. You\'ll be notified of conflicts for manual resolution.'
      },
      {
        question: 'Can I sync existing data?',
        answer: 'Yes! The initial sync will import all your existing QuickBooks data.'
      },
      {
        question: 'Do I need a QuickBooks Online subscription?',
        answer: 'Yes, you need an active QuickBooks Online subscription (any plan).'
      }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=example'
  },

  tags: [
    'accounting',
    'invoicing',
    'quickbooks',
    'intuit',
    'sync',
    'automation',
    'bookkeeping',
    'financial'
  ]
};

async function seedQuickBooks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if already exists
    const existing = await Extension.findOne({ slug: 'quickbooks-online' });

    if (existing) {
      console.log('QuickBooks extension already exists. Updating...');
      await Extension.findOneAndUpdate(
        { slug: 'quickbooks-online' },
        quickbooksExtension,
        { new: true }
      );
      console.log('✅ QuickBooks extension updated!');
    } else {
      const extension = new Extension(quickbooksExtension);
      await extension.save();
      console.log('✅ QuickBooks extension created!');
    }

    console.log('\nExtension Details:');
    console.log('- Slug: quickbooks-online');
    console.log('- Category: accounting');
    console.log('- Pricing: $29/month (14-day trial)');
    console.log('- Status: Active & Featured');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding QuickBooks extension:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedQuickBooks();
}

module.exports = seedQuickBooks;
