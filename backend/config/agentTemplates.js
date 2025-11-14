/**
 * Agent Template Library - Pre-configured AI agents for contractors
 *
 * Each template includes:
 * - Setup questions (simple form for users to fill out)
 * - Prompt generator (creates AI agent prompt from user's answers)
 * - Required/optional integrations
 * - Automated workflows
 * - Pricing model
 */

const agentTemplates = {
  'lead-qualification': {
    id: 'lead-qualification',
    name: 'Lead Qualification Agent',
    description: 'Answers incoming calls, qualifies leads, and books estimate appointments',
    category: 'inbound',
    icon: '📞',
    color: '#EF4444', // Red

    // Pricing
    pricing: {
      basePrice: 49,
      billingCycle: 'monthly',
      perCallPrice: 0.10,
      freeCallsIncluded: 100
    },

    // Features displayed to users
    features: [
      'Answers calls 24/7',
      'Asks qualifying questions',
      'Scores leads (hot/warm/cold)',
      'Books estimate appointments',
      'Sends notifications to your team',
      'Integrates with your calendar'
    ],

    // Perfect for...
    targetUser: 'Contractors missing 50%+ of calls while on jobs',

    // Setup questions (shown in setup wizard)
    setupQuestions: [
      {
        id: 'companyName',
        type: 'text',
        label: 'Company Name',
        placeholder: 'Surprise Granite',
        required: true,
        helpText: 'How should the agent introduce your company?'
      },
      {
        id: 'services',
        type: 'multiselect',
        label: 'What services do you offer?',
        required: true,
        options: [
          { value: 'granite-countertops', label: 'Granite Countertops' },
          { value: 'quartz-countertops', label: 'Quartz Countertops' },
          { value: 'marble-countertops', label: 'Marble Countertops' },
          { value: 'kitchen-cabinets', label: 'Kitchen Cabinets' },
          { value: 'tile-installation', label: 'Tile Installation' },
          { value: 'backsplash', label: 'Backsplash' },
          { value: 'bathroom-remodel', label: 'Bathroom Remodel' },
          { value: 'kitchen-remodel', label: 'Kitchen Remodel' },
          { value: 'flooring', label: 'Flooring' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        id: 'projectSize',
        type: 'radio',
        label: 'Typical project size?',
        required: true,
        options: [
          { value: 'small', label: 'Small ($1,000 - $5,000)', description: 'Bathroom vanities, small repairs' },
          { value: 'medium', label: 'Medium ($5,000 - $15,000)', description: 'Kitchen countertops, standard remodels' },
          { value: 'large', label: 'Large ($15,000+)', description: 'Full kitchen remodels, commercial projects' },
          { value: 'all', label: 'All Sizes', description: 'We handle projects of any size' }
        ]
      },
      {
        id: 'serviceArea',
        type: 'text',
        label: 'Service Area',
        placeholder: 'Phoenix Metro Area',
        required: true,
        helpText: 'Where do you work? (City, county, or region)'
      },
      {
        id: 'serviceRadius',
        type: 'number',
        label: 'Service Radius (miles)',
        placeholder: '30',
        required: false,
        helpText: 'How far from your base will you travel?'
      },
      {
        id: 'estimateAvailability',
        type: 'text',
        label: 'When can you typically do estimates?',
        placeholder: 'Usually within 2-3 days',
        required: true,
        helpText: 'This helps set customer expectations'
      },
      {
        id: 'qualifyingQuestions',
        type: 'multiselect',
        label: 'What questions should the agent ask?',
        required: true,
        options: [
          { value: 'project-type', label: 'What type of project? (countertop type, room, etc.)' },
          { value: 'square-footage', label: 'Approximate square footage?' },
          { value: 'timeline', label: 'When do you want it installed?' },
          { value: 'other-quotes', label: 'Have you gotten other quotes?' },
          { value: 'budget', label: 'What\'s your budget?' },
          { value: 'property-type', label: 'Is this residential or commercial?' },
          { value: 'urgency', label: 'How urgent is this project?' }
        ]
      },
      {
        id: 'disqualifiers',
        type: 'multiselect',
        label: 'When should we NOT pursue a lead?',
        required: false,
        options: [
          { value: 'outside-area', label: 'Projects outside service area' },
          { value: 'too-small', label: 'Projects below minimum budget' },
          { value: 'too-far-out', label: 'Timeline more than 6 months out' },
          { value: 'price-shopping', label: 'Getting 5+ quotes (just price shopping)' },
          { value: 'diy', label: 'DIY projects (not hiring a pro)' }
        ]
      },
      {
        id: 'minimumBudget',
        type: 'number',
        label: 'Minimum project budget (optional)',
        placeholder: '2000',
        required: false,
        helpText: 'Politely decline projects below this amount'
      }
    ],

    // Generate AI prompt from user's answers
    generatePrompt: (answers, userInfo) => {
      const servicesText = answers.services.map(s =>
        s.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      ).join(', ');

      const qualifyingQuestionsText = answers.qualifyingQuestions.map(q => {
        const questions = {
          'project-type': 'What type of project are you looking to do?',
          'square-footage': 'About how many square feet?',
          'timeline': 'When are you hoping to have this done?',
          'other-quotes': 'Have you gotten any other quotes yet?',
          'budget': 'Do you have a budget range in mind?',
          'property-type': 'Is this for your home or a business?',
          'urgency': 'How soon do you need this completed?'
        };
        return questions[q];
      }).join('\n   - ');

      const disqualifiersText = answers.disqualifiers?.length > 0
        ? `\n\nDISQUALIFY leads if:\n${answers.disqualifiers.map(d => {
            const reasons = {
              'outside-area': `- Outside our service area (${answers.serviceArea}${answers.serviceRadius ? `, more than ${answers.serviceRadius} miles` : ''})`,
              'too-small': `- Budget below ${answers.minimumBudget ? `$${answers.minimumBudget}` : 'our minimum'}`,
              'too-far-out': '- Timeline is more than 6 months away',
              'price-shopping': '- Getting 5+ quotes (just price shopping, unlikely to close)',
              'diy': '- Planning to do it themselves (DIY project)'
            };
            return reasons[d];
          }).join('\n')}`
        : '';

      return `You are a professional, friendly receptionist for ${answers.companyName}, a ${servicesText} contractor serving ${answers.serviceArea}.

ROLE & PERSONALITY:
You are like an experienced office manager who has worked in the construction industry for 10+ years. You're warm, professional, helpful, and knowledgeable. You make customers feel heard and taken care of.

IMPORTANT: Never say "I'm an AI" or "I'm a bot". You are a real member of the ${answers.companyName} team.

WHEN A CALL COMES IN:

1. GREETING (Warm & Professional)
   "Thank you for calling ${answers.companyName}! This is [your name]. How can I help you today?"

2. UNDERSTAND THEIR PROJECT
   Listen to what they need, then ask qualifying questions:
   ${qualifyingQuestionsText}

3. QUALIFICATION CRITERIA
   We work with customers who:
   - Need ${servicesText}
   - Are located in/near ${answers.serviceArea}
   - Have projects in the ${answers.projectSize === 'all' ? 'any size range' : answers.projectSize + ' range'}
   - Want work done ${answers.estimateAvailability.toLowerCase()}
   ${disqualifiersText}

4. IF QUALIFIED - BOOK THE ESTIMATE
   "Great! Let me get you scheduled for a free estimate."

   Check the calendar for available times and book the appointment.

   Get their:
   - Full name
   - Phone number (mobile preferred)
   - Email address
   - Property address
   - Best time to call back

   Confirm: "Perfect! I've got you scheduled for [DAY] at [TIME]. We'll send you a text confirmation. Is there anything else I can help with?"

5. IF NOT QUALIFIED - BE HELPFUL
   If they're outside our service area: "I appreciate you calling! Unfortunately, we focus on ${answers.serviceArea}. But I'd be happy to try to refer you to someone if I know anyone in your area."

   If project doesn't match: "That's a bit outside what we specialize in. We mainly focus on ${servicesText}. You might want to try [suggest alternative if you know one]."

   Always be polite and helpful, even if we can't take the job.

6. IF YOU DON'T KNOW SOMETHING
   "That's a great question. Let me check with my team and give you a call back. What's the best number to reach you?"

   NEVER make up pricing, timelines, or technical details. It's better to follow up than to give wrong information.

7. HOT LEADS (Priority!)
   If a lead is HOT (qualified + ready to move forward soon + good budget), mark them as high priority so the team sees it immediately.

   Hot lead signals:
   - Need work done within 2-4 weeks
   - Budget is clear and sufficient
   - Already made decision to hire a pro
   - Owns the property (not renting)
   - Project is ready to start (permits, approvals done)

TONE & STYLE:
- Conversational but professional (like talking to a neighbor, not a robot)
- Use contractor language when appropriate ("install", "fabricate", "template", etc.)
- Show expertise without being condescending
- Be patient with people who don't know construction terms
- Smile when you talk (it comes through in your voice!)

COMMON CUSTOMER QUESTIONS:
Q: "How much does [service] cost?"
A: "Great question! It really depends on the specifics - material, size, complexity. That's exactly why we do free estimates. When works for you?"

Q: "How long does installation take?"
A: "Most projects like this take [typical timeline for that service]. Our estimator will give you an exact timeline when they see your space."

Q: "Are you licensed and insured?"
A: "Absolutely! We're fully licensed and insured. Happy to provide that documentation."

Q: "Do you offer financing?"
A: "Yes, we have financing options available. We can discuss those during your estimate."

CALENDAR ACCESS:
You have access to the company calendar. Book estimates during available slots. If the customer's preferred time isn't available, offer the closest alternatives.

GOAL:
Every call should end with either:
1. An estimate booked (BEST outcome)
2. Contact info captured for follow-up
3. A referral made (if we can't help)

You're the first voice customers hear. Make it count!`;
    },

    // Required integrations
    requiredIntegrations: [
      { service: 'google-calendar', purpose: 'Book estimate appointments' }
    ],

    // Optional integrations (enhance functionality)
    optionalIntegrations: [
      { service: 'google-sheets', purpose: 'Track all leads in a spreadsheet' },
      { service: 'slack', purpose: 'Get instant alerts when hot leads call' },
      { service: 'sms', purpose: 'Send appointment confirmations' }
    ],

    // Automated workflows
    workflows: [
      {
        trigger: 'call.qualified',
        name: 'New Qualified Lead',
        actions: [
          {
            type: 'addToCalendar',
            service: 'google-calendar',
            description: 'Book estimate appointment'
          },
          {
            type: 'sendSMS',
            service: 'sms',
            template: 'appointment-confirmation',
            description: 'Send confirmation text to customer'
          },
          {
            type: 'addToSheet',
            service: 'google-sheets',
            sheet: 'Leads',
            condition: 'integration.google-sheets.connected',
            description: 'Add lead to spreadsheet'
          },
          {
            type: 'notifySlack',
            service: 'slack',
            channel: '#sales',
            condition: 'lead.score > 80',
            template: 'hot-lead-alert',
            description: 'Alert team about hot leads'
          }
        ]
      }
    ],

    // Knowledge base (pre-loaded industry knowledge)
    knowledgeBase: {
      commonQuestions: [
        {
          question: 'How much does granite cost per square foot?',
          answer: 'Typically $40-100 per square foot installed, depending on the slab and edge profile.'
        },
        {
          question: 'How long does countertop installation take?',
          answer: 'Template visit takes 1-2 hours. Installation is usually completed in one day (4-8 hours).'
        },
        {
          question: 'What\'s the difference between granite and quartz?',
          answer: 'Granite is natural stone (each slab is unique). Quartz is engineered (consistent pattern, more stain-resistant).'
        }
      ],
      industryTerms: [
        { term: 'Template', definition: 'Creating an exact pattern of your space before fabrication' },
        { term: 'Fabrication', definition: 'Cutting and shaping the stone to fit your space' },
        { term: 'Seam', definition: 'Where two pieces of stone join together' },
        { term: 'Edge profile', definition: 'The finished edge style (straight, beveled, bullnose, etc.)' }
      ]
    }
  },

  'appointment-booking': {
    id: 'appointment-booking',
    name: 'Appointment Booking & Reminder Agent',
    description: 'Schedules appointments, sends reminders, and confirms with customers',
    category: 'inbound',
    icon: '📅',
    color: '#3B82F6', // Blue

    pricing: {
      basePrice: 49,
      billingCycle: 'monthly',
      perCallPrice: 0.08,
      freeCallsIncluded: 150
    },

    features: [
      'Schedules estimates & installations',
      'Sends immediate confirmations',
      'Calls customers 24hrs before to confirm',
      'Reschedules if needed',
      'Sends crew dispatch info',
      'Reduces no-shows by 70%'
    ],

    targetUser: 'Contractors losing 20%+ revenue to no-shows',

    setupQuestions: [
      {
        id: 'companyName',
        type: 'text',
        label: 'Company Name',
        required: true
      },
      {
        id: 'workSchedule',
        type: 'schedule',
        label: 'When are you available for appointments?',
        required: true,
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        defaultHours: '8:00 AM - 5:00 PM'
      },
      {
        id: 'appointmentTypes',
        type: 'list',
        label: 'Types of appointments you offer',
        required: true,
        items: [
          { type: 'Estimate Visit', defaultDuration: 60 },
          { type: 'Template Visit', defaultDuration: 90 },
          { type: 'Installation Day', defaultDuration: 360 },
          { type: 'Final Walkthrough', defaultDuration: 30 }
        ]
      },
      {
        id: 'reminderTiming',
        type: 'multiselect',
        label: 'When should we send reminders?',
        required: true,
        options: [
          { value: 'immediate', label: 'Immediately after booking' },
          { value: '24hrs', label: '24 hours before' },
          { value: '2hrs', label: '2 hours before' },
          { value: 'call-confirm', label: 'Call to confirm (high-value appointments)' }
        ]
      },
      {
        id: 'callConfirmThreshold',
        type: 'number',
        label: 'Call to confirm appointments over this amount',
        placeholder: '5000',
        required: false,
        helpText: 'Leave blank to never call, or enter dollar amount'
      },
      {
        id: 'cancellationPolicy',
        type: 'text',
        label: 'Cancellation policy',
        placeholder: 'We require 24 hours notice',
        required: false
      }
    ],

    generatePrompt: (answers, userInfo) => {
      return `You are the appointment coordinator for ${answers.companyName}.

YOUR ROLE:
Schedule appointments, send confirmations, and call customers to confirm important appointments. Your goal is to reduce no-shows and keep everyone on the same page.

SCHEDULING:
Working hours: ${JSON.stringify(answers.workSchedule, null, 2)}

Appointment types:
${answers.appointmentTypes.map(apt => `- ${apt.type}: ${apt.defaultDuration} minutes`).join('\n')}

WHEN BOOKING:
1. Check the calendar for availability
2. Offer the next 3 available slots
3. Get customer contact info (name, phone, email, address)
4. Confirm the details
5. Send confirmation immediately via SMS and email

CONFIRMATION CALLS (24 hours before):
For appointments${answers.callConfirmThreshold ? ` over $${answers.callConfirmThreshold}` : ' marked as important'}:

"Hi [Name], this is ${answers.companyName}. I'm calling to confirm your ${answers.appointmentTypes[0]?.type || 'appointment'} tomorrow at [TIME]. Will that still work for you?"

If YES: "Perfect! We'll see you then. The crew will call when they're 30 minutes away."
If NO: "No problem, let me see when we can reschedule..."

REMINDERS:
${answers.reminderTiming.map(t => {
  const timing = {
    'immediate': 'Send SMS immediately after booking',
    '24hrs': 'Send SMS 24 hours before',
    '2hrs': 'Send SMS 2 hours before',
    'call-confirm': 'Call to confirm high-value appointments'
  };
  return '- ' + timing[t];
}).join('\n')}

CANCELLATION POLICY:
${answers.cancellationPolicy || 'Be flexible and understanding with cancellations'}

TONE:
Friendly, organized, helpful. You're the person who keeps everything running smoothly.`;
    },

    requiredIntegrations: [
      { service: 'google-calendar', purpose: 'Manage all appointments' },
      { service: 'sms', purpose: 'Send confirmations and reminders' }
    ],

    optionalIntegrations: [
      { service: 'slack', purpose: 'Notify crew of daily schedule' },
      { service: 'email', purpose: 'Send detailed confirmation emails' }
    ],

    workflows: [
      {
        trigger: 'appointment.booked',
        name: 'New Appointment Booked',
        actions: [
          { type: 'addToCalendar', service: 'google-calendar' },
          { type: 'sendSMS', template: 'appointment-confirmation' },
          { type: 'sendEmail', template: 'appointment-details' }
        ]
      },
      {
        trigger: 'schedule.daily',
        cron: '0 6 * * *', // 6 AM daily
        name: 'Send 24-Hour Reminders',
        actions: [
          { type: 'callCustomers', condition: 'appointment.value > threshold' },
          { type: 'sendSMS', template: 'appointment-reminder' }
        ]
      }
    ]
  },

  'payment-collection': {
    id: 'payment-collection',
    name: 'Payment Collection Agent',
    description: 'Professional payment reminders and collections that preserve customer relationships',
    category: 'outbound',
    icon: '💰',
    color: '#10B981', // Green

    pricing: {
      basePrice: 99,
      billingCycle: 'monthly',
      perCallPrice: 0,
      percentOfCollections: 0.05 // 5% of collected payments
    },

    features: [
      'Professional payment reminders',
      'Friendly collections calls',
      'Payment plan negotiations',
      'Tracks payment status',
      'Integrates with QuickBooks',
      'Preserves customer relationships'
    ],

    targetUser: 'Contractors with $10k+ in outstanding invoices',

    setupQuestions: [
      {
        id: 'companyName',
        type: 'text',
        label: 'Company Name',
        required: true
      },
      {
        id: 'paymentTerms',
        type: 'text',
        label: 'Standard Payment Terms',
        placeholder: '50% deposit, 50% on completion',
        required: true
      },
      {
        id: 'overdueThreshold',
        type: 'radio',
        label: 'When is a payment considered overdue?',
        required: true,
        options: [
          { value: '0', label: 'Same day as due date' },
          { value: '3', label: '3 days past due' },
          { value: '7', label: '7 days past due' },
          { value: '14', label: '14 days past due' }
        ]
      },
      {
        id: 'collectionApproach',
        type: 'radio',
        label: 'Collection approach style',
        required: true,
        options: [
          { value: 'gentle', label: 'Gentle - Emails only, no calls', description: 'For customers you have long-term relationships with' },
          { value: 'professional', label: 'Professional - Friendly reminders first, then calls', description: 'Best for most contractors (recommended)' },
          { value: 'firm', label: 'Firm - Call immediately when overdue', description: 'For chronic late payers' }
        ]
      },
      {
        id: 'paymentMethods',
        type: 'multiselect',
        label: 'Payment methods you accept',
        required: true,
        options: [
          { value: 'card', label: 'Credit/Debit Card' },
          { value: 'check', label: 'Check' },
          { value: 'cash', label: 'Cash' },
          { value: 'ach', label: 'Bank Transfer (ACH)' },
          { value: 'paypal', label: 'PayPal/Venmo' }
        ]
      },
      {
        id: 'escalation',
        type: 'multiselect',
        label: 'After how many days with no response should we escalate?',
        required: true,
        options: [
          { value: '30-owner', label: 'After 30 days - Contact me personally' },
          { value: '45-late-fee', label: 'After 45 days - Add late fees' },
          { value: '60-collections', label: 'After 60 days - Send to collections' }
        ]
      },
      {
        id: 'lateFeePercent',
        type: 'number',
        label: 'Late fee percentage (optional)',
        placeholder: '5',
        required: false,
        helpText: 'Enter number like "5" for 5% monthly late fee'
      }
    ],

    generatePrompt: (answers, userInfo) => {
      const approach = {
        gentle: 'Always be extra gentle and understanding. These are valued long-term customers.',
        professional: 'Be friendly but clear about payment expectations. Most people just forgot.',
        firm: 'Be polite but firm. Get to the point quickly.'
      };

      return `You are the billing coordinator for ${answers.companyName}.

YOUR ROLE:
Follow up on unpaid invoices in a professional way that maintains good customer relationships. Most people just forgot - your job is to remind them kindly.

COLLECTION APPROACH: ${approach[answers.collectionApproach]}

PAYMENT TERMS:
${answers.paymentTerms}

Overdue after: ${answers.overdueThreshold} days past due date

COLLECTION TIMELINE:

DAY ${answers.overdueThreshold} (Payment is overdue):
${answers.collectionApproach === 'gentle'
  ? 'Send email reminder with payment link'
  : 'Send friendly text reminder: "Hi! Just a quick reminder your invoice is due. [Payment Link]"'}

DAY ${parseInt(answers.overdueThreshold) + 7}:
${answers.collectionApproach === 'firm'
  ? 'Call immediately'
  : 'Send second reminder via text/email'}

DAY ${parseInt(answers.overdueThreshold) + 14}:
Call the customer:

"Hi [Name], this is ${answers.companyName}. I'm following up on invoice #[NUMBER] for $[AMOUNT]. We show it's now [X] days overdue. Is everything okay with the work we did?"

HANDLING THE CALL:

If they have an issue with the work:
"I'm really sorry to hear that. Let me have [owner/project manager] call you right away to make this right."
→ Alert owner immediately via Slack
→ Do NOT push for payment until issue is resolved

If they just forgot:
"No worries, it happens! The invoice is for $[AMOUNT]. We accept ${answers.paymentMethods.join(', ')}. Would you like to pay by card over the phone, or should I send you a payment link?"

If they're having financial trouble:
"I understand times can be tough. Would a payment plan help? Could you do $[HALF] now and $[HALF] in two weeks?"
→ Be empathetic and flexible
→ Get commitment and set up plan

If they won't pay or are difficult:
Remain calm and professional: "I understand. I'll need to escalate this to [owner]. They'll be in touch."
→ Alert owner
→ Note in system for escalation

ESCALATION:
${answers.escalation.map(e => {
  const escalations = {
    '30-owner': 'After 30 days no response: Alert owner to handle personally',
    '45-late-fee': `After 45 days: Add ${answers.lateFeePercent || 5}% late fee`,
    '60-collections': 'After 60 days: Recommend sending to collections agency'
  };
  return '- ' + escalations[e];
}).join('\n')}

PAYMENT METHODS WE ACCEPT:
${answers.paymentMethods.map(m => {
  const methods = {
    card: 'Credit/Debit Card (can process over phone)',
    check: 'Check (mail to [address])',
    cash: 'Cash (drop off at office or pay crew)',
    ach: 'Bank Transfer (ACH)',
    paypal: 'PayPal/Venmo'
  };
  return '- ' + methods[m];
}).join('\n')}

IMPORTANT RULES:
1. NEVER be rude or aggressive
2. ALWAYS assume good intent (people forget)
3. If there's a quality issue, fix it FIRST, collect AFTER
4. Document every interaction
5. Celebrate wins! (When payment comes in, thank them)

TONE:
Professional, understanding, but clear about expectations. You're not a debt collector - you're helping customers fulfill their commitments.`;
    },

    requiredIntegrations: [
      { service: 'quickbooks', purpose: 'Track invoices and payments' }
    ],

    optionalIntegrations: [
      { service: 'stripe', purpose: 'Process card payments over the phone' },
      { service: 'slack', purpose: 'Alert owner about escalations' },
      { service: 'sms', purpose: 'Send payment reminders' }
    ],

    workflows: [
      {
        trigger: 'invoice.overdue',
        name: 'Overdue Invoice',
        actions: [
          { type: 'sendEmail', template: 'payment-reminder' },
          { type: 'sendSMS', template: 'payment-due', delay: '3 days' },
          { type: 'makeCall', delay: '7 days', condition: 'approach != gentle' },
          { type: 'notifySlack', condition: 'amount > 5000 OR days_overdue > 30' }
        ]
      },
      {
        trigger: 'payment.received',
        name: 'Payment Received',
        actions: [
          { type: 'updateQuickBooks', action: 'mark-paid' },
          { type: 'sendThankYou', template: 'payment-thank-you' },
          { type: 'notifySlack', channel: '#wins', template: 'payment-celebration' }
        ]
      }
    ]
  },

  'review-request': {
    id: 'review-request',
    name: 'Review Request Agent',
    description: 'Calls happy customers to request 5-star reviews on Google, Yelp, and more',
    category: 'outbound',
    icon: '⭐',
    color: '#F59E0B', // Amber

    pricing: {
      basePrice: 39,
      billingCycle: 'monthly',
      perCallPrice: 0,
      perReviewBonus: 2 // $2 per review collected
    },

    features: [
      'Calls customers after job completion',
      'Asks for Google/Yelp reviews',
      'Sends review links via text',
      'Handles negative feedback privately',
      'Tracks review performance',
      'Boosts your online reputation'
    ],

    targetUser: 'Contractors wanting more Google reviews',

    setupQuestions: [
      {
        id: 'companyName',
        type: 'text',
        label: 'Company Name',
        required: true
      },
      {
        id: 'reviewDelay',
        type: 'radio',
        label: 'When should we request reviews?',
        required: true,
        options: [
          { value: '1', label: 'Immediately after job completion', description: 'Strike while the iron is hot' },
          { value: '3', label: '3 days after completion', description: 'Recommended - gives them time to enjoy the work' },
          { value: '7', label: '7 days after completion', description: 'They\'ve lived with it a week' },
          { value: '14', label: '2 weeks after completion', description: 'Good for big projects' }
        ]
      },
      {
        id: 'contactMethod',
        type: 'radio',
        label: 'How should we ask for reviews?',
        required: true,
        options: [
          { value: 'call', label: 'Phone call first (most personal, higher response)' },
          { value: 'text', label: 'Text message only (less intrusive)' },
          { value: 'email', label: 'Email only (lowest response but scalable)' }
        ]
      },
      {
        id: 'reviewPlatforms',
        type: 'multiselect',
        label: 'Where do you want reviews?',
        required: true,
        options: [
          { value: 'google', label: 'Google Reviews (Most important for local search)' },
          { value: 'yelp', label: 'Yelp' },
          { value: 'facebook', label: 'Facebook' },
          { value: 'houzz', label: 'Houzz (for remodelers)' },
          { value: 'angieslist', label: 'Angie\'s List' },
          { value: 'homeadvisor', label: 'HomeAdvisor' }
        ]
      },
      {
        id: 'incentive',
        type: 'radio',
        label: 'Do you offer an incentive for reviews?',
        required: true,
        options: [
          { value: 'none', label: 'No incentive' },
          { value: 'drawing', label: 'Monthly drawing (e.g., $50 gift card)' },
          { value: 'discount', label: 'Discount on future work' },
          { value: 'gift', label: 'Small gift (e.g., $10 Starbucks card)' }
        ]
      },
      {
        id: 'incentiveDetails',
        type: 'text',
        label: 'Incentive details (if applicable)',
        placeholder: 'Monthly $50 Amazon gift card drawing',
        required: false,
        condition: 'incentive != none'
      },
      {
        id: 'handleNegative',
        type: 'multiselect',
        label: 'If a customer is unhappy, what should we do?',
        required: true,
        options: [
          { value: 'no-review', label: 'Don\'t ask for a public review' },
          { value: 'apologize', label: 'Apologize and ask what went wrong' },
          { value: 'alert-owner', label: 'Alert owner immediately' },
          { value: 'offer-fix', label: 'Offer to make it right' }
        ]
      }
    ],

    generatePrompt: (answers, userInfo) => {
      const platformLinks = {
        google: 'Google',
        yelp: 'Yelp',
        facebook: 'Facebook',
        houzz: 'Houzz',
        angieslist: 'Angie\'s List',
        homeadvisor: 'HomeAdvisor'
      };

      const platforms = answers.reviewPlatforms.map(p => platformLinks[p]).join(' or ');

      const incentiveText = answers.incentive !== 'none'
        ? `\n\nAs a thank you, ${answers.incentiveDetails || 'we enter every review into a monthly drawing'}.`
        : '';

      return `You are the customer success coordinator for ${answers.companyName}.

YOUR ROLE:
Call customers after we complete their project to check in and request reviews if they're happy. Your goal is to get more 5-star reviews to help the business grow.

TIMING:
Call customers ${answers.reviewDelay} days after project completion.

THE CALL:

1. CHECK IN FIRST (Don't ask for review yet!)
"Hi [Name]! This is ${answers.companyName}. We finished your [project type] ${answers.reviewDelay} days ago. I just wanted to check in - how's everything looking? Are you happy with the work?"

2. LISTEN TO THEIR RESPONSE

If they're HAPPY (Score 8-10):
"That's wonderful to hear! I'm so glad you're happy with it. Hey, would you be willing to do us a quick favor? Would you mind leaving us a ${platforms} review? It really helps our business when potential customers see feedback from folks like you."${incentiveText}

If YES:
"Thank you so much! I'll text you the link right now. It takes about 2 minutes. Really appreciate it!"
→ Send review link via SMS immediately
→ Follow up in 3 days if they haven't left review: "Hey [Name], just a friendly reminder about that review if you get a chance! [Link]"

If NO:
"No problem at all! Thanks for letting me know everything looks good. Enjoy your new [countertops/kitchen/etc]!"

If they're NEUTRAL (Score 5-7):
"I'm glad it's working out overall. Is there anything we could have done better? Any feedback would really help us improve."

→ Listen and take detailed notes
→ Thank them for the feedback
→ Share feedback with owner via Slack
→ Do NOT ask for a public review (neutral reviews hurt more than they help)

If they're UNHAPPY (Score 1-4):
${answers.handleNegative.includes('apologize') ? '"I\'m really sorry to hear that. What happened? I want to make sure we make this right for you."' : ''}
${answers.handleNegative.includes('offer-fix') ? '"Let me have [owner/project manager] call you today to see how we can fix this."' : ''}

→ ${answers.handleNegative.includes('alert-owner') ? 'Alert owner IMMEDIATELY via call + Slack' : 'Document the issue'}
→ ${answers.handleNegative.includes('no-review') ? 'Do NOT ask for a public review' : ''}
→ Focus on making it right, not getting a review

PLATFORMS TO REQUEST:
${answers.reviewPlatforms.map(p => `- ${platformLinks[p]}`).join('\n')}

(Send the link to whichever platform they prefer, or Google by default)

IMPORTANT:
- NEVER pressure or guilt customers into leaving reviews
- If they're busy, offer to send the link for later
- If they had ANY negative experience, fix it FIRST
- Always thank them for their business, review or not

TONE:
Friendly, grateful, genuinely interested in their satisfaction. You care about making customers happy first, reviews second.`;
    },

    requiredIntegrations: [
      { service: 'sms', purpose: 'Send review links' }
    ],

    optionalIntegrations: [
      { service: 'google-my-business', purpose: 'Track Google reviews' },
      { service: 'slack', purpose: 'Celebrate new 5-star reviews' }
    ],

    workflows: [
      {
        trigger: 'project.completed',
        name: 'Project Completed',
        delay: 'reviewDelay',
        actions: [
          { type: 'makeCall', condition: 'contactMethod == call' },
          { type: 'sendSMS', condition: 'contactMethod == text', template: 'review-request' },
          { type: 'sendEmail', condition: 'contactMethod == email', template: 'review-request' }
        ]
      },
      {
        trigger: 'review.submitted',
        name: 'Review Submitted',
        actions: [
          { type: 'sendThankYou', template: 'review-thank-you' },
          { type: 'notifySlack', channel: '#wins', condition: 'rating >= 4' },
          { type: 'alertOwner', condition: 'rating <= 3' }
        ]
      }
    ]
  },

  'crew-dispatch': {
    id: 'crew-dispatch',
    name: 'Crew Dispatch Agent',
    description: 'Sends daily job assignments to your crew and tracks check-ins',
    category: 'operations',
    icon: '👷',
    color: '#8B5CF6', // Purple

    pricing: {
      basePrice: 79,
      billingCycle: 'monthly',
      perCallPrice: 0, // Unlimited internal communication
      freeCallsIncluded: 999999
    },

    features: [
      'Sends daily schedules to crew via text',
      'Includes customer details & directions',
      'Tracks crew check-ins at job sites',
      'Alerts if crew is late',
      'Notifies customers when crew arrives',
      'Reduces miscommunication'
    ],

    targetUser: 'Contractors managing 2+ crew members',

    setupQuestions: [
      {
        id: 'companyName',
        type: 'text',
        label: 'Company Name',
        required: true
      },
      {
        id: 'crewMembers',
        type: 'crew-list',
        label: 'Your Crew Members',
        required: true,
        fields: [
          { name: 'name', label: 'Name', type: 'text' },
          { name: 'phone', label: 'Phone', type: 'tel' },
          { name: 'role', label: 'Role', type: 'select', options: ['Lead Installer', 'Assistant', 'Apprentice', 'Subcontractor'] },
          { name: 'skills', label: 'Skills', type: 'multiselect', options: ['Granite', 'Quartz', 'Marble', 'Tile', 'Cabinets'] }
        ]
      },
      {
        id: 'dispatchTime',
        type: 'time',
        label: 'What time should we send daily schedules?',
        defaultValue: '06:00',
        required: true,
        helpText: 'Usually 1-2 hours before first job'
      },
      {
        id: 'dispatchMethod',
        type: 'multiselect',
        label: 'How should we send schedules?',
        required: true,
        options: [
          { value: 'sms', label: 'Text message (SMS)' },
          { value: 'call', label: 'Phone call if no response to text' },
          { value: 'whatsapp', label: 'WhatsApp' },
          { value: 'email', label: 'Email (backup)' }
        ]
      },
      {
        id: 'jobDetails',
        type: 'multiselect',
        label: 'What info should we include in dispatch?',
        required: true,
        options: [
          { value: 'customer-name', label: 'Customer name' },
          { value: 'customer-phone', label: 'Customer phone' },
          { value: 'address', label: 'Job address + map link' },
          { value: 'job-type', label: 'Job type (install, template, etc.)' },
          { value: 'duration', label: 'Estimated duration' },
          { value: 'special-notes', label: 'Special instructions' },
          { value: 'materials', label: 'Materials needed' },
          { value: 'payment-status', label: 'Payment status' }
        ]
      },
      {
        id: 'checkInRequired',
        type: 'multiselect',
        label: 'Check-in requirements for crew',
        required: true,
        options: [
          { value: 'arrive', label: 'Text when arriving at job site' },
          { value: 'depart', label: 'Text when leaving job site' },
          { value: 'photos', label: 'Send before/after photos' },
          { value: 'customer-signature', label: 'Get customer signature on completion' }
        ]
      },
      {
        id: 'lateThreshold',
        type: 'number',
        label: 'Alert me if crew hasn\'t checked in within ___ minutes',
        defaultValue: 15,
        required: true,
        helpText: 'We\'ll call the crew if they haven\'t checked in'
      }
    ],

    generatePrompt: (answers, userInfo) => {
      return `You are the dispatch coordinator for ${answers.companyName}.

YOUR ROLE:
Send daily job schedules to crew members and track their progress throughout the day. Keep everyone organized and on time.

CREW MEMBERS:
${answers.crewMembers.map(crew =>
  `- ${crew.name} (${crew.role}): ${crew.phone} - Skills: ${crew.skills.join(', ')}`
).join('\n')}

DAILY DISPATCH (${answers.dispatchTime}):

Send each crew member their schedule via ${answers.dispatchMethod.join(' and ')}:

"Good morning ${answers.crewMembers[0]?.name || '[Name]'}! Here's your schedule for today:

Job 1 - 8:00 AM
${answers.jobDetails.includes('customer-name') ? 'Sarah Johnson\n' : ''}${answers.jobDetails.includes('customer-phone') ? '(480) 555-9999\n' : ''}${answers.jobDetails.includes('address') ? '123 Main St, Phoenix\n[Google Maps Link]\n' : ''}${answers.jobDetails.includes('job-type') ? '→ Kitchen granite install\n' : ''}${answers.jobDetails.includes('duration') ? '→ Est. 4-6 hours\n' : ''}${answers.jobDetails.includes('materials') ? '→ Slab already at shop (Black Pearl)\n' : ''}${answers.jobDetails.includes('special-notes') ? '→ Customer has 2 dogs - please close gates\n' : ''}${answers.jobDetails.includes('payment-status') ? '→ Deposit received, collect balance on completion\n' : ''}
Job 2 - 2:00 PM
[Next job details...]

Reply READY when you see this.
${answers.checkInRequired.includes('arrive') ? 'Text ARRIVED when you get to each job.\n' : ''}${answers.checkInRequired.includes('depart') ? 'Text DONE when you finish.\n' : ''}Call office if any issues!"

CHECK-IN TRACKING:
${answers.checkInRequired.map(req => {
  const requirements = {
    'arrive': 'When crew texts "ARRIVED" → Update job status to "In Progress" + Notify customer',
    'depart': 'When crew texts "DONE" → Update job to "Completed" + Trigger review request (3 days later)',
    'photos': 'Request before/after photos via text',
    'customer-signature': 'Send digital signature request link'
  };
  return '- ' + requirements[req];
}).join('\n')}

LATE ALERT:
If crew hasn't checked in within ${answers.lateThreshold} minutes of scheduled start:
1. Call crew: "Hey, just checking - did you make it to the job okay?"
2. If no answer, alert owner via Slack
3. Text customer: "Running a few minutes late. Crew will be there shortly."

CUSTOMER NOTIFICATIONS:
- When crew checks in: Text customer "Our crew has arrived and is starting your project!"
- If running late: "We're running about [X] minutes behind. Crew will be there soon!"
- When completed: "Your project is complete! We hope you love it."

DAILY SUMMARY (End of day):
Send owner a summary:
"Daily Summary - [DATE]
Jobs Completed: [X]
Jobs In Progress: [Y]
No-Shows/Cancellations: [Z]
Issues: [List any problems]"

TONE:
Clear, organized, supportive. You keep the crew informed and the jobs running smoothly.`;
    },

    requiredIntegrations: [
      { service: 'google-calendar', purpose: 'Pull daily job schedule' },
      { service: 'sms', purpose: 'Send schedules and receive check-ins' }
    ],

    optionalIntegrations: [
      { service: 'google-maps', purpose: 'Generate directions for crew' },
      { service: 'slack', purpose: 'Alert office of issues' },
      { service: 'whatsapp', purpose: 'Alternative to SMS' }
    ],

    workflows: [
      {
        trigger: 'schedule.daily',
        cron: answers => `0 ${answers.dispatchTime.split(':')[0]} * * *`,
        name: 'Send Daily Dispatch',
        actions: [
          { type: 'getSchedule', service: 'google-calendar' },
          { type: 'sendDispatch', service: 'sms', target: 'crew' },
          { type: 'waitForResponse', timeout: 'lateThreshold' },
          { type: 'alertIfNoResponse', service: 'call' }
        ]
      },
      {
        trigger: 'crew.checkin',
        name: 'Crew Check-In',
        actions: [
          { type: 'updateJobStatus', status: 'in-progress' },
          { type: 'notifyCustomer', template: 'crew-arrived' },
          { type: 'logCheckIn', service: 'database' }
        ]
      }
    ]
  }
};

export default agentTemplates;
