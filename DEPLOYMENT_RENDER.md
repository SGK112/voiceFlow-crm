# VoiceFlow CRM - Render Deployment Guide

## 🚀 Quick Start

Deploy VoiceFlow CRM to Render in under 30 minutes with automatic SSL, auto-deploys, and zero server management.

## Why Render?

**Advantages over traditional VPS (Digital Ocean, etc.):**
- **No server management** - No SSH, no Nginx, no PM2, no Certbot
- **Automatic SSL** - Free HTTPS certificates with auto-renewal
- **Auto-deploys from GitHub** - Push code, auto-deploy
- **Built-in monitoring** - Logs, metrics, health checks included
- **Simpler** - Just environment variables, no server configuration
- **Cheaper** - Starting at $7/month vs $12/month for Digital Ocean

**Render Services We'll Use:**
1. **Web Service** - Backend API ($7/month for Starter)
2. **Static Site** - Frontend app (Free tier available)

## Prerequisites

- Domain name (e.g., voiceflow.ai)
- MongoDB Atlas account (free tier works)
- Redis Cloud account (free tier works)
- Stripe account (for payments)
- Twilio account (for phone calls)
- ElevenLabs account (for AI agents)
- GitHub account
- Render account (create at https://render.com)

---

## Step 1: Push Code to GitHub

First, ensure your code is in a GitHub repository:

```bash
cd /Users/homepc/voiceflow-crm

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: VoiceFlow CRM ready for production"

# Create repo on GitHub (or use existing)
# Then push:
git remote add origin https://github.com/YOURUSERNAME/voiceflow-crm.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up External Services

### 2.1 MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new project: "VoiceFlow Production"
3. Build a database (free M0 cluster)
4. Create database user with password
5. Add IP address to whitelist: `0.0.0.0/0` (allow from anywhere)
6. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/voiceflow-prod?retryWrites=true&w=majority
   ```

### 2.2 Redis Cloud

1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create free database (30MB is enough to start)
3. Get connection string:
   ```
   redis://default:password@redis-12345.cloud.redislabs.com:12345
   ```

### 2.3 ElevenLabs

1. Go to [ElevenLabs](https://elevenlabs.io/app/settings/api-keys)
2. Create production API key
3. Create 5 conversational AI agents:
   - Lead Generation Agent (save agent ID)
   - Booking Agent
   - Collections Agent
   - Promotions Agent
   - Support Agent

### 2.4 Twilio

1. Go to [Twilio Console](https://console.twilio.com/)
2. Get Account SID and Auth Token
3. Purchase 2-3 phone numbers (~$2/month each)

### 2.5 Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Switch to LIVE mode** (top left toggle)
3. Get API keys (Developers → API Keys)
4. Create products and prices:
   - Starter: $99/month
   - Professional: $299/month
   - Enterprise: $999/month
5. Save price IDs (price_xxxxx)

### 2.6 Email (Gmail SMTP)

1. Enable 2FA on your Gmail account
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
3. Use this app password in environment variables

---

## Step 3: Deploy Backend to Render

### 3.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure service:

**Basic Settings:**
- **Name:** `voiceflow-api`
- **Region:** Choose closest to your users (e.g., Oregon)
- **Branch:** `main`
- **Root Directory:** Leave blank (or set to `backend` if you want)
- **Runtime:** `Node`
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && node server.js`

**Instance Type:**
- **Starter** ($7/month) - Good for 0-100 users
- **Standard** ($25/month) - For 100-1000 users

### 3.2 Add Environment Variables

In Render dashboard, go to **Environment** tab and add all variables:

```bash
# Environment
NODE_ENV=production
PORT=5001

# Database
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/voiceflow-prod?retryWrites=true&w=majority

# Redis Cache
REDIS_URL=redis://default:PASSWORD@redis-XXXXX.cloud.redislabs.com:6379

# JWT Authentication
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=YOUR_64_CHARACTER_RANDOM_STRING
JWT_EXPIRE=7d

# Application URLs (use your Render URL initially)
CLIENT_URL=https://voiceflow-app.onrender.com
API_URL=https://voiceflow-api.onrender.com

# ElevenLabs API
ELEVENLABS_API_KEY=sk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ELEVENLABS_LEAD_GEN_AGENT_ID=agent_XXXXXXXXXXXXXXXXXXXXXXXX
ELEVENLABS_BOOKING_AGENT_ID=agent_XXXXXXXXXXXXXXXXXXXXXXXX
ELEVENLABS_COLLECTIONS_AGENT_ID=agent_XXXXXXXXXXXXXXXXXXXXXXXX
ELEVENLABS_PROMO_AGENT_ID=agent_XXXXXXXXXXXXXXXXXXXXXXXX
ELEVENLABS_SUPPORT_AGENT_ID=agent_XXXXXXXXXXXXXXXXXXXXXXXX

# Twilio
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_auth_token_here

# Stripe (LIVE KEYS - NOT TEST!)
STRIPE_SECRET_KEY=sk_live_replace_with_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_replace_with_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Subscription Price IDs
STRIPE_PRICE_STARTER=price_XXXXXXXXXXXXXXXX
STRIPE_PRICE_PROFESSIONAL=price_XXXXXXXXXXXXXXXX
STRIPE_PRICE_ENTERPRISE=price_XXXXXXXXXXXXXXXX

# Email Configuration
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=app_password_here
EMAIL_FROM=VoiceFlow CRM <noreply@yourdomain.com>

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET=ANOTHER_64_CHARACTER_RANDOM_STRING
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# CORS (update after frontend deployed)
CORS_ORIGINS=https://voiceflow-app.onrender.com,https://app.voiceflow.ai

# Feature Flags
ENABLE_SIGNUP=true
ENABLE_GOOGLE_AUTH=false
ENABLE_TRIAL=true
TRIAL_DAYS=14
```

### 3.3 Deploy Backend

1. Click **Create Web Service**
2. Render will automatically deploy from your GitHub repo
3. Wait 3-5 minutes for build and deployment
4. Your API will be live at: `https://voiceflow-api.onrender.com`

**Test it:**
```bash
curl https://voiceflow-api.onrender.com/health
```

---

## Step 4: Seed Database

After backend is deployed, you need to seed subscription plans:

### Option 1: Use Render Shell (Recommended)

1. In Render dashboard, go to your `voiceflow-api` service
2. Click **Shell** tab
3. Run:
```bash
cd backend
node scripts/seed-plans.js
```

### Option 2: One-Time Job

1. In Render dashboard, click **New +** → **Background Worker**
2. Select same repository
3. Configure:
   - **Name:** `seed-database`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && node scripts/seed-plans.js`
4. After it runs once, delete the worker

---

## Step 5: Deploy Frontend to Render

### 5.1 Create Static Site

1. In Render dashboard, click **New +** → **Static Site**
2. Connect same GitHub repository
3. Configure:

**Basic Settings:**
- **Name:** `voiceflow-app`
- **Branch:** `main`
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

### 5.2 Add Environment Variables for Frontend Build

```bash
VITE_API_URL=https://voiceflow-api.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_replace_with_your_live_publishable_key
```

### 5.3 Deploy Frontend

1. Click **Create Static Site**
2. Wait 2-3 minutes for build
3. Your frontend will be live at: `https://voiceflow-app.onrender.com`

---

## Step 6: Configure Custom Domain

### 6.1 Add Custom Domain to Render

**For Backend (api.voiceflow.ai):**
1. Go to `voiceflow-api` service in Render
2. Click **Settings** → **Custom Domain**
3. Add: `api.voiceflow.ai`
4. Render will show DNS records to add

**For Frontend (app.voiceflow.ai):**
1. Go to `voiceflow-app` static site in Render
2. Click **Settings** → **Custom Domain**
3. Add: `app.voiceflow.ai` and `voiceflow.ai`
4. Render will show DNS records to add

### 6.2 Configure DNS

In your domain registrar (Cloudflare, Namecheap, etc.), add these DNS records:

```
Type    Name    Value                                  TTL
CNAME   api     voiceflow-api.onrender.com             Auto
CNAME   app     voiceflow-app.onrender.com             Auto
CNAME   @       voiceflow-app.onrender.com             Auto
CNAME   www     voiceflow-app.onrender.com             Auto
```

**Note:** Some registrars don't allow CNAME for root (@). In that case:
- Use ANAME or ALIAS if available
- Or use A record pointing to Render's IP (check Render docs)

Wait 5-10 minutes for DNS propagation.

### 6.3 Enable SSL

Render automatically provisions SSL certificates for custom domains. Just wait a few minutes after DNS propagates.

### 6.4 Update Environment Variables

After custom domains are working, update these in Render:

**In Backend (voiceflow-api):**
```bash
CLIENT_URL=https://app.voiceflow.ai
API_URL=https://api.voiceflow.ai
CORS_ORIGINS=https://app.voiceflow.ai,https://voiceflow.ai
```

**In Frontend (voiceflow-app):**
```bash
VITE_API_URL=https://api.voiceflow.ai
```

Then trigger a redeploy for both services.

---

## Step 7: Configure Webhooks

### 7.1 Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.voiceflow.ai/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
4. Copy webhook secret
5. Update `STRIPE_WEBHOOK_SECRET` in Render environment variables
6. Redeploy backend

### 7.2 Twilio Webhooks

For each phone number in Twilio Console:

1. **Voice Configuration:**
   - Voice URL: `https://api.voiceflow.ai/api/webhooks/twilio/voice`
   - Method: POST
   - Status Callback: `https://api.voiceflow.ai/api/webhooks/twilio/status`

---

## Step 8: Test Everything

### 8.1 Basic Tests

```bash
# Test API health
curl https://api.voiceflow.ai/health

# Test frontend
curl https://app.voiceflow.ai
```

### 8.2 User Flow Test

1. Visit `https://app.voiceflow.ai`
2. Click "Start Free Trial"
3. Sign up with email
4. Create an agent
5. Make a test call
6. Check dashboard

### 8.3 Payment Test

1. Use Stripe test card: `4242 4242 4242 4242`
2. Complete checkout
3. Verify webhook received (check Render logs)
4. Check user upgraded in database

---

## Step 9: Monitoring & Logs

### 9.1 View Logs in Render

1. Go to your service in Render dashboard
2. Click **Logs** tab
3. Real-time logs stream here

**Useful filters:**
- Error logs: Search for "Error" or "Failed"
- API requests: Search for "POST" or "GET"

### 9.2 Set Up Alerts

1. In Render service settings
2. Go to **Notifications**
3. Add email for deployment notifications
4. Enable "Notify on failed deploys"

### 9.3 Uptime Monitoring (Optional)

Set up [UptimeRobot](https://uptimerobot.com/) (free):
- Monitor: `https://api.voiceflow.ai/health`
- Check every: 5 minutes
- Alert via: Email

---

## Render-Specific Commands

### Trigger Manual Deploy

```bash
# Via Render Dashboard
Services → voiceflow-api → Manual Deploy → Deploy latest commit

# Or via Render CLI
render deploy voiceflow-api
```

### View Real-Time Logs

```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# Stream logs
render logs voiceflow-api --tail
```

### Shell Access

```bash
# In Render Dashboard
Services → voiceflow-api → Shell

# Or via CLI
render shell voiceflow-api
```

---

## Auto-Deploy Setup

Render automatically deploys when you push to GitHub:

1. Make code changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update feature X"
   git push origin main
   ```
3. Render detects the push and auto-deploys
4. Check deployment progress in Render dashboard

**Disable auto-deploy (if needed):**
- Service Settings → Build & Deploy → Auto-Deploy: Off

---

## Maintenance

### Update Dependencies

```bash
# Locally
npm update

# Commit and push
git add package.json package-lock.json
git commit -m "Update dependencies"
git push origin main

# Render auto-deploys with new dependencies
```

### Database Backups

MongoDB Atlas has automatic backups. Configure in Atlas:
1. Database → Backup
2. Enable Cloud Backup
3. Set retention policy (7 days free tier)

### Restart Service

```bash
# Via Dashboard
Services → voiceflow-api → Manual Deploy → Clear build cache & deploy

# Or suspend/resume
Services → voiceflow-api → Suspend Service
Services → voiceflow-api → Resume Service
```

---

## Troubleshooting

### Build Fails

**Check build logs:**
1. Render Dashboard → Service → Events
2. Click failed deployment
3. View build logs

**Common issues:**
- Missing dependencies: Check package.json
- Build command wrong: Verify in Service Settings
- Environment variables missing: Check Environment tab

### Application Crashes

**Check logs:**
1. Service → Logs
2. Look for error messages

**Common issues:**
- Database connection: Verify MONGO_URI
- Redis connection: Verify REDIS_URL
- Port binding: Render uses PORT environment variable (defaults to 5001)

### Webhooks Not Working

**Stripe webhooks:**
```bash
# Check Render logs for incoming webhook requests
# Verify webhook secret matches
# Test with Stripe CLI locally:
stripe listen --forward-to localhost:5001/api/webhooks/stripe
```

**Twilio webhooks:**
- Check Twilio Console → Monitor → Logs
- Verify webhook URLs are HTTPS
- Test webhook endpoint:
  ```bash
  curl -X POST https://api.voiceflow.ai/api/webhooks/twilio/voice \
    -d "From=+15555555555&To=+16666666666"
  ```

### Performance Issues

**Check metrics:**
1. Render Dashboard → Service → Metrics
2. View CPU, Memory, Response Time

**Solutions:**
- Upgrade instance type (Starter → Standard)
- Enable Redis caching (already configured)
- Add database indexes (already done)

---

## Scaling on Render

### When to Scale

- **0-100 users**: Starter ($7/month)
- **100-500 users**: Standard ($25/month)
- **500-2000 users**: Pro ($85/month)
- **2000+ users**: Consider multiple services or contact Render

### Horizontal Scaling

1. Create multiple instances of backend
2. Render handles load balancing automatically
3. Ensure session store uses Redis (already configured)

### Database Scaling

- **100+ users**: Upgrade MongoDB Atlas to M2 ($9/month)
- **1000+ users**: M10 cluster ($57/month)
- **5000+ users**: M20+ with dedicated cluster

---

## Cost Comparison

### Render (Simple, Managed)

**Monthly Costs:**
- Backend (Starter): $7
- Frontend (Static): Free (or $1/month for custom domain)
- MongoDB Atlas M0: Free
- Redis Cloud (30MB): Free
- **Total: $7-8/month**

### Traditional VPS (More Control)

**Monthly Costs:**
- Digital Ocean Droplet: $12
- MongoDB Atlas M0: Free
- Redis Cloud: Free
- **Total: $12/month**
- **Plus:** Time managing server, SSL, backups, security

**Render wins on:**
- Simplicity
- Time saved
- Automatic SSL
- Auto-deploys
- Built-in monitoring
- Lower initial cost

**VPS wins on:**
- Full control
- Custom configurations
- Potentially cheaper at scale (500+ users)

---

## Production Checklist

After deployment:

- [ ] All environment variables set
- [ ] Database seeded with subscription plans
- [ ] Custom domains configured and SSL active
- [ ] Stripe webhooks configured and tested
- [ ] Twilio webhooks configured and tested
- [ ] Test user signup flow
- [ ] Test payment processing
- [ ] Test phone call flow (inbound/outbound)
- [ ] Verify email notifications working
- [ ] Set up uptime monitoring
- [ ] Enable MongoDB Atlas backups
- [ ] Document any custom configurations
- [ ] Test auto-deploy by pushing a small change

---

## Support Resources

- **Render Documentation**: https://render.com/docs
- **Render Community**: https://community.render.com/
- **MongoDB Support**: https://support.mongodb.com
- **Stripe Support**: https://support.stripe.com
- **Twilio Support**: https://support.twilio.com
- **ElevenLabs Support**: https://elevenlabs.io/support

---

## Success! 🎉

Your VoiceFlow CRM is now live on Render!

**Next Steps:**
1. Monitor logs for first 48 hours
2. Test all features thoroughly
3. Start marketing and user acquisition
4. Collect feedback
5. Iterate and improve

**Render Advantages You Now Have:**
- Zero server management
- Automatic SSL
- Auto-deploys from GitHub
- Built-in monitoring and logs
- Easy scaling with a button click
- Free SSL certificates
- Professional infrastructure

Good luck with your launch! 🚀
