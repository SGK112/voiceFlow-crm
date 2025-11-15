# Voice AI with Arms - Webhook Setup Guide

## Overview

This system demonstrates **"Voice AI with Arms"** - AI agents that can take real-time actions during and after calls:

- 📱 **Send SMS** during call when customer requests
- 📧 **Send emails** automatically post-call
- 📅 **Book appointments** (future)
- 🔔 **Trigger n8n workflows** (future)
- ✅ **Real-time customer actions** based on conversation

## What We Built

### 1. **Real-Time SMS During Call**
When a customer says "Can you text me the link?", the AI agent:
1. Recognizes the request
2. Calls webhook to send SMS
3. Confirms: "Done! Just texted you the link. Check your phone!"

### 2. **Post-Call Follow-Up**
After every demo call ends:
- Automatically sends follow-up SMS with signup link
- Sends beautiful HTML email with next steps
- All triggered via webhook when call completes

### 3. **Webhook Endpoints Created**

```
POST /api/webhooks/elevenlabs/send-signup-link
- Triggered by agent during call
- Sends SMS with signup link
- Returns success confirmation to agent

POST /api/webhooks/elevenlabs/post-call-followup
- Triggered when call ends
- Sends SMS + Email follow-up
- Includes conversation summary

POST /api/webhooks/elevenlabs/conversation-event
- Receives all conversation events
- Can trigger different actions based on event type

GET/POST /api/webhooks/elevenlabs/test
- Test endpoint to verify webhooks are working
```

## Setup Instructions

### Step 1: Expose Your Local Server (ngrok)

Your webhooks need a public URL for ElevenLabs to call.

```bash
# Install ngrok if you haven't
brew install ngrok

# Or download from: https://ngrok.com/download

# Start ngrok tunnel
ngrok http 5001
```

You'll see output like:
```
Forwarding  https://abc123xyz.ngrok.io -> http://localhost:5001
```

Copy that `https://abc123xyz.ngrok.io` URL.

### Step 2: Update Environment Variable

Add to your `.env` file:
```bash
WEBHOOK_URL=https://abc123xyz.ngrok.io
```

Or update the script directly: `/scripts/enable-agent-webhooks.js`

### Step 3: Enable Agent Webhooks

Run the script to configure the ElevenLabs agent with webhook capabilities:

```bash
node scripts/enable-agent-webhooks.js
```

This will:
- ✅ Add `send_signup_link` client tool to the agent
- ✅ Configure webhook URLs
- ✅ Update agent prompt to mention SMS capability
- ✅ Keep ABC closing methodology

### Step 4: Test the Webhooks

Test that webhooks are accessible:
```bash
curl https://abc123xyz.ngrok.io/api/webhooks/elevenlabs/test
```

Should return:
```json
{
  "success": true,
  "message": "Webhook endpoint is working!",
  "timestamp": "2025-01-15T..."
}
```

## How It Works

### During Call Flow:

```
1. Customer: "Can you send me the link?"

2. Agent (AI): "Absolutely! Let me send that to you right now."

3. Agent triggers webhook:
   POST https://your-ngrok-url.ngrok.io/api/webhooks/elevenlabs/send-signup-link
   {
     "phone_number": "+14802555887",
     "customer_name": "Josh",
     "conversation_id": "conv_xxx"
   }

4. Backend sends SMS via Twilio:
   "Hi Josh! Thanks for your interest in Remodelee AI! 🤖

   Start your FREE 14-day trial (no credit card needed):
   https://remodelee.ai/signup

   Questions? Reply to this text or call us back!"

5. Agent (AI): "Done! Just texted you the link. Check your phone!"

6. Customer receives text message immediately
```

### Post-Call Flow:

```
1. Call ends

2. ElevenLabs triggers webhook:
   POST https://your-ngrok-url.ngrok.io/api/webhooks/elevenlabs/conversation-event
   {
     "type": "conversation.ended",
     "conversation_id": "conv_xxx",
     "metadata": {
       "customer_name": "Josh",
       "lead_phone": "+14802555887",
       "lead_email": "josh@example.com"
     }
   }

3. Backend automatically sends:
   - SMS with "Thanks for chatting!" + signup link
   - Email with beautiful HTML template + next steps

4. Customer receives follow-up within seconds
```

## Agent Configuration

The agent now has these capabilities:

### Client Tool: `send_signup_link`

```javascript
{
  type: "client_tool",
  name: "send_signup_link",
  description: "Send the signup link to customer via SMS when they request it",
  parameters: {
    phone_number: "string",
    customer_name: "string"
  },
  url: "https://your-ngrok-url.ngrok.io/api/webhooks/elevenlabs/send-signup-link",
  method: "POST"
}
```

### Updated Prompt

Agent knows it can:
- Offer to text the link
- Actually send the SMS using the tool
- Confirm when sent

Key phrases:
- "Want me to text you the link?"
- "I can send that to your phone right now"
- "Let me text you that"

## Testing the System

### Test 1: Request Demo Call

```bash
curl -X POST http://localhost:5001/api/public/voice-demo \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Customer",
    "phoneNumber":"4802555887",
    "email":"test@example.com"
  }'
```

### Test 2: During Call
Say: "Can you send me the link?"

Agent should:
1. Say "Absolutely! Let me send that to you right now."
2. Send SMS
3. Confirm "Done! Just texted you the link."

### Test 3: Check Logs

```bash
# Watch backend logs
tail -f backend/logs/app.log

# Or check console output for:
📱 Agent requested SMS signup link for Test Customer at +14802555887
✅ Signup link SMS sent to +14802555887 during call
```

### Test 4: Post-Call Follow-Up

After call ends, check that you receive:
- SMS: "Thanks for chatting with our AI agent!"
- Email: HTML email with trial signup

## Webhook Events Reference

### Event: conversation.ended

```json
{
  "type": "conversation.ended",
  "conversation_id": "conv_xxx",
  "call_id": "btcal_xxx",
  "agent_id": "agent_xxx",
  "metadata": {
    "customer_name": "Josh",
    "lead_name": "Josh Breese",
    "lead_phone": "+14802555887",
    "lead_email": "josh@example.com"
  },
  "transcript": [
    { "role": "agent", "text": "Hi, am I speaking with Josh?" },
    { "role": "user", "text": "Yeah" }
  ]
}
```

## Extending the System

### Add More Actions

You can add more client tools for:

**Book Appointment:**
```javascript
{
  type: "client_tool",
  name: "book_appointment",
  description: "Book appointment on customer's calendar",
  url: "https://your-ngrok-url.ngrok.io/api/webhooks/elevenlabs/book-appointment",
  method: "POST"
}
```

**Send Quote:**
```javascript
{
  type: "client_tool",
  name: "send_quote",
  description: "Email a custom quote to the customer",
  url: "https://your-ngrok-url.ngrok.io/api/webhooks/elevenlabs/send-quote",
  method: "POST"
}
```

**Trigger n8n Workflow:**
```javascript
{
  type: "client_tool",
  name: "trigger_workflow",
  description: "Trigger custom n8n workflow",
  url: "https://your-ngrok-url.ngrok.io/api/webhooks/elevenlabs/trigger-workflow",
  method: "POST"
}
```

### Add More Event Handlers

In `elevenLabsWebhookController.js`:

```javascript
case 'user.high_interest':
  // Customer showed high buying intent
  // → Send to sales team immediately
  await notifySalesTeam(event);
  break;

case 'user.objection':
  // Customer raised objection
  // → Log for training
  await logObjection(event);
  break;
```

## Troubleshooting

### Webhooks Not Being Called

1. Check ngrok is running:
   ```bash
   curl https://your-ngrok-url.ngrok.io/api/webhooks/elevenlabs/test
   ```

2. Check webhook URL in agent config:
   ```bash
   # Should show your ngrok URL
   grep WEBHOOK_URL .env
   ```

3. Check ElevenLabs agent configuration includes client_tool

### SMS Not Sending

1. Check Twilio credentials:
   ```bash
   grep TWILIO .env
   ```

2. Check backend logs:
   ```bash
   tail -f backend/logs/app.log | grep SMS
   ```

3. Test Twilio directly:
   ```javascript
   const twilio = require('twilio');
   const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
   client.messages.create({
     to: '+14802555887',
     from: TWILIO_PHONE,
     body: 'Test'
   });
   ```

### Email Not Sending

Check SMTP credentials:
```bash
grep SMTP .env
```

Test email service:
```bash
node -e "
  import emailService from './backend/services/emailService.js';
  emailService.sendEmail({
    to: 'test@example.com',
    subject: 'Test',
    text: 'Test email'
  });
"
```

## Production Deployment

For production, replace ngrok with permanent URL:

1. **Railway/Render/Heroku**: Use their provided URL
2. **Custom domain**: Point to your server
3. **Update .env**: `WEBHOOK_URL=https://your-domain.com`
4. **Re-run**: `node scripts/enable-agent-webhooks.js`

## Next Steps

This is just the beginning! You can extend this to:

- ✅ Book appointments via Google Calendar API
- ✅ Send calendar invites (.ics files)
- ✅ Create CRM records in real-time
- ✅ Trigger n8n workflows for complex automation
- ✅ Send contracts/documents via DocuSign
- ✅ Process payments via Stripe
- ✅ Update inventory systems
- ✅ ANY action your customer needs!

**This is the power of "Voice AI with Arms" - AI that can actually DO things, not just talk.**
