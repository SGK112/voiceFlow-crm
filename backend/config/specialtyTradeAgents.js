/**
 * Specialty Trade Agent Templates
 * Industry-specific agents for different contractor niches
 */

export const SPECIALTY_TRADE_AGENTS = {
  // HVAC Contractors
  'hvac-emergency': {
    id: 'hvac-emergency',
    name: 'HVAC Emergency Dispatch Agent',
    description: '24/7 emergency HVAC dispatcher for heating/cooling failures',
    category: 'specialty-hvac',
    icon: '❄️',
    tier: 'professional',
    tags: ['HVAC', 'Emergency', '24/7', 'Dispatch'],

    pricing: {
      basePrice: 149,
      billingCycle: 'monthly',
      perCallPrice: 0.15
    },

    features: [
      '24/7 emergency call handling',
      'Prioritizes by urgency (no heat/AC)',
      'Dispatches on-call technicians',
      'Quotes emergency vs standard rates',
      'Collects equipment details',
      'Books next-day service calls'
    ],

    setupQuestions: [
      {
        id: 'companyName',
        type: 'text',
        label: 'Company Name',
        required: true
      },
      {
        id: 'serviceTypes',
        type: 'multiselect',
        label: 'HVAC Services You Offer',
        required: true,
        options: [
          { value: 'ac-repair', label: 'A/C Repair' },
          { value: 'heating-repair', label: 'Heating Repair' },
          { value: 'installation', label: 'System Installation' },
          { value: 'maintenance', label: 'Maintenance' },
          { value: 'duct-work', label: 'Duct Work' },
          { value: 'air-quality', label: 'Air Quality' }
        ]
      },
      {
        id: 'emergencyRate',
        type: 'number',
        label: 'Emergency Service Call Fee',
        placeholder: '149',
        required: true
      },
      {
        id: 'standardRate',
        type: 'number',
        label: 'Standard Service Call Fee',
        placeholder: '89',
        required: true
      },
      {
        id: 'serviceArea',
        type: 'text',
        label: 'Service Area',
        required: true
      }
    ],

    promptTemplate: (answers) => `You are the emergency dispatcher for ${answers.companyName}, an HVAC company.

PRIORITY SYSTEM:
CRITICAL (dispatch immediately):
- No heat when below 40°F outside
- No AC when above 90°F outside
- Gas smell or CO detector going off
- Water leaking from unit

HIGH (same day or next morning):
- AC not cooling well (but working)
- Furnace cycling on/off
- Strange noises or smells
- Thermostat issues

STANDARD (schedule within 2-3 days):
- Maintenance
- Installation quotes
- Non-urgent repairs

EMERGENCY FEE: $${answers.emergencyRate} (after hours, weekends, same-day)
STANDARD FEE: $${answers.standardRate} (scheduled appointments)

When someone calls, determine urgency and either dispatch now or schedule.`
  },

  // Plumbing
  'plumbing-emergency': {
    id: 'plumbing-emergency',
    name: 'Plumbing Emergency Agent',
    description: 'Handles emergency plumbing calls, pipes bursts, leaks, and clogs',
    category: 'specialty-plumbing',
    icon: '🚰',
    tier: 'professional',
    tags: ['Plumbing', 'Emergency', 'Water Damage', 'Dispatch'],

    pricing: {
      basePrice: 149,
      billingCycle: 'monthly',
      perCallPrice: 0.15
    },

    features: [
      'Emergency leak detection',
      'Walks customers through shutoff valves',
      'Dispatches plumbers 24/7',
      'Prevents water damage',
      'Handles sewer backups',
      'Quotes emergency rates'
    ]
  },

  // Electrical
  'electrical-service': {
    id: 'electrical-service',
    name: 'Electrical Service Agent',
    description: 'Electrical service booking and emergency power outage response',
    category: 'specialty-electrical',
    icon: '⚡',
    tier: 'professional',
    tags: ['Electrical', 'Emergency', 'Safety', 'Power'],

    pricing: {
      basePrice: 149,
      billingCycle: 'monthly',
      perCallPrice: 0.15
    },

    features: [
      'Emergency electrical dispatch',
      'Safety assessment questions',
      'Circuit breaker troubleshooting',
      'Panel upgrade quotes',
      'Generator service scheduling',
      'EV charger installations'
    ]
  },

  // Roofing
  'roofing-storm': {
    id: 'roofing-storm',
    name: 'Storm Damage Roofing Agent',
    description: 'Handles storm damage calls, insurance claims, roof inspections',
    category: 'specialty-roofing',
    icon: '🏠',
    tier: 'professional',
    tags: ['Roofing', 'Storm Damage', 'Insurance', 'Emergency'],

    pricing: {
      basePrice: 129,
      billingCycle: 'monthly',
      perCallPrice: 0.12
    },

    features: [
      'Emergency leak response',
      'Free storm damage inspections',
      'Insurance claim assistance',
      'Tarping service dispatch',
      'Drone inspection scheduling',
      'Material upgrade quotes'
    ]
  },

  // Landscaping
  'landscaping-design': {
    id: 'landscaping-design',
    name: 'Landscaping Design Consultant Agent',
    description: 'Qualifying leads for landscape design and outdoor living projects',
    category: 'specialty-landscaping',
    icon: '🌳',
    tier: 'starter',
    tags: ['Landscaping', 'Design', 'Outdoor Living', 'Consultation'],

    pricing: {
      basePrice: 79,
      billingCycle: 'monthly',
      perCallPrice: 0.10
    },

    features: [
      'Design consultation booking',
      'Asks about style preferences',
      'Discusses budget ranges',
      'Schedules property walkthrough',
      'Qualifies for hardscaping',
      'Irrigation system quotes'
    ]
  },

  // Pool Service
  'pool-service': {
    id: 'pool-service',
    name: 'Pool Service & Repair Agent',
    description: 'Weekly pool service scheduling and green pool rescue',
    category: 'specialty-pool',
    icon: '🏊',
    tier: 'starter',
    tags: ['Pool Service', 'Maintenance', 'Repair', 'Scheduling'],

    pricing: {
      basePrice: 69,
      billingCycle: 'monthly',
      perCallPrice: 0.08
    },

    features: [
      'Weekly service scheduling',
      'Green pool assessment',
      'Equipment repair quotes',
      'Chemical delivery booking',
      'Pool remodel consultations',
      'Route optimization'
    ]
  },

  // Painting
  'painting-estimator': {
    id: 'painting-estimator',
    name: 'Painting Estimator Agent',
    description: 'Collects details for painting quotes (interior/exterior)',
    category: 'specialty-painting',
    icon: '🎨',
    tier: 'starter',
    tags: ['Painting', 'Estimating', 'Interior', 'Exterior'],

    pricing: {
      basePrice: 59,
      billingCycle: 'monthly',
      perCallPrice: 0.08
    },

    features: [
      'Asks sqft and room count',
      'Interior vs exterior',
      'Number of colors',
      'Ceiling heights',
      'Surface condition',
      'Instant rough estimate'
    ]
  },

  // Carpet Cleaning
  'carpet-cleaning': {
    id: 'carpet-cleaning',
    name: 'Carpet Cleaning Booking Agent',
    description: 'Books carpet, upholstery, and tile cleaning appointments',
    category: 'specialty-cleaning',
    icon: '🧹',
    tier: 'starter',
    tags: ['Cleaning', 'Carpet', 'Upholstery', 'Scheduling'],

    pricing: {
      basePrice: 49,
      billingCycle: 'monthly',
      perCallPrice: 0.07
    },

    features: [
      'Same-day availability check',
      'Sqft-based pricing',
      'Pet stain treatment quotes',
      'Tile & grout add-ons',
      'Commercial vs residential',
      'Recurring service scheduling'
    ]
  },

  // Pest Control
  'pest-control': {
    id: 'pest-control',
    name: 'Pest Control Scheduling Agent',
    description: 'Books pest control service, identifies pest types, quotes treatments',
    category: 'specialty-pest',
    icon: '🐜',
    tier: 'starter',
    tags: ['Pest Control', 'Exterminator', 'Termite', 'Rodent'],

    pricing: {
      basePrice: 69,
      billingCycle: 'monthly',
      perCallPrice: 0.08
    },

    features: [
      'Pest identification questions',
      'Emergency bed bug response',
      'Termite inspection booking',
      'Quarterly service plans',
      'Rodent exclusion quotes',
      'Commercial contracts'
    ]
  },

  // Concrete/Hardscaping
  'concrete-flatwork': {
    id: 'concrete-flatwork',
    name: 'Concrete & Flatwork Agent',
    description: 'Driveways, patios, stamped concrete, and decorative flatwork',
    category: 'specialty-concrete',
    icon: '🏗️',
    tier: 'professional',
    tags: ['Concrete', 'Flatwork', 'Driveways', 'Patios'],

    pricing: {
      basePrice: 89,
      billingCycle: 'monthly',
      perCallPrice: 0.10
    },

    features: [
      'Measures sqft needed',
      'Stamped vs standard',
      'Color & finish options',
      'Removal & disposal',
      'Rebar & thickness specs',
      'Lead time expectations'
    ]
  },

  // Handyman
  'handyman-dispatch': {
    id: 'handyman-dispatch',
    name: 'Handyman Dispatch Agent',
    description: 'Multi-service handyman booking for repairs and small projects',
    category: 'specialty-handyman',
    icon: '🔧',
    tier: 'starter',
    tags: ['Handyman', 'Repairs', 'Multi-Service', 'Small Jobs'],

    pricing: {
      basePrice: 59,
      billingCycle: 'monthly',
      perCallPrice: 0.08
    },

    features: [
      'Handles honey-do lists',
      'Estimates job duration',
      'Quotes hourly vs flat rate',
      'Schedules multi-task visits',
      'Senior discount application',
      'Parts pickup coordination'
    ]
  }
};

// RAG (Retrieval-Augmented Generation) Agents
export const RAG_AGENTS = {
  'knowledge-base-support': {
    id: 'knowledge-base-support',
    name: 'Knowledge Base Support Agent',
    description: 'AI agent with access to your company docs, manuals, and SOPs',
    category: 'rag-support',
    icon: '📚',
    tier: 'enterprise',
    tags: ['RAG', 'Knowledge Base', 'Support', 'Documentation'],

    pricing: {
      basePrice: 199,
      billingCycle: 'monthly',
      perCallPrice: 0.10,
      setupFee: 499 // One-time KB setup
    },

    features: [
      'Upload your docs (PDF, Word, etc.)',
      'Answers from your knowledge base',
      'Product manuals & spec sheets',
      'Warranty & return policies',
      'Technical troubleshooting',
      'Always up-to-date with your docs'
    ],

    ragConfig: {
      documentTypes: ['pdf', 'docx', 'txt', 'md', 'html'],
      maxDocuments: 500,
      vectorStore: 'pinecone',
      embeddingModel: 'text-embedding-3-large',
      chunkSize: 1000,
      chunkOverlap: 200
    }
  },

  'product-catalog-expert': {
    id: 'product-catalog-expert',
    name: 'Product Catalog Expert Agent',
    description: 'Answers questions about your entire product catalog',
    category: 'rag-sales',
    icon: '🛍️',
    tier: 'enterprise',
    tags: ['RAG', 'Product Catalog', 'Sales', 'Inventory'],

    pricing: {
      basePrice: 249,
      billingCycle: 'monthly',
      perCallPrice: 0.12,
      setupFee: 799
    },

    features: [
      'Knows all product specs',
      'Real-time pricing & availability',
      'Compatible products & bundles',
      'Installation requirements',
      'Warranty details',
      'Alternative recommendations'
    ],

    ragConfig: {
      dataSource: 'api', // Can sync with inventory API
      updateFrequency: 'realtime',
      includesPricing: true,
      includesAvailability: true
    }
  },

  'policy-compliance-agent': {
    id: 'policy-compliance-agent',
    name: 'Policy & Compliance Agent',
    description: 'Ensures all customer interactions follow company policies',
    category: 'rag-compliance',
    icon: '⚖️',
    tier: 'enterprise',
    tags: ['RAG', 'Compliance', 'Policy', 'Legal'],

    pricing: {
      basePrice: 299,
      billingCycle: 'monthly',
      perCallPrice: 0.15,
      setupFee: 999
    },

    features: [
      'Follows company policies',
      'Compliant with regulations',
      'Proper disclosures',
      'Warranty enforcement',
      'Legal guardrails',
      'Audit trail logging'
    ]
  }
};

// Customer Service Agents
export const CUSTOMER_SERVICE_AGENTS = {
  'customer-support-247': {
    id: 'customer-support-247',
    name: '24/7 Customer Support Agent',
    description: 'Always-on customer service for questions, complaints, and requests',
    category: 'customer-service',
    icon: '💬',
    tier: 'professional',
    tags: ['Support', '24/7', 'Customer Service', 'Help Desk'],

    pricing: {
      basePrice: 149,
      billingCycle: 'monthly',
      perCallPrice: 0.08
    },

    features: [
      'Answers common questions',
      'Handles complaints professionally',
      'Escalates to human when needed',
      'Checks order status',
      'Processes simple requests',
      'Creates support tickets'
    ]
  },

  'order-status-tracker': {
    id: 'order-status-tracker',
    name: 'Order Status & Tracking Agent',
    description: 'Provides real-time order updates and delivery tracking',
    category: 'customer-service',
    icon: '📦',
    tier: 'professional',
    tags: ['Orders', 'Tracking', 'Delivery', 'Status'],

    pricing: {
      basePrice: 99,
      billingCycle: 'monthly',
      perCallPrice: 0.06
    },

    features: [
      'Real-time order lookup',
      'Delivery date estimates',
      'Tracking number provision',
      'Address change requests',
      'Proactive delay notifications',
      'Integrates with shipping APIs'
    ]
  },

  'returns-exchanges': {
    id: 'returns-exchanges',
    name: 'Returns & Exchanges Agent',
    description: 'Processes returns, exchanges, and refunds per your policies',
    category: 'customer-service',
    icon: '↩️',
    tier: 'professional',
    tags: ['Returns', 'Refunds', 'Exchanges', 'RMA'],

    pricing: {
      basePrice: 129,
      billingCycle: 'monthly',
      perCallPrice: 0.08
    },

    features: [
      'Explains return policy',
      'Generates return labels',
      'Processes exchanges',
      'Issues refunds',
      'Tracks return status',
      'Prevents return fraud'
    ]
  },

  'billing-invoice-agent': {
    id: 'billing-invoice-agent',
    name: 'Billing & Invoice Agent',
    description: 'Answers billing questions, sends invoices, processes payments',
    category: 'customer-service',
    icon: '💳',
    tier: 'professional',
    tags: ['Billing', 'Invoices', 'Payments', 'AR'],

    pricing: {
      basePrice: 149,
      billingCycle: 'monthly',
      perCallPrice: 0.08
    },

    features: [
      'Sends invoices via email/SMS',
      'Explains charges',
      'Updates payment methods',
      'Sets up payment plans',
      'Processes one-time payments',
      'Generates receipts'
    ]
  },

  'warranty-claims': {
    id: 'warranty-claims',
    name: 'Warranty Claims Agent',
    description: 'Handles warranty claims, replacements, and service requests',
    category: 'customer-service',
    icon: '🛡️',
    tier: 'professional',
    tags: ['Warranty', 'Claims', 'Service', 'Protection'],

    pricing: {
      basePrice: 129,
      billingCycle: 'monthly',
      perCallPrice: 0.09
    },

    features: [
      'Verifies warranty coverage',
      'Walks through troubleshooting',
      'Schedules service calls',
      'Orders replacement parts',
      'Escalates complex claims',
      'Tracks claim status'
    ]
  },

  'appointment-reminder': {
    id: 'appointment-reminder',
    name: 'Appointment Reminder Agent',
    description: 'Confirms, reschedules, and reminds customers about appointments',
    category: 'customer-service',
    icon: '📅',
    tier: 'starter',
    tags: ['Appointments', 'Reminders', 'Scheduling', 'Confirmations'],

    pricing: {
      basePrice: 79,
      billingCycle: 'monthly',
      perCallPrice: 0.05
    },

    features: [
      '24hr confirmation calls',
      'Easy rescheduling',
      'Timezone handling',
      'No-show reduction',
      'Calendar sync',
      'SMS + call reminders'
    ]
  }
};

export default {
  SPECIALTY_TRADE_AGENTS,
  RAG_AGENTS,
  CUSTOMER_SERVICE_AGENTS
};
