# Remodely.ai Integration Strategy

## Executive Summary

This document outlines the integration strategy for Remodely.ai VoiceFlow CRM, including API architecture, third-party integrations, and white-label capabilities.

## 1. Core API Structure

### Base API Endpoint
```
Production: https://api.remodely.ai/v1
Development: http://localhost:5000/api
```

### Authentication Methods

#### A. API Keys (For Partners/Developers)
```http
POST /v1/voice/initiate-call
Headers:
  X-API-Key: sk_live_xxxxxxxxxxxxx
  Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "agentId": "agent_123",
  "leadData": {...}
}
```

#### B. OAuth 2.0 (For User Integrations)
```http
GET /oauth/authorize?client_id=xxx&redirect_uri=xxx&scope=calls.read,leads.write
```

### API Capabilities

#### Voice Agent API
- `POST /voice/initiate-call` - Start outbound call
- `GET /voice/calls` - List all calls
- `GET /voice/calls/:id` - Get call details
- `GET /voice/calls/:id/recording` - Download recording
- `GET /voice/calls/:id/transcript` - Get transcript

#### Lead Management API
- `POST /leads` - Create lead
- `GET /leads` - List leads
- `PUT /leads/:id` - Update lead
- `DELETE /leads/:id` - Delete lead
- `POST /leads/:id/qualify` - Mark as qualified

#### Workflow API
- `POST /workflows` - Create automation
- `GET /workflows/:id/execute` - Trigger workflow
- `PUT /workflows/:id` - Update workflow

## 2. Third-Party Integration Strategy

### Tier 1: Native Integrations (OAuth)

#### Gmail / Google Workspace
**API Required:** Yes
**Setup Complexity:** Medium
**Value:** High

```javascript
// Implementation
const { google } = require('googleapis');

async function sendEmail(accessToken, to, subject, body) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: createMimeMessage(to, subject, body)
    }
  });
}
```

**User Setup Steps:**
1. Click "Connect Gmail"
2. OAuth popup → Allow permissions
3. Done!

---

#### HubSpot CRM
**API Required:** Yes
**Setup Complexity:** Easy
**Value:** Very High (popular CRM)

```javascript
const hubspot = require('@hubspot/api-client');

async function createHubSpotContact(lead) {
  const hubspotClient = new hubspot.Client({ accessToken: 'xxx' });

  return await hubspotClient.crm.contacts.basicApi.create({
    properties: {
      email: lead.email,
      firstname: lead.firstName,
      lastname: lead.lastName,
      phone: lead.phone,
      company: lead.company
    }
  });
}
```

**Integration Flow:**
```
Voice Call → Lead Qualified → Auto-create HubSpot Contact → Add to Pipeline
```

---

#### Salesforce
**API Required:** Yes
**Setup Complexity:** High
**Value:** Very High (enterprise)

```javascript
const jsforce = require('jsforce');

async function createSalesforceContact(lead) {
  const conn = new jsforce.Connection({ accessToken: 'xxx' });

  return await conn.sobject('Contact').create({
    FirstName: lead.firstName,
    LastName: lead.lastName,
    Email: lead.email,
    Phone: lead.phone,
    Company: lead.company
  });
}
```

---

### Tier 2: Zapier/Make Integration (5000+ Apps)

**API Required:** ONE webhook API
**Setup Complexity:** Very Easy
**Value:** Extremely High

#### How It Works:
1. User creates Zapier account
2. Connects Remodely.ai → Any app
3. Maps fields visually
4. Done!

#### Implementation:
```javascript
// Webhook endpoint for Zapier
app.post('/api/webhooks/zapier/catch', async (req, res) => {
  const { event, data } = req.body;

  // Zapier sends data to their 5000+ app integrations
  await triggerWebhook({
    url: req.user.zapierWebhookUrl,
    payload: {
      event,
      timestamp: new Date(),
      data
    }
  });

  res.json({ success: true });
});
```

#### Supported Events:
- `call.started`
- `call.completed`
- `lead.created`
- `lead.qualified`
- `deal.won`
- `deal.lost`
- `appointment.scheduled`
- `invoice.created`

**Apps You Get Instantly:**
- All CRMs (Salesforce, Pipedrive, Zoho, etc.)
- All Email (Gmail, Outlook, SendGrid, etc.)
- All Calendars (Google, Outlook, iCloud, etc.)
- All Messaging (Slack, Teams, Discord, etc.)
- All Spreadsheets (Google Sheets, Excel, Airtable, etc.)
- All E-commerce (Shopify, WooCommerce, etc.)
- 5000+ more

---

### Tier 3: Custom Webhooks (White-Label Partners)

**User Controls Everything**

```javascript
// Partner registers webhook
POST /api/webhooks
{
  "name": "My CRM Integration",
  "url": "https://mycrm.com/api/webhooks/remodely",
  "events": ["call.completed", "lead.qualified"],
  "headers": {
    "X-API-Key": "their_api_key"
  }
}

// We send them data
POST https://mycrm.com/api/webhooks/remodely
{
  "event": "lead.qualified",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "leadId": "lead_123",
    "email": "john@example.com",
    "phone": "+1234567890",
    "qualified": true,
    "score": 85,
    "callDuration": 180,
    "transcript": "..."
  }
}
```

## 3. White-Label API Architecture

### Partner API Keys
```javascript
// Generate partner API key
POST /api/admin/partners
{
  "companyName": "ACME Remodeling",
  "domain": "acme-remodeling.com",
  "branding": {
    "logo": "https://cdn.acme.com/logo.png",
    "primaryColor": "#FF6B00",
    "companyName": "ACME Voice AI"
  },
  "limits": {
    "monthlyMinutes": 10000,
    "maxAgents": 50,
    "apiRateLimit": 100 // per minute
  }
}

// Response
{
  "partnerId": "partner_abc123",
  "apiKey": "sk_live_partner_xxxxxxxxxxxxx",
  "webhookSecret": "whsec_xxxxxxxxxxxxx"
}
```

### White-Label API Usage
```javascript
// Partner makes API call with their branding
POST https://api.remodely.ai/v1/voice/call
Headers:
  X-API-Key: sk_live_partner_xxxxxxxxxxxxx
  X-Partner-Domain: acme-remodeling.com

{
  "phoneNumber": "+1234567890",
  "agentId": "agent_123",
  "brandingOverride": {
    "companyName": "ACME Voice AI",
    "voiceGreeting": "Thank you for calling ACME Remodeling"
  }
}

// Response includes their branding
{
  "callId": "call_xyz",
  "status": "initiated",
  "brandedAs": "ACME Voice AI",
  "callbackUrl": "https://voice.acme-remodeling.com/call/xyz"
}
```

### Subdomain Support
```
partner-name.remodely.ai → White-labeled dashboard
OR
voice.partner-domain.com → CNAME to our servers
```

## 4. Integration Template System

### Pre-Built Integration Templates

#### Template: "New Lead to HubSpot"
```json
{
  "id": "hubspot-new-lead",
  "name": "Sync New Leads to HubSpot",
  "description": "Automatically create HubSpot contacts from qualified leads",
  "trigger": {
    "event": "lead.qualified"
  },
  "actions": [
    {
      "app": "hubspot",
      "action": "createContact",
      "mapping": {
        "email": "{{lead.email}}",
        "firstname": "{{lead.firstName}}",
        "lastname": "{{lead.lastName}}",
        "phone": "{{lead.phone}}",
        "company": "{{lead.company}}",
        "lead_source": "VoiceFlow CRM",
        "lead_score": "{{lead.qualificationScore}}"
      }
    },
    {
      "app": "slack",
      "action": "sendMessage",
      "config": {
        "channel": "#sales",
        "message": "New qualified lead: {{lead.firstName}} {{lead.lastName}} ({{lead.company}})"
      }
    }
  ]
}
```

#### Template: "Schedule Follow-Up"
```json
{
  "id": "schedule-followup",
  "name": "Auto-Schedule Follow-Up Call",
  "trigger": {
    "event": "call.completed",
    "conditions": {
      "callbackRequested": true
    }
  },
  "actions": [
    {
      "app": "google-calendar",
      "action": "createEvent",
      "mapping": {
        "summary": "Follow-up: {{lead.company}}",
        "description": "Call back {{lead.firstName}} at {{lead.phone}}",
        "start": "{{suggestedFollowUpTime}}",
        "duration": 30
      }
    },
    {
      "app": "email",
      "action": "send",
      "config": {
        "to": "{{lead.email}}",
        "subject": "Great talking with you!",
        "template": "followup-confirmation"
      }
    }
  ]
}
```

## 5. Popular Integrations to Add

### Priority 1 (Next 2 weeks)
1. ✅ **Zapier** - 5000+ apps instantly
2. ✅ **Make.com** - Alternative to Zapier
3. **HubSpot** - Most requested CRM
4. **Slack** - Team notifications

### Priority 2 (Next month)
5. **Salesforce** - Enterprise CRM
6. **Google Calendar** - Appointment scheduling
7. **WhatsApp Business** - International messaging
8. **Calendly** - Appointment booking

### Priority 3 (Next quarter)
9. **Microsoft Teams** - Enterprise messaging
10. **ActiveCampaign** - Marketing automation
11. **Pipedrive** - Sales CRM
12. **Shopify** - E-commerce

## 6. API Documentation Strategy

### Interactive API Docs
Use Swagger/OpenAPI:
```
https://api.remodely.ai/docs
```

### Code Examples
Provide SDKs in:
- JavaScript/Node.js
- Python
- PHP
- Ruby
- cURL

Example:
```javascript
// Node.js SDK
const Remodely = require('remodely-sdk');

const client = new Remodely('sk_live_xxxxx');

// Initiate call
const call = await client.voice.initiateCall({
  phoneNumber: '+1234567890',
  agentId: 'agent_123',
  leadData: {
    firstName: 'John',
    company: 'ACME Corp'
  }
});

console.log('Call initiated:', call.id);
```

## 7. Rate Limiting & Security

### API Rate Limits
```
Free: 100 requests/minute
Starter: 500 requests/minute
Professional: 2,000 requests/minute
Enterprise: Unlimited
```

### Security Best Practices
1. **HTTPS Only** - All API calls
2. **API Key Rotation** - Every 90 days
3. **Webhook Signatures** - Verify authenticity
4. **IP Whitelisting** - For enterprise
5. **OAuth Scopes** - Minimal permissions

### Webhook Verification
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}
```

## 8. Pricing for API Access

### API Pricing Tiers
- **Free Tier**: 1,000 API calls/month
- **Starter**: 10,000 API calls/month ($29/mo)
- **Professional**: 100,000 API calls/month ($99/mo)
- **Enterprise**: Unlimited ($custom)

### White-Label Pricing
- **Base**: $500/month + revenue share
- **Pro**: $2,000/month + lower revenue share
- **Enterprise**: Custom pricing

## 9. Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Create API key management system
- [ ] Build OAuth 2.0 flow
- [ ] Set up webhook delivery system
- [ ] Create API documentation site
- [ ] Add rate limiting

### Phase 2: Quick Wins (Week 3-4)
- [ ] Zapier integration
- [ ] Make.com integration
- [ ] Improve webhook events
- [ ] Add integration templates

### Phase 3: Native Integrations (Month 2)
- [ ] HubSpot OAuth
- [ ] Slack notifications
- [ ] Google Calendar sync
- [ ] Gmail integration

### Phase 4: White-Label (Month 3)
- [ ] Partner API key system
- [ ] Subdomain routing
- [ ] Branding configuration
- [ ] Partner dashboard

## 10. Resources & Tools

### Recommended NPM Packages
```json
{
  "dependencies": {
    "@hubspot/api-client": "^9.0.0",
    "googleapis": "^118.0.0",
    "@slack/web-api": "^6.9.0",
    "salesforce": "^2.0.0",
    "twilio": "^4.19.0",
    "stripe": "^14.0.0",
    "zapier-platform-core": "^15.0.0"
  }
}
```

### OAuth Libraries
- `passport` - OAuth middleware
- `passport-google-oauth20`
- `passport-microsoft`
- `passport-salesforce`

### API Testing Tools
- Postman Collections
- Insomnia workspace
- cURL examples
- Jest API tests

## Conclusion

The most efficient strategy is:

1. **Start with Zapier/Make** - Instant 5000+ integrations
2. **Build Native for Top 5** - HubSpot, Slack, Salesforce, etc.
3. **Maintain Webhooks** - For custom integrations
4. **Offer White-Label** - Premium tier for agencies

This gives you maximum coverage with minimum development effort.
