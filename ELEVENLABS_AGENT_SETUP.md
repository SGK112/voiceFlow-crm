# ElevenLabs Agent Setup Guide

Complete guide to creating 5 production-ready conversational AI agents with n8n workflow integration.

---

## Overview

You'll create 5 specialized agents:
1. **Lead Generation Agent** - Captures leads and qualifies prospects
2. **Booking Agent** - Schedules appointments and manages calendar
3. **Collections Agent** - Handles payment reminders and overdue accounts
4. **Promotions Agent** - Delivers marketing offers and upsells
5. **Support Agent** - Handles customer service inquiries

Each agent will have custom tools that trigger n8n workflows.

---

## Prerequisites

- ElevenLabs account with Conversational AI access
- n8n webhook URL: `https://remodely.app.n8n.cloud/webhook`
- n8n API key: (you have this in .env)

---

## Part 1: Create n8n Workflows First

Before creating agents, set up these n8n workflows:

### Workflow 1: Lead Capture
**Webhook URL:** `https://remodely.app.n8n.cloud/webhook/lead-capture`

**Expected Input:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "company": "Acme Inc",
  "interest": "Enterprise plan",
  "budget": "$500-1000/month",
  "notes": "Additional context from conversation"
}
```

**Workflow Actions:**
1. Receive webhook data
2. Create lead in MongoDB (via API call to your backend)
3. Send notification email to sales team
4. Add to CRM with "New Lead" status
5. Return success confirmation

### Workflow 2: Appointment Booking
**Webhook URL:** `https://remodely.app.n8n.cloud/webhook/book-appointment`

**Expected Input:**
```json
{
  "customerName": "Jane Smith",
  "customerPhone": "+1234567890",
  "customerEmail": "jane@example.com",
  "appointmentType": "Demo",
  "preferredDate": "2024-02-15",
  "preferredTime": "2:00 PM",
  "timezone": "America/New_York",
  "notes": "Interested in enterprise features"
}
```

**Workflow Actions:**
1. Check calendar availability
2. Create appointment in calendar system
3. Send confirmation email to customer
4. Send reminder to sales rep
5. Return booking confirmation with details

### Workflow 3: Payment Collection
**Webhook URL:** `https://remodely.app.n8n.cloud/webhook/payment-reminder`

**Expected Input:**
```json
{
  "customerName": "Bob Johnson",
  "customerPhone": "+1234567890",
  "accountNumber": "ACC-12345",
  "amountDue": 299.00,
  "dueDate": "2024-02-10",
  "daysPastDue": 5,
  "paymentMethod": "credit card ending in 4242"
}
```

**Workflow Actions:**
1. Look up customer account
2. Generate payment link
3. Send payment reminder via email/SMS
4. Log interaction in CRM
5. Return payment instructions

### Workflow 4: Promotion Delivery
**Webhook URL:** `https://remodely.app.n8n.cloud/webhook/send-promotion`

**Expected Input:**
```json
{
  "customerName": "Alice Williams",
  "customerPhone": "+1234567890",
  "customerEmail": "alice@example.com",
  "currentPlan": "Starter",
  "promotionType": "Upgrade discount",
  "discountCode": "UPGRADE20",
  "expiryDate": "2024-03-01",
  "interested": true
}
```

**Workflow Actions:**
1. Check customer eligibility
2. Generate personalized discount code
3. Send promotional email
4. Update customer record
5. Return confirmation

### Workflow 5: Support Ticket
**Webhook URL:** `https://remodely.app.n8n.cloud/webhook/create-ticket`

**Expected Input:**
```json
{
  "customerName": "Charlie Brown",
  "customerPhone": "+1234567890",
  "customerEmail": "charlie@example.com",
  "issueType": "Technical",
  "priority": "Medium",
  "description": "Cannot connect phone number",
  "accountId": "user_123"
}
```

**Workflow Actions:**
1. Create support ticket in system
2. Assign to appropriate team member
3. Send confirmation to customer
4. Notify support team
5. Return ticket number

---

## Part 2: Create ElevenLabs Agents

Go to: https://elevenlabs.io/app/conversational-ai

### Agent 1: Lead Generation Agent

**Basic Settings:**
- **Name:** Lead Generation Agent
- **Voice:** Choose professional, friendly voice (e.g., "Rachel" or "Adam")
- **Language:** English (US)

**System Prompt:**
```
You are a professional lead generation specialist for VoiceFlow CRM, a cutting-edge voice AI platform. Your role is to:

1. Greet callers warmly and professionally
2. Qualify leads by understanding their business needs
3. Ask about their company size, industry, and current challenges
4. Identify their budget range and decision timeline
5. Capture complete contact information
6. Use the lead_capture tool to save information

Key Information to Collect:
- Full name and company name
- Phone number and email
- Industry and company size
- Current solution (if any)
- Pain points or challenges
- Budget range
- Timeline for implementation
- Best time for follow-up

Always be professional, helpful, and never pushy. If the lead is qualified, use the lead_capture tool to save their information.

After capturing the lead, thank them and let them know someone from the sales team will follow up within 24 hours.
```

**Custom Tools:**

**Tool 1: lead_capture**
```json
{
  "name": "lead_capture",
  "description": "Captures lead information and saves it to the CRM system. Use this when you have collected the prospect's information.",
  "parameters": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Full name of the lead"
      },
      "phone": {
        "type": "string",
        "description": "Phone number of the lead"
      },
      "email": {
        "type": "string",
        "description": "Email address of the lead"
      },
      "company": {
        "type": "string",
        "description": "Company name"
      },
      "interest": {
        "type": "string",
        "description": "What they are interested in (e.g., 'Starter plan', 'Enterprise solution')"
      },
      "budget": {
        "type": "string",
        "description": "Budget range mentioned (e.g., '$100-500/month', 'Enterprise budget')"
      },
      "notes": {
        "type": "string",
        "description": "Additional notes from the conversation"
      }
    },
    "required": ["name", "phone", "email", "company"]
  },
  "url": "https://remodely.app.n8n.cloud/webhook/lead-capture",
  "method": "POST"
}
```

**Conversation Settings:**
- **First Message:** "Hi! Thanks for calling VoiceFlow CRM. I'm here to learn about your business and see how our voice AI platform can help you. Can you tell me a bit about your company and what brought you to us today?"
- **Max Duration:** 10 minutes
- **End Call Phrases:** ["thank you goodbye", "that's all", "talk later"]

**After Creating:** Copy the Agent ID (starts with `agent_`) and save it as `ELEVENLABS_LEAD_GEN_AGENT_ID`

---

### Agent 2: Booking Agent

**Basic Settings:**
- **Name:** Booking Agent
- **Voice:** Professional, organized voice (e.g., "Emily" or "Josh")
- **Language:** English (US)

**System Prompt:**
```
You are a professional scheduling assistant for VoiceFlow CRM. Your role is to:

1. Greet the caller warmly
2. Understand what type of appointment they need (demo, consultation, technical support, etc.)
3. Collect their contact information
4. Ask about their preferred date and time
5. Check availability and confirm the booking
6. Use the book_appointment tool to schedule

Types of Appointments:
- Product Demo (30 minutes)
- Sales Consultation (45 minutes)
- Technical Setup Call (60 minutes)
- Strategy Session (90 minutes)

Always confirm:
- Customer's full name and contact details
- Type of appointment
- Preferred date and time
- Their timezone
- Any specific topics to cover

After booking, confirm all details clearly and let them know they'll receive a confirmation email.
```

**Custom Tools:**

**Tool 1: book_appointment**
```json
{
  "name": "book_appointment",
  "description": "Books an appointment in the calendar system. Use this after confirming all details with the customer.",
  "parameters": {
    "type": "object",
    "properties": {
      "customerName": {
        "type": "string",
        "description": "Full name of the customer"
      },
      "customerPhone": {
        "type": "string",
        "description": "Customer's phone number"
      },
      "customerEmail": {
        "type": "string",
        "description": "Customer's email address"
      },
      "appointmentType": {
        "type": "string",
        "enum": ["Product Demo", "Sales Consultation", "Technical Setup", "Strategy Session"],
        "description": "Type of appointment"
      },
      "preferredDate": {
        "type": "string",
        "description": "Preferred date in YYYY-MM-DD format"
      },
      "preferredTime": {
        "type": "string",
        "description": "Preferred time (e.g., '2:00 PM', '10:30 AM')"
      },
      "timezone": {
        "type": "string",
        "description": "Customer's timezone (e.g., 'America/New_York', 'America/Los_Angeles')"
      },
      "notes": {
        "type": "string",
        "description": "Any specific topics or questions to cover"
      }
    },
    "required": ["customerName", "customerPhone", "customerEmail", "appointmentType", "preferredDate", "preferredTime", "timezone"]
  },
  "url": "https://remodely.app.n8n.cloud/webhook/book-appointment",
  "method": "POST"
}
```

**Conversation Settings:**
- **First Message:** "Hello! I'm your scheduling assistant for VoiceFlow CRM. I can help you book a demo, consultation, or technical call. What type of appointment are you looking to schedule today?"
- **Max Duration:** 8 minutes

**After Creating:** Save Agent ID as `ELEVENLABS_BOOKING_AGENT_ID`

---

### Agent 3: Collections Agent

**Basic Settings:**
- **Name:** Collections Agent
- **Voice:** Professional, empathetic voice (e.g., "Sarah" or "Chris")
- **Language:** English (US)

**System Prompt:**
```
You are a professional and empathetic collections specialist for VoiceFlow CRM. Your role is to:

1. Greet the customer respectfully
2. Verify their identity and account information
3. Inform them about their outstanding balance in a non-confrontational way
4. Understand their situation and any difficulties they're facing
5. Offer flexible payment solutions
6. Use the payment_reminder tool to process payment arrangements

Important Guidelines:
- Always be respectful and empathetic
- Never be aggressive or threatening
- Listen to their concerns
- Offer payment plans if needed
- Confirm their preferred payment method
- Thank them for their cooperation

Account Information to Verify:
- Customer name
- Account number or customer ID
- Amount due
- Due date
- Payment method on file

Always end positively and thank them for their time, regardless of the outcome.
```

**Custom Tools:**

**Tool 1: payment_reminder**
```json
{
  "name": "payment_reminder",
  "description": "Sends payment reminder and generates payment link for overdue accounts.",
  "parameters": {
    "type": "object",
    "properties": {
      "customerName": {
        "type": "string",
        "description": "Customer's full name"
      },
      "customerPhone": {
        "type": "string",
        "description": "Customer's phone number"
      },
      "accountNumber": {
        "type": "string",
        "description": "Account or customer ID"
      },
      "amountDue": {
        "type": "number",
        "description": "Total amount due in dollars"
      },
      "dueDate": {
        "type": "string",
        "description": "Original due date in YYYY-MM-DD format"
      },
      "daysPastDue": {
        "type": "integer",
        "description": "Number of days past due"
      },
      "paymentMethod": {
        "type": "string",
        "description": "Preferred payment method (e.g., 'credit card', 'bank transfer', 'check')"
      }
    },
    "required": ["customerName", "customerPhone", "amountDue"]
  },
  "url": "https://remodely.app.n8n.cloud/webhook/payment-reminder",
  "method": "POST"
}
```

**Conversation Settings:**
- **First Message:** "Hello, this is a courtesy call from VoiceFlow CRM regarding your account. Is this a good time to speak for just a moment?"
- **Max Duration:** 6 minutes

**After Creating:** Save Agent ID as `ELEVENLABS_COLLECTIONS_AGENT_ID`

---

### Agent 4: Promotions Agent

**Basic Settings:**
- **Name:** Promotions Agent
- **Voice:** Enthusiastic, friendly voice (e.g., "Bella" or "Sam")
- **Language:** English (US)

**System Prompt:**
```
You are an enthusiastic promotions specialist for VoiceFlow CRM. Your role is to:

1. Greet customers with excitement about the special offer
2. Clearly explain the promotion and its benefits
3. Understand their current plan and usage
4. Show how upgrading saves them money or adds value
5. Answer questions about features and pricing
6. Use the send_promotion tool to deliver the offer

Current Promotions:
- Upgrade from Starter to Professional: 20% off for 3 months
- Annual plans: 2 months free
- Refer a friend: $50 credit for both
- Early renewal: 15% discount

Key Points to Highlight:
- Limited time offer
- Exclusive pricing
- Additional features they'll get
- ROI and value proposition
- Easy upgrade process

Always be enthusiastic but not pushy. If they're interested, use the send_promotion tool to email them the details.
```

**Custom Tools:**

**Tool 1: send_promotion**
```json
{
  "name": "send_promotion",
  "description": "Sends promotional offer and discount code to customer via email.",
  "parameters": {
    "type": "object",
    "properties": {
      "customerName": {
        "type": "string",
        "description": "Customer's full name"
      },
      "customerPhone": {
        "type": "string",
        "description": "Customer's phone number"
      },
      "customerEmail": {
        "type": "string",
        "description": "Customer's email address"
      },
      "currentPlan": {
        "type": "string",
        "enum": ["Trial", "Starter", "Professional", "Enterprise"],
        "description": "Customer's current subscription plan"
      },
      "promotionType": {
        "type": "string",
        "description": "Type of promotion offered (e.g., 'Upgrade discount', 'Annual plan discount')"
      },
      "discountCode": {
        "type": "string",
        "description": "Discount code to apply (e.g., 'UPGRADE20', 'ANNUAL2FREE')"
      },
      "expiryDate": {
        "type": "string",
        "description": "Promotion expiry date in YYYY-MM-DD format"
      },
      "interested": {
        "type": "boolean",
        "description": "Whether customer expressed interest in the promotion"
      }
    },
    "required": ["customerName", "customerEmail", "promotionType", "interested"]
  },
  "url": "https://remodely.app.n8n.cloud/webhook/send-promotion",
  "method": "POST"
}
```

**Conversation Settings:**
- **First Message:** "Hi! I'm calling from VoiceFlow CRM with some exciting news! We have an exclusive limited-time offer for our valued customers. Do you have a quick minute to hear about it?"
- **Max Duration:** 8 minutes

**After Creating:** Save Agent ID as `ELEVENLABS_PROMO_AGENT_ID`

---

### Agent 5: Support Agent

**Basic Settings:**
- **Name:** Support Agent
- **Voice:** Calm, helpful voice (e.g., "Natasha" or "Daniel")
- **Language:** English (US)

**System Prompt:**
```
You are a professional technical support specialist for VoiceFlow CRM. Your role is to:

1. Greet the customer and ask about their issue
2. Listen carefully to understand the problem
3. Ask clarifying questions to diagnose the issue
4. Provide step-by-step troubleshooting guidance
5. Create a support ticket for issues requiring follow-up
6. Use the create_ticket tool to log the issue

Common Issues You Can Help With:
- Login and authentication problems
- Phone number connection issues
- Agent configuration questions
- Call quality problems
- Billing and subscription questions
- Feature usage and best practices

Troubleshooting Steps:
1. Identify the issue clearly
2. Determine severity and urgency
3. Provide immediate solutions if possible
4. Create ticket for complex issues
5. Set expectations for follow-up

Always be patient, clear, and reassuring. If you can't solve it immediately, assure them a specialist will help within 24 hours.
```

**Custom Tools:**

**Tool 1: create_ticket**
```json
{
  "name": "create_ticket",
  "description": "Creates a support ticket in the system for technical issues requiring follow-up.",
  "parameters": {
    "type": "object",
    "properties": {
      "customerName": {
        "type": "string",
        "description": "Customer's full name"
      },
      "customerPhone": {
        "type": "string",
        "description": "Customer's phone number"
      },
      "customerEmail": {
        "type": "string",
        "description": "Customer's email address"
      },
      "issueType": {
        "type": "string",
        "enum": ["Technical", "Billing", "Feature Request", "Account Access", "Call Quality", "Other"],
        "description": "Type of issue"
      },
      "priority": {
        "type": "string",
        "enum": ["Low", "Medium", "High", "Critical"],
        "description": "Priority level of the issue"
      },
      "description": {
        "type": "string",
        "description": "Detailed description of the issue"
      },
      "accountId": {
        "type": "string",
        "description": "Customer's account ID or user ID"
      }
    },
    "required": ["customerName", "customerPhone", "customerEmail", "issueType", "priority", "description"]
  },
  "url": "https://remodely.app.n8n.cloud/webhook/create-ticket",
  "method": "POST"
}
```

**Conversation Settings:**
- **First Message:** "Hello! You've reached VoiceFlow CRM technical support. I'm here to help you with any issues you're experiencing. Can you tell me what's going on?"
- **Max Duration:** 12 minutes

**After Creating:** Save Agent ID as `ELEVENLABS_SUPPORT_AGENT_ID`

---

## Part 3: Update Render Environment Variables

After creating all 5 agents, go to your Render service and add these environment variables:

```bash
ELEVENLABS_LEAD_GEN_AGENT_ID=agent_xxxxxxxxxxxxxx
ELEVENLABS_BOOKING_AGENT_ID=agent_xxxxxxxxxxxxxx
ELEVENLABS_COLLECTIONS_AGENT_ID=agent_xxxxxxxxxxxxxx
ELEVENLABS_PROMO_AGENT_ID=agent_xxxxxxxxxxxxxx
ELEVENLABS_SUPPORT_AGENT_ID=agent_xxxxxxxxxxxxxx
```

---

## Part 4: Test Each Agent

### Testing Checklist

For each agent, test:

1. **Basic conversation flow:**
   - Call initiates properly
   - Agent responds appropriately
   - Conversation feels natural

2. **Tool execution:**
   - Agent knows when to use the tool
   - Tool receives correct data
   - n8n workflow triggers
   - Response is handled properly

3. **Edge cases:**
   - Customer says "I don't know" or gives incomplete info
   - Customer hangs up mid-conversation
   - Tool fails or times out

### Test Script for Lead Generation Agent:

```
You: "Hi, I'm calling to learn about VoiceFlow."
Agent: [Introduces self and asks about business]
You: "I run a real estate company with 50 agents."
Agent: [Asks more qualifying questions]
You: "We need better lead follow-up. Budget is around $500/month."
Agent: [Asks for contact info]
You: "John Smith, john@realestate.com, 555-1234"
Agent: [Uses lead_capture tool, confirms submission]
You: "Thank you!"
```

Verify:
- Lead appears in n8n workflow execution log
- Lead is created in MongoDB
- Confirmation email sent to sales team

---

## Part 5: Production Optimization

### Voice Settings

For each agent, optimize:
- **Stability:** 0.5-0.7 (balanced)
- **Similarity:** 0.7-0.8 (high)
- **Style:** 0.3-0.5 (moderate)
- **Use Speaker Boost:** Yes

### Advanced Settings

- **Response Latency:** Low (for real-time feel)
- **Interruption Sensitivity:** Medium
- **Background Noise Suppression:** High
- **Emotion Control:** Moderate

### Knowledge Base

Upload knowledge base documents for each agent:
- Lead Gen: Product features, pricing, competitor comparison
- Booking: Calendar availability, appointment types
- Collections: Payment policies, FAQ
- Promotions: Current offers, discount codes, terms
- Support: Technical documentation, troubleshooting guides

---

## Part 6: Monitor and Improve

### Analytics to Track

For each agent, monitor:
- **Conversation duration** (avg. should be 3-5 minutes)
- **Tool usage rate** (should be 60-80%)
- **Customer satisfaction** (via post-call survey)
- **Conversion rate** (leads, bookings, payments)

### Continuous Improvement

Weekly:
- Review call recordings
- Identify common issues
- Update system prompts
- Add new training examples

Monthly:
- Analyze performance metrics
- A/B test different prompts
- Update knowledge bases
- Refine tool parameters

---

## Troubleshooting

### Tool Not Triggering

**Problem:** Agent doesn't use the tool even when appropriate

**Solutions:**
- Make tool description clearer
- Add more examples in system prompt
- Reduce number of required parameters
- Test tool manually via n8n

### Webhook Failing

**Problem:** Tool executes but webhook returns error

**Solutions:**
- Check n8n workflow is active
- Verify webhook URL is correct
- Check n8n logs for errors
- Test webhook with Postman/curl

### Agent Sounds Unnatural

**Problem:** Responses are robotic or awkward

**Solutions:**
- Adjust voice stability settings
- Add more conversational examples to prompt
- Use shorter, simpler sentences in prompt
- Enable emotion controls

### Response Too Slow

**Problem:** Long pauses between responses

**Solutions:**
- Reduce tool complexity
- Use faster voice model
- Optimize n8n workflow response time
- Enable response caching

---

## Summary

You now have 5 production-ready conversational AI agents:

1. ✅ **Lead Generation** - Captures and qualifies leads
2. ✅ **Booking** - Schedules appointments
3. ✅ **Collections** - Manages payments
4. ✅ **Promotions** - Delivers offers
5. ✅ **Support** - Handles technical issues

All connected to n8n workflows for automation!

**Next Steps:**
1. Create the 5 agents in ElevenLabs dashboard using the configurations above
2. Set up the 5 n8n workflows with the specified webhook URLs
3. Copy each agent ID to Render environment variables
4. Test each agent with the provided test scripts
5. Monitor performance and optimize

Your VoiceFlow CRM is now ready for production! 🚀
