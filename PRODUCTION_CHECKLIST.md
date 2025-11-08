# VoiceFlow CRM - Production Launch Checklist

## 🔐 Security & Environment

### Environment Variables
- [ ] **MongoDB Production Database**
  - Create production MongoDB Atlas cluster
  - Update `MONGO_URI` with production connection string
  - Enable IP whitelist for your server
  - Set up automated backups

- [ ] **Redis Production**
  - Set up Redis Cloud or ElastiCache
  - Update `REDIS_URL` with production endpoint
  - Enable persistence and backups

- [ ] **API Keys & Secrets**
  - [ ] Generate new production `JWT_SECRET` (64+ character random string)
  - [ ] Update `ELEVENLABS_API_KEY` with production key
  - [ ] Update `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
  - [ ] Update `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` with live keys
  - [ ] Set `STRIPE_WEBHOOK_SECRET` from Stripe dashboard
  - [ ] Update `N8N_WEBHOOK_URL` if using n8n
  - [ ] Update email credentials (`EMAIL_USER`, `EMAIL_PASS`)
  - [ ] Update `CLIENT_URL` to production domain (e.g., https://app.voiceflow.ai)
  - [ ] Update `API_URL` to production API domain (e.g., https://api.voiceflow.ai)

- [ ] **Remove Development Defaults**
  - [ ] Remove all hardcoded API keys from code
  - [ ] Remove test phone numbers
  - [ ] Disable debug logging in production

### `.env` Production Template
```bash
# Production Environment
NODE_ENV=production
PORT=5001

# MongoDB
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/voiceflow-prod

# Redis
REDIS_URL=redis://user:password@redis-host:6379

# JWT
JWT_SECRET=<64-character-random-string>
JWT_EXPIRE=7d

# Frontend URL
CLIENT_URL=https://app.voiceflow.ai

# API URL
API_URL=https://api.voiceflow.ai

# ElevenLabs
ELEVENLABS_API_KEY=<production-key>

# Twilio
TWILIO_ACCOUNT_SID=<production-sid>
TWILIO_AUTH_TOKEN=<production-token>

# Stripe (LIVE KEYS)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_USER=noreply@voiceflow.ai
EMAIL_PASS=<app-password>
EMAIL_FROM=VoiceFlow CRM <noreply@voiceflow.ai>

# N8n (if using)
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://api.voiceflow.ai/api/auth/google/callback
```

## 📦 Database Setup

### Initial Data Seeding
- [ ] **Create Subscription Plans**
  ```javascript
  // Run this script to seed plans:
  db.subscriptionplans.insertMany([
    {
      name: "starter",
      displayName: "Starter",
      price: 99,
      callLimit: 200,
      features: [
        "1 AI Voice Agent",
        "200 Minutes/Month",
        "Lead Capture & CRM",
        "Email Notifications",
        "Phone Number Included"
      ],
      overageRate: 0.60
    },
    {
      name: "professional",
      displayName: "Professional",
      price: 299,
      callLimit: 1000,
      features: [
        "5 AI Voice Agents",
        "1,000 Minutes/Month",
        "Advanced Workflows",
        "SMS & Email Automation",
        "Calendar Integration",
        "Priority Support"
      ],
      overageRate: 0.50
    },
    {
      name: "enterprise",
      displayName: "Enterprise",
      price: 999,
      callLimit: 5000,
      features: [
        "Unlimited AI Agents",
        "5,000 Minutes/Month",
        "Custom Workflows",
        "White-Label Options",
        "Dedicated Account Manager",
        "Custom AI Training"
      ],
      overageRate: 0.40
    }
  ]);
  ```

### Indexes
- [ ] Create database indexes for performance:
  ```javascript
  db.users.createIndex({ email: 1 }, { unique: true });
  db.users.createIndex({ plan: 1, subscriptionStatus: 1 });
  db.calllogs.createIndex({ userId: 1, createdAt: -1 });
  db.calllogs.createIndex({ agentId: 1, createdAt: -1 });
  db.campaigns.createIndex({ userId: 1, status: 1 });
  db.voiceagents.createIndex({ userId: 1 });
  ```

## 🌐 Domain & Hosting

### Domain Setup
- [ ] Purchase domain (e.g., voiceflow.ai)
- [ ] Set up DNS records:
  - `A` record: `app.voiceflow.ai` → Server IP
  - `A` record: `api.voiceflow.ai` → Server IP
  - `CNAME` record: `www.voiceflow.ai` → `voiceflow.ai`
  - `MX` records for email

### SSL Certificates
- [ ] Install SSL certificates (Let's Encrypt recommended)
- [ ] Configure HTTPS redirect
- [ ] Update CORS settings for production domain

### Server Deployment
- [ ] **Choose hosting provider:**
  - [ ] AWS EC2 / Lightsail
  - [ ] Digital Ocean Droplet
  - [ ] Heroku
  - [ ] Railway
  - [ ] Render

- [ ] **Server requirements:**
  - 2GB RAM minimum
  - 2 vCPUs
  - 20GB SSD
  - Ubuntu 22.04 LTS

- [ ] **Install dependencies:**
  ```bash
  # Update system
  sudo apt update && sudo apt upgrade -y

  # Install Node.js 18+
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs

  # Install PM2 for process management
  sudo npm install -g pm2

  # Install Nginx
  sudo apt install -y nginx
  ```

## 🚀 Application Deployment

### Backend Deployment
```bash
# Clone repository
git clone https://github.com/yourorg/voiceflow-crm.git
cd voiceflow-crm

# Install dependencies
npm install

# Build (if needed)
npm run build

# Start with PM2
pm2 start npm --name "voiceflow-api" -- run server
pm2 save
pm2 startup
```

### Frontend Deployment
```bash
cd frontend

# Build for production
npm run build

# Serve with Nginx or deploy to:
# - Vercel
# - Netlify
# - Cloudflare Pages
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/voiceflow

# API
server {
    listen 80;
    server_name api.voiceflow.ai;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend
server {
    listen 80;
    server_name app.voiceflow.ai voiceflow.ai www.voiceflow.ai;
    root /var/www/voiceflow/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 💳 Payment Setup

### Stripe Configuration
- [ ] Switch to live mode in Stripe dashboard
- [ ] Create products and prices in Stripe
- [ ] Set up webhook endpoint: `https://api.voiceflow.ai/api/webhooks/stripe`
- [ ] Configure webhook events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `checkout.session.completed`
- [ ] Test webhook with Stripe CLI

### Payment Testing
- [ ] Test successful subscription
- [ ] Test failed payment
- [ ] Test subscription cancellation
- [ ] Test upgrade/downgrade
- [ ] Verify invoice emails

## 📞 Twilio Setup

### Phone Numbers
- [ ] Purchase Twilio phone numbers for pool
- [ ] Import numbers into database:
  ```javascript
  // Use TwilioService.importExistingNumbers()
  ```
- [ ] Configure webhooks:
  - Voice URL: `https://api.voiceflow.ai/api/webhooks/twilio/voice`
  - Status Callback: `https://api.voiceflow.ai/api/webhooks/twilio/status`

### Webhook Endpoints (Create These)
- [ ] `/api/webhooks/twilio/voice` - Handle incoming calls
- [ ] `/api/webhooks/twilio/status` - Call status updates
- [ ] `/api/webhooks/twilio/elevenlabs-forward` - Forward to ElevenLabs
- [ ] `/api/webhooks/elevenlabs/call-complete` - ElevenLabs callback

## 🤖 ElevenLabs Setup

### Agent Configuration
- [ ] Create prebuilt agents in ElevenLabs dashboard
- [ ] Save agent IDs to environment:
  - `ELEVENLABS_LEAD_GEN_AGENT_ID`
  - `ELEVENLABS_BOOKING_AGENT_ID`
  - `ELEVENLABS_COLLECTIONS_AGENT_ID`
  - `ELEVENLABS_PROMO_AGENT_ID`
  - `ELEVENLABS_SUPPORT_AGENT_ID`

## 📧 Email Setup

### Transactional Email
- [ ] Configure SendGrid, Mailgun, or Gmail SMTP
- [ ] Create email templates:
  - Welcome email
  - Password reset
  - Invoice receipt
  - Usage alerts
  - Agent created
  - Campaign completed

## 🔔 Monitoring & Logging

### Application Monitoring
- [ ] Set up error tracking (Sentry, Bugsnag, or LogRocket)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up log aggregation (Papertrail, Loggly)
- [ ] Create alerts for:
  - Server downtime
  - High error rates
  - Failed payments
  - API rate limits

### Performance
- [ ] Enable Redis caching
- [ ] Set up CDN for static assets (Cloudflare)
- [ ] Optimize database queries
- [ ] Enable gzip compression

## 🧪 Testing

### Pre-Launch Tests
- [ ] Test complete user flow:
  - [ ] Signup
  - [ ] Login
  - [ ] Create agent
  - [ ] Make test call
  - [ ] Upload campaign contacts
  - [ ] Start campaign
  - [ ] View analytics
  - [ ] Billing page
  - [ ] Logout
- [ ] Test payment flows
- [ ] Test webhooks (Stripe, Twilio, ElevenLabs)
- [ ] Load test with 100+ concurrent users
- [ ] Security audit
- [ ] Mobile responsiveness check

## 📱 Mobile & Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## 🎯 Marketing & Legal

### Marketing Pages
- [x] Landing page
- [ ] Pricing page (standalone)
- [ ] Features page
- [ ] Blog (optional)
- [ ] Help center / FAQ

### Legal Pages
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie Policy
- [ ] GDPR Compliance (if applicable)

### Analytics
- [ ] Google Analytics 4
- [ ] Facebook Pixel (if using ads)
- [ ] Hotjar or similar for heatmaps

## 🚦 Launch Day

### Pre-Launch (1 week before)
- [ ] Final security audit
- [ ] Backup all data
- [ ] Test disaster recovery
- [ ] Prepare support documentation

### Launch Day
- [ ] Switch to production environment variables
- [ ] Deploy latest code
- [ ] Verify all services running
- [ ] Test critical paths
- [ ] Monitor error logs
- [ ] Announce launch

### Post-Launch (First week)
- [ ] Monitor server performance
- [ ] Watch for error spikes
- [ ] Collect user feedback
- [ ] Fix critical bugs immediately
- [ ] Daily backup verification

## 📊 Success Metrics

### Track These KPIs
- [ ] User signups per day
- [ ] Trial → Paid conversion rate
- [ ] Monthly Recurring Revenue (MRR)
- [ ] Churn rate
- [ ] Average calls per customer
- [ ] Customer support tickets
- [ ] Page load times
- [ ] API response times
- [ ] Error rates

## 🆘 Support Setup

### Customer Support
- [ ] Set up support email (help@voiceflow.ai)
- [ ] Create knowledge base
- [ ] Set up live chat (Intercom, Crisp)
- [ ] Create onboarding email sequence
- [ ] Prepare FAQ document

## 🔄 Ongoing Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review support tickets

### Weekly
- [ ] Review analytics
- [ ] Database backups verification
- [ ] Security updates

### Monthly
- [ ] Review and optimize costs
- [ ] Update dependencies
- [ ] Review user feedback
- [ ] Plan new features

---

## Quick Commands Reference

### PM2 Commands
```bash
pm2 status              # Check app status
pm2 logs voiceflow-api  # View logs
pm2 restart voiceflow-api
pm2 stop voiceflow-api
pm2 delete voiceflow-api
```

### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb+srv://..." /backup/20250108
```

### SSL Renewal (Let's Encrypt)
```bash
sudo certbot renew
sudo nginx -t && sudo systemctl reload nginx
```

---

## Emergency Contacts
- MongoDB Support: https://support.mongodb.com
- Stripe Support: https://support.stripe.com
- Twilio Support: https://support.twilio.com
- ElevenLabs Support: https://elevenlabs.io/support
