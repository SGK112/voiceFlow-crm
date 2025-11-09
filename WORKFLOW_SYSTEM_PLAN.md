# Visual Workflow System - Complete Implementation Plan

## 🎯 Your Vision
Build a no-code visual workflow builder where users create custom automations by dragging and dropping actions - like Zapier/n8n but built into your CRM and focused on voice + sales automation.

## ✅ What's Already Built

1. **Workflow Model** (`backend/models/Workflow.js`) - Complete database schema
2. **Workflow Engine** (`backend/services/workflowEngine.js`) - Execution engine
3. **Built-in Automations** - 6 hardcoded smart automations for calls

## 🔨 What Needs to Be Built

### Phase 1: Backend API (Priority: HIGH)
**Files to create:**
- `backend/controllers/workflowController.js`
- `backend/routes/workflows.js`

**Endpoints needed:**
```
GET    /api/workflows              - List user's workflows
GET    /api/workflows/templates    - Get pre-built templates
GET    /api/workflows/:id          - Get specific workflow
POST   /api/workflows/create       - Create new workflow
PATCH  /api/workflows/:id          - Update workflow
DELETE /api/workflows/:id          - Delete workflow
POST   /api/workflows/:id/execute  - Manually trigger workflow
GET    /api/workflows/:id/history  - Get execution history
```

### Phase 2: Workflow Templates (Priority: HIGH)
Create 10 proven workflow templates users can clone and customize:

1. **Lead Nurture Sequence**
   - Trigger: New lead created
   - Actions: Send welcome SMS → Wait 1 day → Send email → Wait 2 days → Create follow-up task

2. **Appointment Confirmation**
   - Trigger: Appointment booked
   - Actions: Send SMS confirmation → Add to Google Calendar → Send email with details

3. **Payment Follow-Up**
   - Trigger: Payment received
   - Actions: Send thank you email → Update lead to "customer" → Create upsell task in 30 days

4. **No-Show Recovery**
   - Trigger: Call status = no-answer
   - Actions: Wait 2 hours → Send SMS → Wait 4 hours → Try calling again → Create manual follow-up task

5. **Negative Feedback Alert**
   - Trigger: Call sentiment = negative
   - Actions: Send Slack alert to manager → Create urgent task → Send apology email

6. **Referral Request**
   - Trigger: Payment captured + positive sentiment
   - Actions: Wait 7 days → Send referral request email → Offer $50 credit for referrals

7. **Lead Scoring & Routing**
   - Trigger: Lead qualified
   - Actions: Calculate score → If score > 80, assign to senior rep → If score < 50, nurture sequence

8. **Abandoned Cart Recovery** (for ecommerce)
   - Trigger: Quote sent but no payment in 24h
   - Actions: Send reminder email → Wait 2 days → Call them → Offer 10% discount

9. **Birthday/Anniversary Campaign**
   - Trigger: Schedule (daily at 9 AM)
   - Actions: Find leads with birthday today → Send personalized SMS → Offer special deal

10. **Feedback Survey Automation**
   - Trigger: 7 days after purchase
   - Actions: Send survey link via SMS → If rating < 3, alert manager → If rating > 4, request review

### Phase 3: Frontend - Visual Workflow Builder (Priority: MEDIUM)

**Technology Stack:**
- React Flow (https://reactflow.dev/) - Drag-and-drop workflow canvas
- Or Vue Flow if using Vue
- Monaco Editor for advanced script editing

**UI Components needed:**
1. **Workflow List Page** (`frontend/src/pages/Workflows.jsx`)
   - Table of all workflows
   - Enable/disable toggle
   - Success rate stats
   - Clone/Edit/Delete actions

2. **Workflow Builder Page** (`frontend/src/pages/WorkflowBuilder.jsx`)
   - Canvas with drag-and-drop nodes
   - Sidebar with action blocks
   - Properties panel for configuring actions
   - Save/Publish buttons

3. **Action Blocks** (`frontend/src/components/workflow/blocks/`)
   - TriggerBlock.jsx - Choose trigger event
   - SendSMSBlock.jsx - Configure SMS
   - SendEmailBlock.jsx - Configure email
   - CreateTaskBlock.jsx - Configure task
   - DelayBlock.jsx - Set delay
   - ConditionBlock.jsx - If/else logic
   - WebhookBlock.jsx - Custom API calls

4. **Templates Gallery** (`frontend/src/pages/WorkflowTemplates.jsx`)
   - Cards showing each template
   - Preview button
   - "Use Template" button (clones to user's account)

### Phase 4: Integration Hub (Priority: MEDIUM)

**New Model:** `backend/models/Integration.js`
```javascript
{
  userId,
  service: 'google_calendar' | 'google_sheets' | 'slack' | 'stripe' | etc,
  connected: Boolean,
  credentials: {
    // Encrypted OAuth tokens
    access_token,
    refresh_token,
    expires_at
  },
  scopes: [String],
  lastSyncedAt: Date
}
```

**OAuth Flow:**
1. User clicks "Connect Google Calendar"
2. Redirects to Google OAuth with YOUR client ID
3. Google redirects back with code
4. Backend exchanges code for tokens
5. Stores encrypted tokens in database
6. User can now use Google Calendar actions in workflows

**Integrations to Support:**
- ✅ Twilio (already configured)
- ✅ SendGrid/Gmail (already configured)
- 🔨 Google Calendar
- 🔨 Google Sheets
- 🔨 Slack
- 🔨 Stripe
- 🔨 Zapier (webhook out)
- 🔨 Custom Webhooks

### Phase 5: Pay-As-You-Go Pricing (Priority: HIGH)

**Current Issue:** Stripe is configured but not tracking usage tokens

**New Model:** `backend/models/Token.js`
```javascript
{
  userId,
  type: 'call_minute' | 'workflow_execution' | 'sms_sent' | 'email_sent',
  amount: Number, // How many tokens consumed
  cost: Number, // Cost in USD
  relatedTo: ObjectId, // Call, Workflow, etc.
  metadata: {
    details: String
  },
  createdAt: Date
}
```

**Pricing Strategy:**

| Action | Tokens | Cost | Notes |
|--------|--------|------|-------|
| Voice call (per minute) | 10 | $0.15 | Your cost ~$0.10 |
| SMS sent | 1 | $0.02 | Twilio cost ~$0.01 |
| Email sent | 0.1 | $0.001 | Nearly free via SendGrid |
| Workflow execution | 0.5 | $0.005 | Covers compute |
| AI transcription | 5 | $0.05 | If using Whisper API |

**Subscription Tiers:**
```javascript
{
  trial: {
    price: 0,
    includedTokens: 100, // ~10 min of calls
    maxAgents: 1,
    maxWorkflows: 3
  },
  starter: {
    price: 99, // per month
    includedTokens: 1000, // ~100 min of calls
    maxAgents: 1,
    maxWorkflows: 10,
    overageRate: 0.015 // per token
  },
  professional: {
    price: 299,
    includedTokens: 5000, // ~500 min
    maxAgents: 5,
    maxWorkflows: 50,
    overageRate: 0.012
  },
  enterprise: {
    price: 999,
    includedTokens: 20000, // ~2000 min
    maxAgents: 999,
    maxWorkflows: 999,
    overageRate: 0.010,
    customPricing: true
  }
}
```

**Token Tracking Implementation:**
```javascript
// In workflowEngine.js, after each action:
await Token.create({
  userId,
  type: 'sms_sent',
  amount: 1,
  cost: 0.02,
  relatedTo: workflowId,
  metadata: {
    to: phoneNumber,
    message: truncate(message, 50)
  }
});

// Check if user has tokens before executing
const usage = await Usage.findOne({ userId, currentMonth: getCurrentMonth() });
if (usage.tokensUsed >= usage.tokensIncluded && !usage.overageEnabled) {
  throw new Error('Out of tokens. Please upgrade or enable overage.');
}
```

### Phase 6: Redis Setup (Priority: MEDIUM)

**Why you need Redis:**
1. **Session storage** - JWT sessions, user login state
2. **Rate limiting** - Prevent API abuse
3. **Caching** - Cache frequent DB queries (agent lists, templates)
4. **Queue system** - Background jobs (sending 1000 SMSs)
5. **Workflow delays** - Schedule actions for later

**Setup Steps:**

**Option 1: Redis Cloud (Recommended)**
```bash
# 1. Sign up at https://redis.com/try-free/
# 2. Create free database (30MB, perfect for start)
# 3. Get connection URL
# 4. Add to .env:
REDIS_URL=redis://default:password@redis-12345.c123.us-east-1-2.ec2.cloud.redislabs.com:12345
```

**Option 2: Render Redis (If using Render)**
```bash
# In render.yaml, add:
- type: redis
  name: voiceflow-redis
  plan: starter
  maxmemoryPolicy: allkeys-lru
```

**Usage in Code:**
```javascript
// backend/services/redisClient.js
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache workflow templates
export const cacheTemplates = async (templates) => {
  await redis.setex('workflow:templates', 3600, JSON.stringify(templates));
};

export const getCachedTemplates = async () => {
  const cached = await redis.get('workflow:templates');
  return cached ? JSON.parse(cached) : null;
};

// Queue delayed workflow actions
export const queueDelayedAction = async (actionId, delay) => {
  await redis.zadd('workflow:delayed', Date.now() + delay, actionId);
};
```

### Phase 7: Webhook Integration for Workflows

**Trigger workflows from external events:**
```javascript
// Unique webhook URL for each user
POST /api/webhooks/user/:userId/:webhookToken

// Example: Trigger workflow when Stripe payment received
{
  "trigger": "payment_received",
  "data": {
    "customer_email": "john@example.com",
    "amount": 5000,
    "currency": "usd"
  }
}
```

**This enables:**
- Shopify order → trigger follow-up workflow
- Calendly booking → trigger confirmation workflow
- Form submission → trigger sales workflow

## 📊 Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Workflow     │  │ Visual       │  │ Templates   │  │
│  │ List         │  │ Builder      │  │ Gallery     │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ API Calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Workflow     │  │ Workflow     │  │ Integration │  │
│  │ Controller   │  │ Engine       │  │ Manager     │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   MongoDB    │  │    Redis     │  │ External     │
│  (Workflows) │  │  (Cache/     │  │ APIs         │
│              │  │   Queue)     │  │ (Twilio, etc)│
└──────────────┘  └──────────────┘  └──────────────┘
```

## 🚀 Implementation Priority

### Week 1: Core Foundation
- [x] Workflow model (done)
- [x] Workflow engine (done)
- [ ] Workflow controller + routes
- [ ] 3 basic workflow templates
- [ ] Test with real call trigger

### Week 2: Visual Builder
- [ ] Frontend workflow list page
- [ ] Basic drag-and-drop canvas
- [ ] 5 action blocks (SMS, Email, Task, Delay, Condition)
- [ ] Save/load workflows

### Week 3: Integrations & Tokens
- [ ] Google OAuth setup
- [ ] Token tracking system
- [ ] Usage billing in Stripe
- [ ] Redis setup and caching

### Week 4: Templates & Polish
- [ ] All 10 workflow templates
- [ ] Template gallery UI
- [ ] Documentation
- [ ] Video tutorials

## 💰 Revenue Model

**Your Costs (per 100 users):**
- Voice minutes: $0.10/min × 10,000 min = $1,000
- SMS: $0.01/msg × 5,000 msgs = $50
- Email: $0/email (SendGrid free tier)
- Infrastructure: Render $50/mo
- **Total: ~$1,100/mo**

**Your Revenue (per 100 users @ $99/mo avg):**
- 100 users × $99 = $9,900/mo
- **Profit: $8,800/mo (88% margin!)**

**Key Insight:** You provide infrastructure, they get simplicity. Win-win!

## 🎨 UI/UX Best Practices

1. **Simplicity First** - Start with 5 action blocks, add more later
2. **Visual Feedback** - Show workflow running with animated progress
3. **Error Handling** - Clear errors: "SMS failed: Invalid phone number"
4. **Templates** - 80% of users will use templates, not build from scratch
5. **Preview Mode** - Let users "dry run" workflows before enabling

## 📝 Next Steps

### Right Now (Most Important):
1. **Set up Redis** - You'll need this for everything else
2. **Create workflow controller** - Basic CRUD operations
3. **Test workflow engine** - Make sure it actually works with real calls
4. **Build 3 templates** - Prove the concept

### This Week:
5. **Token tracking** - Critical for revenue
6. **Frontend workflow list** - So users can see their workflows

### Next Week:
7. **Visual builder** - The "wow" factor
8. **Google OAuth** - Unlock calendar integrations

Want me to start building any of these specific components? I can:
- Build the workflow controller + routes
- Set up Redis configuration
- Create the token tracking system
- Build template workflows

Which should I tackle first?
