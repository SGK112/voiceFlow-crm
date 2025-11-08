# VoiceFlow CRM - Render Quick Start (5 Minutes)

Get your VoiceFlow CRM live in production in just 5 minutes using Render's one-click deployment.

## What You Need

1. GitHub account
2. Render account (free to create at https://render.com)
3. MongoDB Atlas account (free tier)
4. Redis Cloud account (free tier)
5. Your API credentials (ElevenLabs, Twilio, Stripe)

---

## Step 1: Push to GitHub (2 minutes)

```bash
cd /Users/homepc/voiceflow-crm

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "VoiceFlow CRM - Ready for production"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOURUSERNAME/voiceflow-crm.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Render (2 minutes)

### Option A: One-Click Blueprint Deployment (Easiest)

1. Go to https://dashboard.render.com/
2. Click **New** → **Blueprint**
3. Connect your GitHub repository: `YOURUSERNAME/voiceflow-crm`
4. Render will detect the `render.yaml` file
5. Click **Apply** - This creates BOTH backend and frontend automatically!

### Option B: Manual Deployment

If Blueprint doesn't work, deploy manually:

**Backend:**
1. New → Web Service
2. Connect GitHub repo
3. Name: `voiceflow-api`
4. Root Directory: `backend`
5. Build: `npm install`
6. Start: `node server.js`
7. Plan: Starter ($7/month)

**Frontend:**
1. New → Static Site
2. Connect same repo
3. Name: `voiceflow-app`
4. Root Directory: `frontend`
5. Build: `npm install && npm run build`
6. Publish: `dist`

---

## Step 3: Add Environment Variables (1 minute)

In Render Dashboard → voiceflow-api → Environment:

**Required (Must Set):**
```bash
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/voiceflow-prod
REDIS_URL=redis://default:pass@redis-xxxxx.cloud.redislabs.com:6379
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxx
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your_app_password
```

For frontend (voiceflow-app → Environment):
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
```

**Auto-Generated (Already Set by render.yaml):**
- JWT_SECRET
- SESSION_SECRET
- All other settings

Click **Save Changes** - Render will auto-redeploy.

---

## Step 4: Seed Database

After backend deploys successfully:

1. Go to voiceflow-api service in Render
2. Click **Shell** tab (right side)
3. Run:
```bash
cd backend
node scripts/seed-plans.js
```

You should see:
```
✅ Created 4 subscription plans:
   - Free Trial: $0/month (50 minutes)
   - Starter: $99/month (200 minutes)
   - Professional: $299/month (1000 minutes)
   - Enterprise: $999/month (5000 minutes)
```

---

## Step 5: Test Your Deployment

Your app is now live at:
- **Backend:** https://voiceflow-api.onrender.com
- **Frontend:** https://voiceflow-app.onrender.com

Test it:
```bash
# Test API
curl https://voiceflow-api.onrender.com/health

# Visit frontend
open https://voiceflow-app.onrender.com
```

---

## Next Steps (Optional but Recommended)

### Add Custom Domain

1. In Render, go to voiceflow-app
2. Settings → Custom Domain
3. Add: `app.yourdomain.com`
4. Add DNS record (CNAME) in your domain registrar
5. Repeat for voiceflow-api with `api.yourdomain.com`

SSL certificates are automatic!

### Configure Webhooks

**Stripe:**
1. Stripe Dashboard → Webhooks
2. Add endpoint: `https://api.yourdomain.com/api/webhooks/stripe`
3. Select all subscription events
4. Copy webhook secret to Render environment

**Twilio:**
1. Twilio Console → Phone Numbers
2. For each number:
   - Voice URL: `https://api.yourdomain.com/api/webhooks/twilio/voice`
   - Status Callback: `https://api.yourdomain.com/api/webhooks/twilio/status`

---

## Cost Breakdown

**Monthly Costs:**
- Render Backend (Starter): $7
- Render Frontend (Static): Free
- MongoDB Atlas (M0): Free
- Redis Cloud (30MB): Free
- **Total: $7/month**

Plus your usage costs (Twilio, ElevenLabs, Stripe fees).

---

## Troubleshooting

**Build fails?**
- Check logs in Render Dashboard → Events
- Verify package.json exists in backend/frontend folders

**App crashes?**
- Check logs in Render Dashboard → Logs
- Verify all environment variables are set
- Test MongoDB connection string

**Can't access app?**
- Wait 2-3 minutes for deployment to complete
- Check Render Dashboard shows "Live" status
- Try curl command to test API health endpoint

---

## Auto-Deploys

Every time you push to GitHub, Render automatically deploys:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Render auto-deploys in ~2 minutes!
```

---

## Monitoring

**View Logs:**
- Dashboard → voiceflow-api → Logs

**Check Performance:**
- Dashboard → voiceflow-api → Metrics

**Alerts:**
- Dashboard → voiceflow-api → Settings → Notifications

---

## You're Live! 🎉

Your VoiceFlow CRM is now running in production on Render with:
- ✅ Automatic SSL/HTTPS
- ✅ Auto-deployments from GitHub
- ✅ Built-in monitoring and logs
- ✅ No server management
- ✅ Free tier for frontend
- ✅ $7/month for backend

**For detailed documentation, see:**
- [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md) - Full deployment guide
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Pre-launch checklist
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Traditional VPS deployment (Digital Ocean, etc.)

Now go get some users! 🚀
