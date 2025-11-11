# Render Environment Variables Setup Guide

## Quick Summary

**REMOVE from Render Dashboard:**
- ❌ `VITE_API_URL` (Frontend only, doesn't work in Node.js)
- ❌ `VITE_GOOGLE_CLIENT_ID` (Frontend only)

**ADD to Render Dashboard:**
- ✅ `API_URL` = `https://voiceflow-crm.onrender.com`
- ✅ `BASE_URL` = `https://voiceflow-crm.onrender.com`
- ✅ `GOOGLE_CLIENT_SECRET` = Your Google OAuth secret
- ✅ `ENCRYPTION_KEY` = Generate with: `openssl rand -hex 32`

---

## Complete Environment Variable Checklist

### Core Application (Required)

```bash
NODE_ENV=production
PORT=5000                    # Auto-set by Render
CLIENT_URL=https://voiceflow-crm.onrender.com
API_URL=https://voiceflow-crm.onrender.com
BASE_URL=https://voiceflow-crm.onrender.com
```

### Database (Required)

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voiceflow-crm?retryWrites=true&w=majority
```

### Security (Required)

```bash
JWT_SECRET=your_jwt_secret_here        # Generate: openssl rand -base64 32
JWT_EXPIRE=30d
ENCRYPTION_KEY=your_32_byte_hex        # Generate: openssl rand -hex 32
SESSION_SECRET=your_session_secret     # Generate: openssl rand -base64 32
```

### Google OAuth (Required for Google Sign-In)

```bash
GOOGLE_CLIENT_ID=710258787879-qmvg6o96r0k3pc6r47mutesavrhkttik.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
```

### Email - SMTP (Required)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password   # NOT your Gmail password!
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=Remodely.ai
```

**How to get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Use that 16-character password here

### Twilio (Required for Phone Features)

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### ElevenLabs (Required for Voice AI)

```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_PHONE_NUMBER_ID=your_phone_number_id

# Agent IDs for different use cases
ELEVENLABS_LEAD_GEN_AGENT_ID=agent_xxxxx
ELEVENLABS_BOOKING_AGENT_ID=agent_xxxxx
ELEVENLABS_COLLECTIONS_AGENT_ID=agent_xxxxx
ELEVENLABS_PROMO_AGENT_ID=agent_xxxxx
ELEVENLABS_SUPPORT_AGENT_ID=agent_xxxxx
```

### Stripe (Required for Payments)

```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Price IDs from Stripe Dashboard
STRIPE_STARTER_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PROFESSIONAL_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxx
```

### AI Providers (Optional - Choose ONE)

```bash
# OpenAI (GPT-4, GPT-3.5)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# OR Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# OR Google AI (Gemini)
GOOGLE_AI_API_KEY=xxxxxxxxxxxxx
```

### Optional Services

```bash
# Redis (for caching)
REDIS_URL=redis://username:password@hostname:port

# OR Redis separate config
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Slack notifications
SLACK_WEBHOOK=https://hooks.slack.com/services/xxx/yyy/zzz

# N8N automation
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/xxx
N8N_API_KEY=your_n8n_api_key

# Alternative: Gmail OAuth (instead of SMTP)
GMAIL_CLIENT_ID=your_gmail_oauth_client_id
GMAIL_CLIENT_SECRET=your_gmail_oauth_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
GMAIL_USER=your@gmail.com
```

---

## Frontend Environment Variables

**These are ONLY used during build (`npm run build`):**

```bash
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=710258787879-qmvg6o96r0k3pc6r47mutesavrhkttik.apps.googleusercontent.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
```

**Important:**
- These get embedded into JavaScript during build
- They are NOT available to Node.js backend
- They are visible to users in browser (don't put secrets here!)

---

## How to Set Variables in Render

### Method 1: Render Dashboard (Recommended)
1. Go to https://dashboard.render.com
2. Click your service "voiceflow-crm"
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add key and value
6. Click "Save Changes"

### Method 2: Render Blueprint (render.yaml)
Already configured! Variables with `sync: false` need to be set manually in dashboard.

---

## Environment Variable Priority

Render uses this order:
1. **Render Dashboard** (highest priority)
2. **render.yaml file**
3. **.env file** (not used in production)

**Best Practice:** Use render.yaml for defaults, Render Dashboard for secrets.

---

## Common Mistakes

### ❌ Wrong: Using VITE_ in Backend
```javascript
// backend/server.js
const apiUrl = process.env.VITE_API_URL; // ❌ UNDEFINED!
```

### ✅ Correct: Regular env vars in Backend
```javascript
// backend/server.js
const apiUrl = process.env.API_URL; // ✅ Works!
```

### ❌ Wrong: Secrets in VITE_ vars
```bash
VITE_STRIPE_SECRET_KEY=sk_live_xxx  # ❌ Exposed to users!
```

### ✅ Correct: Secrets in regular vars
```bash
STRIPE_SECRET_KEY=sk_live_xxx  # ✅ Server-side only
```

---

## Testing Environment Variables

### Test Backend Variables
```bash
# SSH into Render shell
render shell voiceflow-crm

# Check all variables
printenv | grep -E "(MONGO|STRIPE|TWILIO|ELEVEN)"

# Test specific variable
echo $MONGODB_URI
echo $STRIPE_SECRET_KEY
```

### Test Frontend Build Variables
```bash
# Local test
cd frontend
cat .env
npm run build

# Check compiled output
cat dist/assets/index-*.js | grep "VITE"
```

---

## Deployment Checklist

Before deploying, verify these are set:

**Critical (App won't start without these):**
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET`
- [ ] `CLIENT_URL`
- [ ] `API_URL`

**Important (Features won't work):**
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- [ ] `STRIPE_SECRET_KEY` + all price IDs
- [ ] `ELEVENLABS_API_KEY`
- [ ] `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN`
- [ ] `SMTP_USER` + `SMTP_PASSWORD`

**Optional (Nice to have):**
- [ ] `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- [ ] `CLOUDINARY_*` (for file uploads)
- [ ] `REDIS_URL` (for caching)
- [ ] `SLACK_WEBHOOK` (for notifications)

---

## Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Check:** `MONGODB_URI` is set correctly
```bash
render shell voiceflow-crm
echo $MONGODB_URI
```

### Issue: "Stripe payments not working"
**Check:** All Stripe variables are set
```bash
echo $STRIPE_SECRET_KEY
echo $STRIPE_WEBHOOK_SECRET
echo $STRIPE_STARTER_PRICE_ID
```

### Issue: "Google OAuth fails"
**Check:** Both client ID and secret are set
```bash
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
```

### Issue: "Frontend shows undefined API URL"
**Check:** `VITE_API_URL` is set during build
```bash
# In Render build logs, look for:
VITE_API_URL=/api npm run build
```

---

## Security Best Practices

1. **Never commit secrets to Git**
   - Use `.env.example` with dummy values
   - Add `.env` to `.gitignore`

2. **Rotate secrets regularly**
   - JWT_SECRET every 90 days
   - API keys every 6 months

3. **Use different secrets per environment**
   - Development: `sk_test_xxx`
   - Production: `sk_live_xxx`

4. **Limit API key permissions**
   - Stripe: Only grant necessary permissions
   - Google: Only request needed OAuth scopes

5. **Monitor API usage**
   - Set up alerts for unusual activity
   - Track API key usage in dashboards

---

## Quick Setup Script

Run this to generate all security keys at once:

```bash
#!/bin/bash
echo "=== Generating Security Keys ==="
echo ""
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "SESSION_SECRET=$(openssl rand -base64 32)"
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"
echo "COOKIE_SECRET=$(openssl rand -base64 32)"
echo ""
echo "Save these in Render Dashboard!"
```

---

## Support

If you need help:
1. Check Render logs: `render logs voiceflow-crm`
2. Check environment: `render shell voiceflow-crm` → `printenv`
3. Test locally first with same variable values
4. Contact Render support if issue persists

---

## References

- [Render Environment Variables Docs](https://render.com/docs/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Node.js process.env](https://nodejs.org/api/process.html#processenv)
