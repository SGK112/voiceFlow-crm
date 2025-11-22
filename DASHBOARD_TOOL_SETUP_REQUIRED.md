# ⚠️ CRITICAL: Tools Must Be Configured in ElevenLabs Dashboard

## The Problem

**ElevenLabs batch calls CANNOT invoke tools programmatically via the SDK.**

The `clientTools` property in the SDK only works for:
- WebSocket conversations
- Browser-based chat interfaces
- NOT for phone calls via `batchCalls.create()`

## The ONLY Solution for Mid-Call SMS/Email

You MUST configure tools in the ElevenLabs dashboard. There is no programmatic alternative for batch calls.

## Step-by-Step Dashboard Configuration

### Step 1: Access ElevenLabs Dashboard

1. Go to: https://elevenlabs.io/app/conversational-ai
2. Log in to your account
3. Navigate to **"Tools"** or **"Integrations"** section

### Step 2: Create "Send SMS" Tool

```
Tool Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: send_sms

Description:
Send an SMS text message to the customer's phone. Use this when
the customer asks you to "text me", "send a text", "send me a
message", or mentions wanting information via SMS.

Type: Webhook / Server Tool

Webhook URL:
https://f66af302a875.ngrok-free.app/api/elevenlabs-webhook/tool-invocation

HTTP Method: POST

Parameters:
┌─────────────────────────────────────────────────┐
│ Parameter: to                                    │
│ Type: string                                     │
│ Required: Yes                                    │
│ Description: Customer's phone number in E.164    │
│              format (e.g., +14802555887)         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Parameter: message                               │
│ Type: string                                     │
│ Required: Yes                                    │
│ Description: The SMS message content to send     │
└─────────────────────────────────────────────────┘

Trigger Keywords (if supported):
- text
- text me
- send a text
- send me a message
- SMS

Wait for Response: Yes ✓
(Agent will wait for webhook to return before continuing)
```

### Step 3: Create "Send Email" Tool

```
Tool Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: send_email

Description:
Send an email to the customer. Use this when the customer asks
you to "email me", "send an email", "send me the details via
email", or requests information by email.

Type: Webhook / Server Tool

Webhook URL:
https://f66af302a875.ngrok-free.app/api/elevenlabs-webhook/tool-invocation

HTTP Method: POST

Parameters:
┌─────────────────────────────────────────────────┐
│ Parameter: to                                    │
│ Type: string                                     │
│ Required: Yes                                    │
│ Description: Customer's email address            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Parameter: subject                               │
│ Type: string                                     │
│ Required: Yes                                    │
│ Description: Email subject line                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Parameter: body                                  │
│ Type: string                                     │
│ Required: Yes                                    │
│ Description: Email message content               │
└─────────────────────────────────────────────────┘

Trigger Keywords (if supported):
- email
- email me
- send an email
- send me an email

Wait for Response: Yes ✓
```

### Step 4: Create "Send Calendar Invite" Tool

```
Tool Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: send_calendar_invite

Description:
Send a calendar invite to the customer's email. Use when customer
asks for a "calendar invite", "add to calendar", "send calendar",
or wants the appointment in their calendar.

Type: Webhook / Server Tool

Webhook URL:
https://f66af302a875.ngrok-free.app/api/elevenlabs-webhook/tool-invocation

HTTP Method: POST

Parameters:
┌─────────────────────────────────────────────────┐
│ Parameter: email                                 │
│ Type: string                                     │
│ Required: Yes                                    │
│ Description: Customer's email for calendar       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Parameter: appointment_date                      │
│ Type: string                                     │
│ Required: Yes                                    │
│ Description: Appointment date (YYYY-MM-DD)       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Parameter: appointment_time                      │
│ Type: string                                     │
│ Required: Yes                                    │
│ Description: Appointment time (HH:MM AM/PM)      │
└─────────────────────────────────────────────────┘

Trigger Keywords (if supported):
- calendar
- calendar invite
- add to calendar
- send calendar

Wait for Response: Yes ✓
```

### Step 5: Create Agent with Tools Attached

1. **Create New Agent** in dashboard
   - Name: "Remodely Appointment Coordinator"
   - Voice: Sarah (EXAVITQu4vr4xnSDxMaL)

2. **Add Tools to Agent**
   - Go to agent's "Tools" tab
   - Add: `send_sms`
   - Add: `send_email`
   - Add: `send_calendar_invite`

3. **Configure Agent Prompt**
   ```
   You are Sarah from Remodely, a professional appointment coordinator.

   CUSTOMER: Josh B (480-255-5887, joshb@surprisegranite.com)
   APPOINTMENT: Monday at 12:00 PM - Kitchen Remodeling

   TOOLS YOU HAVE ACCESS TO:
   - send_sms: Send SMS messages
   - send_email: Send emails
   - send_calendar_invite: Send calendar invites

   CONVERSATION FLOW:

   1. Greet customer warmly
   2. Confirm appointment details
   3. LISTEN for customer requests:
      - If they say "text me" or "send a text":
        → USE send_sms tool immediately
        → Parameters: to="+14802555887", message="[appointment details]"

      - If they say "email me" or "send email":
        → USE send_email tool immediately
        → Parameters: to="joshb@surprisegranite.com", subject="...", body="..."

      - If they say "calendar" or "calendar invite":
        → USE send_calendar_invite tool immediately
        → Parameters: email="joshb@surprisegranite.com", date="2025-11-24", time="12:00 PM"

   4. After using a tool, confirm: "I've just sent that to you!"

   CRITICAL: Actually INVOKE the tools when asked - don't just say you will!
   ```

4. **Save Agent and Copy ID**
   - Save the agent configuration
   - Copy the Agent ID (looks like: `agent_xxxxxxxxxxxxx`)

### Step 6: Use the Dashboard Agent

Add to your `.env` file:
```
ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxxx
```

Then use the dashboard agent script:
```bash
node call-with-dashboard-agent.js
```

## Testing the Flow

1. **Make Call**
   ```bash
   node call-with-dashboard-agent.js
   ```

2. **Answer Phone**
   - Listen to Sarah greet you
   - Confirm appointment

3. **Say Keywords**
   - "Can you text me the details?"
   - "Send me an email with that info"
   - "Can you send a calendar invite?"

4. **Agent Response**
   - Sarah: "Absolutely! I'm sending you a text right now..."
   - **Agent invokes send_sms tool**
   - **Your webhook receives request**
   - **SMS actually sends via Twilio**
   - **Webhook returns success**
   - Sarah: "The text has been sent!"

5. **Verify**
   - Check phone for SMS (should arrive within seconds)
   - Check email inbox
   - Check backend logs:
     ```
     📞 Tool Invocation Received:
        Tool: send_sms
        Parameters: { to: '+14802555887', message: '...' }
     ✅ SMS sent successfully
     ```

## Why This is the ONLY Way

ElevenLabs architecture for batch calls:

```
❌ WRONG (doesn't work):
SDK → Create agent with clientTools → Make call → Tools work
(clientTools only works for WebSocket conversations)

✅ CORRECT (only way that works):
Dashboard → Create tools → Attach to agent → SDK makes call → Tools work
```

## Current Limitations

### What Works:
✅ Post-call webhooks (after call ends)
✅ Call status updates
✅ Conversation transcripts

### What DOESN'T Work Without Dashboard:
❌ Mid-call tool invocations
❌ Real-time SMS during active call
❌ Real-time email during active call
❌ Agent-controlled call termination

### Workaround We Implemented:
✅ Post-call automation (sends everything after call ends)
✅ Works reliably
✅ No dashboard configuration needed
✅ SMS, email, and calendar sent within seconds of call ending

## Production Deployment Checklist

- [ ] Configure tools in ElevenLabs dashboard
- [ ] Create agent with tools attached in dashboard
- [ ] Set up permanent webhook URL (not ngrok)
- [ ] Add webhook URL to tool configurations
- [ ] Configure post-call webhook for backup automation
- [ ] Test end-to-end with real phone call
- [ ] Verify SMS arrives during call (not after)
- [ ] Verify email arrives during call (not after)
- [ ] Monitor webhook logs for errors

## Support Resources

- ElevenLabs Dashboard: https://elevenlabs.io/app/conversational-ai
- Tools Documentation: https://elevenlabs.io/docs/conversational-ai/customization/tools
- Webhook Guide: https://elevenlabs.io/docs/conversational-ai/customization/tools/server-tools

---

**Bottom Line**: Without dashboard configuration, tools cannot be invoked during batch calls. The post-call automation we built is the best alternative that doesn't require dashboard access.

If you have dashboard access, follow the steps above to enable true mid-call SMS/email/calendar invocations based on customer keywords.
