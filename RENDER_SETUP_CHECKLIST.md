# Render Setup Checklist - VoiceFlow CRM

Service ID: `srv-d47fel2li9vc738mgcl0`

## Current Status

- [x] Render service created
- [ ] Environment variables configured
- [ ] Database seeded
- [ ] Frontend deployed
- [ ] Custom domain configured
- [ ] Webhooks configured
- [ ] Testing completed

---

## Step 1: Configure Environment Variables

Go to your Render service: https://dashboard.render.com/web/srv-d47fel2li9vc738mgcl0

Click **Environment** tab and add these variables:

### Database & Cache (Required)

```bash
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/voiceflow-prod?retryWrites=true&w=majority
REDIS_URL=redis://default:PASSWORD@redis-xxxxx.cloud.redislabs.com:6379
```

**Where to get:**
- MongoDB: https://cloud.mongodb.com/ → Database → Connect
- Redis: https://redis.com/try-free/ → Database → Configuration

### ElevenLabs (Required)

```bash
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_LEAD_GEN_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_BOOKING_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_COLLECTIONS_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_PROMO_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_SUPPORT_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxxx
```

**Where to get:**
- API Key: https://elevenlabs.io/app/settings/api-keys
- Agent IDs: https://elevenlabs.io/app/conversational-ai (create 5 agents)

### Twilio (Required)

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
```

**Where to get:**
- Console: https://console.twilio.com/
- Account SID and Auth Token are on the dashboard

### Stripe LIVE Keys (Required)

```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxxxxxxxxxx
```

**Where to get:**
- API Keys: https://dashboard.stripe.com/apikeys (switch to LIVE mode!)
- Create Products: Dashboard → Products → Add Product
  - Starter: $99/month recurring
  - Professional: $299/month recurring
  - Enterprise: $999/month recurring
- Copy the price IDs (price_xxxxx) for each
- Webhook secret: Will create after deployment

### Email (Required)

```bash
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=VoiceFlow CRM <noreply@yourdomain.com>
```

**Where to get Gmail App Password:**
1. Enable 2FA on Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Generate new app password for "Mail"
4. Use that 16-character password

### Auto-Generated (Already Set)

These are already configured by render.yaml:
- ✅ NODE_ENV=production
- ✅ PORT=5001
- ✅ JWT_SECRET (auto-generated)
- ✅ SESSION_SECRET (auto-generated)
- ✅ All security settings
- ✅ Feature flags

After adding all variables, click **Save Changes**. Render will automatically redeploy.

---

## Step 2: Wait for Deployment

1. Go to **Logs** tab
2. Watch for:
   ```
   ✅ MongoDB Connected
   ✅ Redis Connected
   🚀 Server running on port 5001
   ```
3. Wait until status shows **Live** (usually 2-3 minutes)

---

## Step 3: Seed Database

Once deployed successfully:

1. Go to your service: https://dashboard.render.com/web/srv-d47fel2li9vc738mgcl0
2. Click **Shell** tab (on the right side)
3. Run these commands:

```bash
cd backend
node scripts/seed-plans.js
```

Expected output:
```
✅ MongoDB Connected
🌱 Seeding subscription plans...
🗑️  Cleared existing plans
✅ Created 4 subscription plans:
   - Free Trial: $0/month (50 minutes)
   - Starter: $99/month (200 minutes)
   - Professional: $299/month (1000 minutes)
   - Enterprise: $999/month (5000 minutes)

✨ Database seeding completed successfully!
```

---

## Step 4: Test Backend API

Your backend should be live at: **https://srv-d47fel2li9vc738mgcl0.onrender.com**

Test it:

```bash
# Health check
curl https://srv-d47fel2li9vc738mgcl0.onrender.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## Step 5: Deploy Frontend

Now deploy the frontend:

1. Go to Render Dashboard: https://dashboard.render.com/
2. Click **New +** → **Static Site**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `voiceflow-app`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

5. Add Environment Variables (for frontend build):
   ```bash
   VITE_API_URL=https://srv-d47fel2li9vc738mgcl0.onrender.com
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
   ```

6. Click **Create Static Site**

7. Wait 2-3 minutes for build

Your frontend will be at: **https://voiceflow-app.onrender.com**

---

## Step 6: Update Backend CORS

After frontend is deployed, update these environment variables in backend:

```bash
CLIENT_URL=https://voiceflow-app.onrender.com
CORS_ORIGINS=https://voiceflow-app.onrender.com
```

Click **Save Changes** to redeploy.

---

## Step 7: Configure Webhooks

### Stripe Webhooks

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Endpoint URL: `https://srv-d47fel2li9vc738mgcl0.onrender.com/api/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to Render environment:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```
8. Save and redeploy

### Twilio Webhooks

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. For each phone number, click to configure
3. Under **Voice Configuration**:
   - **A CALL COMES IN:** Webhook
   - URL: `https://srv-d47fel2li9vc738mgcl0.onrender.com/api/webhooks/twilio/voice`
   - HTTP: POST
   - **CALL STATUS CHANGES:** Webhook
   - URL: `https://srv-d47fel2li9vc738mgcl0.onrender.com/api/webhooks/twilio/status`
   - HTTP: POST
4. Click **Save**

---

## Step 8: Test Complete System

### Test User Signup

1. Visit your frontend: https://voiceflow-app.onrender.com
2. Click "Start Free Trial"
3. Sign up with email
4. Verify email received
5. Log in to dashboard

### Test Agent Creation

1. Create a new agent
2. Configure with ElevenLabs agent ID
3. Save

### Test Payment Flow

1. Click "Upgrade Plan"
2. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
3. Complete checkout
4. Verify subscription upgraded

### Test Phone Call (if you have Twilio number)

1. Call your Twilio number
2. Should connect to ElevenLabs agent
3. Check call log in dashboard

---

## Step 9: Add Custom Domain (Optional)

### For Backend API

1. In Render, go to your backend service
2. Settings → Custom Domain
3. Add: `api.yourdomain.com`
4. Render will show DNS records
5. Add CNAME record in your domain registrar:
   ```
   Type: CNAME
   Name: api
   Value: srv-d47fel2li9vc738mgcl0.onrender.com
   TTL: Auto
   ```
6. Wait for DNS propagation (5-10 minutes)
7. Render auto-provisions SSL certificate

### For Frontend

1. In Render, go to your frontend static site
2. Settings → Custom Domain
3. Add: `app.yourdomain.com`
4. Add CNAME record in domain registrar
5. Wait for SSL provisioning

### Update Environment Variables

After custom domains work, update in backend:

```bash
CLIENT_URL=https://app.yourdomain.com
API_URL=https://api.yourdomain.com
CORS_ORIGINS=https://app.yourdomain.com,https://yourdomain.com
```

And in frontend:

```bash
VITE_API_URL=https://api.yourdomain.com
```

Update Stripe webhook URL to: `https://api.yourdomain.com/api/webhooks/stripe`

Update Twilio webhooks to: `https://api.yourdomain.com/api/webhooks/twilio/voice`

---

## Monitoring & Logs

### View Logs

Go to: https://dashboard.render.com/web/srv-d47fel2li9vc738mgcl0

Click **Logs** tab

Search for:
- Errors: Type "error" in search
- API calls: Type "POST" or "GET"
- Webhooks: Type "webhook"

### Check Performance

Click **Metrics** tab to see:
- CPU usage
- Memory usage
- Response times
- HTTP status codes

### Set Up Alerts

1. Settings → Notifications
2. Add your email
3. Enable "Deploy failed" notifications

---

## Troubleshooting

### Build Failed

1. Check **Events** tab for error details
2. Common issues:
   - Missing `package.json` in backend folder
   - Wrong Node version (need 18+)
   - Build command incorrect

### App Crashes

1. Check **Logs** for error messages
2. Common issues:
   - Database connection failed (check MONGO_URI)
   - Redis connection failed (check REDIS_URL)
   - Missing environment variables

### Webhooks Not Working

**Stripe:**
- Check webhook URL is HTTPS (not HTTP)
- Verify webhook secret matches in Render
- Check Render logs for incoming requests

**Twilio:**
- Check Twilio → Monitor → Logs → Errors
- Verify webhook URLs are set on phone numbers
- Test with: `curl -X POST https://srv-d47fel2li9vc738mgcl0.onrender.com/api/webhooks/twilio/voice`

---

## Cost Summary

**Monthly Costs:**
- Backend (Starter): $7/month
- Frontend (Static): Free
- MongoDB Atlas (M0): Free
- Redis Cloud (30MB): Free
- **Total: $7/month**

Plus usage costs:
- Twilio: ~$2/month per phone number + usage
- ElevenLabs: ~$0.10/minute
- Stripe: 2.9% + $0.30 per transaction

---

## Next Steps After Launch

- [ ] Monitor logs for 48 hours
- [ ] Test all user flows thoroughly
- [ ] Verify all webhooks firing correctly
- [ ] Check email delivery working
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Enable MongoDB Atlas backups
- [ ] Document any custom configurations
- [ ] Start marketing and user acquisition!

---

## Quick Commands

**View Logs:**
```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# Stream logs
render logs srv-d47fel2li9vc738mgcl0 --tail
```

**Trigger Deploy:**
```bash
# Push to GitHub (auto-deploys)
git push origin main

# Or in Render Dashboard
Manual Deploy → Deploy latest commit
```

**Access Shell:**
```bash
render shell srv-d47fel2li9vc738mgcl0

# Or in Dashboard
Click "Shell" tab
```

---

## Support Resources

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com/
- **Your Service:** https://dashboard.render.com/web/srv-d47fel2li9vc738mgcl0
- **Full Guide:** See DEPLOYMENT_RENDER.md

---

## Success Checklist

- [ ] All environment variables set
- [ ] Backend deployed and showing "Live"
- [ ] Database seeded successfully
- [ ] Health check returns 200 OK
- [ ] Frontend deployed and accessible
- [ ] User can sign up and log in
- [ ] Stripe checkout works
- [ ] Stripe webhook configured
- [ ] Twilio webhooks configured
- [ ] Email notifications working
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates active
- [ ] Monitoring alerts set up

---

## You're Almost There! 🚀

Your service `srv-d47fel2li9vc738mgcl0` is ready. Just complete the steps above and you'll be live in production!

**Current URLs:**
- Backend: https://srv-d47fel2li9vc738mgcl0.onrender.com
- Frontend: (Deploy next)

Good luck! 🎉
