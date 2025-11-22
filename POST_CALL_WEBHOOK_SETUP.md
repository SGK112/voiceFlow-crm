# 📞 Post-Call Webhook Setup Guide

## The Solution: Post-Call Automation

Since ElevenLabs agents cannot invoke tools programmatically during batch calls, we use a **post-call webhook** instead. When the call ends, ElevenLabs automatically triggers our webhook which then:

✅ Sends SMS with signup link
✅ Sends calendar invite email
✅ Sends lead notification to team

## How It Works

```
1. Agent calls customer
2. Has normal conversation (no tools needed!)
3. Call ends
4. ElevenLabs triggers POST-CALL webhook
5. Our backend automatically:
   → Sends SMS via Twilio
   → Sends calendar invite via email
   → Sends lead notification
```

## Setup Instructions

### Step 1: Get Your Webhook URL

Your ngrok tunnel URL: `https://f66af302a875.ngrok-free.app`

Post-call webhook endpoint:
```
https://f66af302a875.ngrok-free.app/api/elevenlabs-webhook/post-call
```

### Step 2: Configure in ElevenLabs Dashboard

1. **Go to ElevenLabs Dashboard**
   https://elevenlabs.io/app/conversational-ai

2. **Navigate to Webhooks Settings**
   - Click on your workspace settings or agent settings
   - Look for "Webhooks" or "Post-Call Webhooks" section

3. **Add Post-Call Webhook**
   ```
   Name: Remodely Post-Call Automation
   Event Type: post_call_transcription (or post_call)
   URL: https://f66af302a875.ngrok-free.app/api/elevenlabs-webhook/post-call
   Method: POST
   ```

4. **Save and Test**
   - Save the webhook configuration
   - Make a test call
   - Check backend logs for webhook trigger

### Step 3: Test the Flow

Run the simple test call:

```bash
node call-josh-simple.js
```

This will:
1. Create an agent (no tools needed)
2. Make a call to Josh
3. Agent has friendly conversation
4. Call ends (agent just stops talking, or hits max duration)
5. ElevenLabs triggers post-call webhook
6. Backend automatically sends:
   - SMS: "Hi Josh! Create your account: https://Remodely.ai/signup..."
   - Email to joshb@surprisegranite.com (calendar invite)
   - Email to help.remodely@gmail.com (lead notification)

### Step 4: Monitor the Process

Watch the backend logs:

```
📞 Post-Call Webhook Received:
   Call ID: xxx
   Conversation ID: xxx
   Agent ID: xxx

📋 Processing appointment: {...}

📱 Sending SMS...
✅ SMS sent successfully

📅 Sending calendar invite...
✅ Calendar invite sent successfully

📧 Sending lead notification...
✅ Lead notification sent successfully

✅ Post-call processing complete!
```

## Webhook Payload

ElevenLabs sends this payload to your webhook:

```json
{
  "conversation_id": "conv_xxx",
  "call_id": "call_xxx",
  "agent_id": "agent_xxx",
  "transcript": "Full conversation transcript...",
  "analysis": {
    "summary": "...",
    "sentiment": "positive"
  },
  "metadata": {
    "duration": 45,
    "ended_by": "agent"
  }
}
```

Your webhook processes this and triggers the automation.

## Current Configuration

The webhook is configured to send:

### SMS (via Twilio)
```
Hi Josh B! Thanks for choosing Remodely for your kitchen remodel.
Create your account here: https://Remodely.ai/signup
See you Monday at 12:00 PM! - Sarah from Remodely
```

### Calendar Invite (via Email)
- **To**: joshb@surprisegranite.com
- **Subject**: Appointment Confirmed: Kitchen Remodeling Consultation with Remodely
- **Includes**: iCal attachment for adding to calendar
- **Details**: Service, date, time, location, signup link

### Lead Notification (via Email)
- **To**: help.remodely@gmail.com
- **Subject**: 🎉 New Lead: Josh B - Appointment Monday 12:00 PM
- **Includes**:
  - Customer info (name, phone, email)
  - Appointment details
  - Actions completed (SMS, calendar)
  - Next steps for team

## Troubleshooting

### Webhook Not Triggered

1. **Check ElevenLabs Dashboard**
   - Go to webhook settings
   - Check webhook status/logs
   - Verify URL is correct

2. **Verify ngrok is Running**
   ```bash
   curl http://localhost:4040/api/tunnels
   ```

3. **Test Webhook Manually**
   ```bash
   curl -X POST https://your-ngrok-url/api/elevenlabs-webhook/post-call \
     -H "Content-Type: application/json" \
     -d '{
       "conversation_id": "test",
       "call_id": "test",
       "agent_id": "test"
     }'
   ```

### SMS Not Sending

- Check Twilio credentials in .env
- Verify phone number format (+14802555887)
- Check backend logs for Twilio errors

### Email Not Sending

- Check SMTP credentials in .env
- For Gmail, use App Password
- Check spam folder

### Call Not Ending

This is a known issue with ElevenLabs batch calls. The agent cannot programmatically end calls. Options:

1. **Set max duration**: Agent auto-ends after timeout (currently 90 seconds)
2. **Agent stops talking**: Sometimes triggers end-of-call
3. **Customer hangs up**: Most reliable method
4. **Dashboard configuration**: May have "silence detection" settings

## Production Deployment

For production, you'll need:

1. **Permanent webhook URL** (not ngrok)
   - Deploy backend to Render/Heroku/etc
   - Use production URL in webhook config

2. **Google Calendar API** (optional)
   - Set up service account
   - Add credentials to .env as `GOOGLE_CALENDAR_CREDENTIALS`
   - Will create actual calendar events instead of email invites

3. **Dynamic appointment data**
   - Currently hardcoded for Josh
   - Extract from conversation transcript or metadata
   - Use AI to parse appointment details from call

## Alternative: Test Without Post-Call Webhook

If you can't configure the webhook in the dashboard, you can manually trigger it:

```bash
# After call ends, manually trigger post-call processing
curl -X POST http://localhost:5001/api/elevenlabs-webhook/post-call \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "manual_test",
    "call_id": "manual_test",
    "agent_id": "agent_4001kaj01ms5ewrvvjm0hq19ms6b"
  }'
```

This will send the SMS, calendar invite, and lead notification without waiting for ElevenLabs to trigger it.

---

**Status**: Backend ready, waiting for ElevenLabs webhook configuration
**Next Step**: Configure post-call webhook in ElevenLabs dashboard
**Test**: Call Josh → Conversation → Call ends → Automation triggers
