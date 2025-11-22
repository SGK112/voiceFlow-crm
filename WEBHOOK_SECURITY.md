# Webhook Security Setup

## Overview

The ElevenLabs webhooks are now protected with multiple security layers:

1. **Webhook Secret Token** - Bearer token authentication
2. **Timestamp Validation** - Prevents replay attacks
3. **Rate Limiting** - 200 requests per minute per IP
4. **IP Whitelisting** (optional) - Restrict to ElevenLabs IPs only

## Setup Instructions

### 1. Add Webhook Secret Token to Environment

Add this line to your `.env` file:

```bash
# Generate a secure random token (already generated for you):
WEBHOOK_SECRET_TOKEN=1953381d572e2906b7c84b2a566e8abf37d0425a24c6b9215480f3c367086984

# Or generate a new one with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configure ElevenLabs to Send the Token

When setting up webhooks in ElevenLabs dashboard, configure it to send the token in **one of these ways**:

**Option A: Authorization Header (Recommended)**
```
Authorization: Bearer 1953381d572e2906b7c84b2a566e8abf37d0425a24c6b9215480f3c367086984
```

**Option B: Query Parameter**
```
https://your-domain.com/api/elevenlabs-webhook/tool-invocation?token=1953381d572e2906b7c84b2a566e8abf37d0425a24c6b9215480f3c367086984
```

### 3. Configure Webhook URLs in ElevenLabs

In your ElevenLabs agent configuration, set these webhook URLs:

**Tool Invocation Webhook:**
```
https://your-domain.com/api/elevenlabs-webhook/tool-invocation
```

**Post-Call Webhook:**
```
https://your-domain.com/api/elevenlabs-webhook/post-call
```

### 4. Optional: Enable IP Whitelisting

To restrict webhooks to ElevenLabs servers only:

1. Get ElevenLabs webhook IP addresses from their support/docs
2. Update `/backend/middleware/webhookAuth.js`:
   ```javascript
   const ELEVENLABS_IP_WHITELIST = [
     '54.234.123.45',  // Example - replace with actual ElevenLabs IPs
     '52.11.22.33',
   ];
   ```
3. Apply IP verification in the webhook route

## Security Features

### Rate Limiting
- **Limit**: 200 requests per minute per IP
- **Purpose**: Prevents abuse and DDoS attacks
- **Customization**: Adjust in `elevenLabsWebhook.js` line 14

### Timestamp Validation
- **Max Age**: 5 minutes (300 seconds)
- **Purpose**: Prevents replay attacks
- **How it Works**: Rejects requests with timestamps older than 5 minutes
- **Header Required**: `x-webhook-timestamp` (ISO 8601 format)

### Token Authentication
- **Method**: Bearer token or query parameter
- **Algorithm**: Timing-safe comparison (prevents timing attacks)
- **Purpose**: Ensures only authorized sources can trigger webhooks

## Testing Your Webhooks

### Test with cURL

```bash
# Success - with valid token
curl -X POST https://your-domain.com/api/elevenlabs-webhook/tool-invocation \
  -H "Authorization: Bearer 1953381d572e2906b7c84b2a566e8abf37d0425a24c6b9215480f3c367086984" \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "send_sms",
    "tool_parameters": {
      "to": "+1234567890",
      "message": "Test message"
    },
    "call_id": "test_call_001",
    "agent_id": "test_agent"
  }'

# Failure - invalid token
curl -X POST https://your-domain.com/api/elevenlabs-webhook/tool-invocation \
  -H "Authorization: Bearer wrong_token" \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "test"}'

# Expected response: 401 Unauthorized
```

### Test with Postman

1. **Method**: POST
2. **URL**: `https://your-domain.com/api/elevenlabs-webhook/tool-invocation`
3. **Headers**:
   - `Authorization`: `Bearer 1953381d572e2906b7c84b2a566e8abf37d0425a24c6b9215480f3c367086984`
   - `Content-Type`: `application/json`
4. **Body** (JSON):
   ```json
   {
     "tool_name": "send_sms",
     "tool_parameters": {
       "to": "+1234567890",
       "message": "Test from Postman"
     },
     "call_id": "postman_test",
     "agent_id": "test_agent"
   }
   ```

## Monitoring

### Check Webhook Security Logs

The server logs will show webhook authentication attempts:

```
✅ Webhook token verified
✅ Webhook timestamp verified
📞 Tool Invocation Received: ...
```

Or if authentication fails:

```
❌ Webhook rejected: No token provided
❌ Webhook rejected: Invalid token
❌ Webhook rejected: Timestamp too old (350s)
```

### View Logs

```bash
# Backend logs (where webhook security messages appear)
npm run server

# Look for these indicators:
# ✅ = Success
# ❌ = Rejected
# ⚠️  = Warning (unprotected webhook)
```

## Production Recommendations

1. **Always use HTTPS** - Never expose webhook endpoints over HTTP
2. **Set WEBHOOK_SECRET_TOKEN** - Don't leave webhooks unprotected
3. **Monitor logs** - Watch for suspicious authentication failures
4. **Enable IP whitelisting** - If ElevenLabs provides their IPs
5. **Rotate tokens periodically** - Update the secret token every 90 days
6. **Use environment variables** - Never commit tokens to git

## Troubleshooting

### Webhook Returns 401 Unauthorized

**Possible Causes:**
- Missing `Authorization` header
- Incorrect token value
- Token not set in environment variables

**Solution:**
1. Verify token in `.env` file
2. Check ElevenLabs webhook configuration
3. Restart the server after adding environment variables

### Webhook Returns 429 Too Many Requests

**Cause:** Rate limit exceeded (200 requests/minute)

**Solutions:**
- Wait 1 minute and retry
- Increase rate limit in code if legitimate traffic
- Check for infinite loops in your agent configuration

### Webhook Returns 401 - Timestamp Expired

**Cause:** Request timestamp is older than 5 minutes

**Solutions:**
- Ensure ElevenLabs sends current timestamp
- Check system clock synchronization
- Increase max age in code if needed (not recommended)

## Security Best Practices

1. **Keep the token secret** - Never share in public repos, screenshots, or logs
2. **Use HTTPS only** - Tokens sent over HTTP can be intercepted
3. **Implement logging** - Monitor all webhook attempts for security audits
4. **Set up alerts** - Get notified of repeated failed authentication attempts
5. **Regular security reviews** - Audit webhook logs monthly

## Support

If you need help:
1. Check server logs for detailed error messages
2. Verify environment variables are loaded: `console.log(process.env.WEBHOOK_SECRET_TOKEN)`
3. Test with cURL to isolate ElevenLabs configuration issues
4. Contact ElevenLabs support for webhook configuration help
