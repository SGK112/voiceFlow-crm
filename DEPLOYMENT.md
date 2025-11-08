# VoiceFlow CRM - Production Deployment Guide

## 🚀 Quick Start

This guide will walk you through deploying VoiceFlow CRM to production in under 1 hour.

## Prerequisites

- Server with Ubuntu 22.04 LTS (2GB RAM, 2 vCPUs minimum)
- Domain name (e.g., voiceflow.ai)
- MongoDB Atlas account (free tier works)
- Redis Cloud account (free tier works)
- Stripe account (for payments)
- Twilio account (for phone calls)
- ElevenLabs account (for AI agents)

## Step 1: Server Setup

### 1.1 Initial Server Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18+
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Allow firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 1.2 Clone Repository

```bash
# Create deployment directory
sudo mkdir -p /var/www/voiceflow
sudo chown $USER:$USER /var/www/voiceflow
cd /var/www/voiceflow

# Clone your repository
git clone https://github.com/yourorg/voiceflow-crm.git .
```

## Step 2: Database Setup

### 2.1 MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new project: "VoiceFlow Production"
3. Build a database (free M0 cluster)
4. Create database user with password
5. Add IP address to whitelist: `0.0.0.0/0` (allow from anywhere)
6. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/voiceflow-prod
   ```

### 2.2 Redis Cloud

1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create free database (30MB is enough to start)
3. Get connection string:
   ```
   redis://default:password@redis-12345.cloud.redislabs.com:12345
   ```

## Step 3: API Keys & Credentials

### 3.1 ElevenLabs

1. Go to [ElevenLabs](https://elevenlabs.io/app/settings/api-keys)
2. Create production API key
3. Create 5 conversational AI agents:
   - Lead Generation Agent (save agent ID)
   - Booking Agent
   - Collections Agent
   - Promotions Agent
   - Support Agent

### 3.2 Twilio

1. Go to [Twilio Console](https://console.twilio.com/)
2. Get Account SID and Auth Token
3. Purchase 2-3 phone numbers:
   ```bash
   # Numbers cost ~$2/month each
   ```

### 3.3 Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Switch to LIVE mode** (top left toggle)
3. Get API keys (Developers → API Keys)
4. Create products and prices:
   - Starter: $99/month
   - Professional: $299/month
   - Enterprise: $999/month
5. Save price IDs (price_xxxxx)

### 3.4 Email (Gmail SMTP)

1. Enable 2FA on your Gmail account
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
3. Use this app password in .env

## Step 4: Environment Configuration

```bash
cd /var/www/voiceflow

# Copy production template
cp .env.production.template .env.production

# Edit with your credentials
nano .env.production
```

Fill in ALL values in `.env.production`. See template for details.

**Critical values:**
- Generate JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- Set production URLs
- Add all API keys
- Use LIVE Stripe keys, not test!

## Step 5: Deploy Application

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

This will:
- Install dependencies
- Seed database with subscription plans
- Build frontend
- Start backend with PM2

## Step 6: Configure Nginx

```bash
# Copy Nginx config
sudo cp nginx.conf.template /etc/nginx/sites-available/voiceflow

# Edit domains in config
sudo nano /etc/nginx/sites-available/voiceflow
# Replace voiceflow.ai with your domain

# Enable site
sudo ln -s /etc/nginx/sites-available/voiceflow /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 7: DNS Configuration

In your domain registrar (Cloudflare, Namecheap, etc.):

```
Type    Name    Value           TTL
A       @       YOUR_SERVER_IP  Auto
A       app     YOUR_SERVER_IP  Auto
A       api     YOUR_SERVER_IP  Auto
CNAME   www     voiceflow.ai    Auto
```

Wait 5-10 minutes for DNS propagation.

## Step 8: SSL Certificates

```bash
# Get SSL certificates for all domains
sudo certbot --nginx -d voiceflow.ai -d www.voiceflow.ai -d app.voiceflow.ai -d api.voiceflow.ai

# Follow prompts
# Select: Redirect HTTP to HTTPS (option 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

Certificates auto-renew every 90 days.

## Step 9: Configure Webhooks

### 9.1 Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.voiceflow.ai/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
4. Copy webhook secret to `.env.production`
5. Redeploy: `pm2 restart voiceflow-api`

### 9.2 Twilio Webhooks

For each phone number in Twilio Console:
1. Voice Configuration:
   - Voice URL: `https://api.voiceflow.ai/api/webhooks/twilio/voice`
   - Method: POST
   - Status Callback: `https://api.voiceflow.ai/api/webhooks/twilio/status`

## Step 10: Test Everything

### 10.1 Basic Tests

```bash
# Test API health
curl https://api.voiceflow.ai/health

# Test frontend
curl https://app.voiceflow.ai

# Should see your marketing page
```

### 10.2 User Flow Test

1. Visit `https://app.voiceflow.ai`
2. Click "Start Free Trial"
3. Sign up with email
4. Create an agent
5. Make a test call
6. Check dashboard

### 10.3 Payment Test

1. Use Stripe test card: `4242 4242 4242 4242`
2. Complete checkout
3. Verify webhook received
4. Check user upgraded in database

## Step 11: Monitoring Setup

### 11.1 PM2 Monitoring

```bash
# View logs
pm2 logs voiceflow-api

# Monitor resources
pm2 monit

# Check status
pm2 status
```

### 11.2 Error Tracking (Optional but Recommended)

Sign up for [Sentry](https://sentry.io/):

```bash
# Install Sentry SDK
npm install @sentry/node

# Add to backend/server.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

### 11.3 Uptime Monitoring

Set up [UptimeRobot](https://uptimerobot.com/) (free):
- Monitor: `https://api.voiceflow.ai/health`
- Check every: 5 minutes
- Alert via: Email

## Step 12: Backups

### 12.1 Database Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-mongodb.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/voiceflow-prod" \
  --out="$BACKUP_DIR/$DATE"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-mongodb.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-mongodb.sh
```

## Step 13: Security Hardening

### 13.1 Firewall Rules

```bash
# Only allow necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 13.2 Fail2Ban (Prevent brute force)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 13.3 Auto Security Updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## Maintenance Commands

### Application Management

```bash
# Restart app
pm2 restart voiceflow-api

# Stop app
pm2 stop voiceflow-api

# View logs
pm2 logs voiceflow-api --lines 100

# Clear logs
pm2 flush

# Monitor resources
pm2 monit
```

### Database Management

```bash
# Connect to MongoDB
mongosh "mongodb+srv://cluster.mongodb.net/voiceflow-prod" --username user

# Check collections
use voiceflow-prod
show collections
db.users.count()
```

### Nginx Management

```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View error log
sudo tail -f /var/log/nginx/error.log
```

### SSL Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

## Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs voiceflow-api

# Check environment
pm2 env voiceflow-api

# Restart with fresh environment
pm2 delete voiceflow-api
pm2 start npm --name "voiceflow-api" -- run server
```

### Database connection fails

```bash
# Test MongoDB connection
mongosh "YOUR_MONGO_URI"

# Check firewall rules in MongoDB Atlas
# Ensure 0.0.0.0/0 is whitelisted
```

### Stripe webhooks not working

```bash
# Test webhook locally
stripe listen --forward-to localhost:5001/api/webhooks/stripe

# Check webhook secret matches in .env
# Verify endpoint is https (not http)
```

### Calls not connecting

```bash
# Check Twilio webhook logs
# Twilio Console → Monitor → Logs → Errors

# Verify phone number webhooks are set
# Test webhook URL responds:
curl -X POST https://api.voiceflow.ai/api/webhooks/twilio/voice \
  -d "From=+15555555555&To=+16666666666"
```

## Performance Optimization

### 1. Enable Redis Caching

Already configured. Monitor cache hit rate:

```bash
redis-cli --url YOUR_REDIS_URL
> INFO stats
```

### 2. Database Indexes

Indexes are created automatically on startup. Verify:

```javascript
db.users.getIndexes()
db.calllogs.getIndexes()
```

### 3. CDN for Static Assets

Use Cloudflare (free):
1. Add site to Cloudflare
2. Update DNS to Cloudflare nameservers
3. Enable caching for static files

## Scaling Guide

### When to scale:

- **100+ users**: Upgrade server to 4GB RAM
- **1000+ users**: Add load balancer, multiple app servers
- **5000+ users**: Dedicated MongoDB cluster, Redis cluster

### Vertical Scaling (easier)

```bash
# Upgrade your VPS/EC2 instance
# 2GB → 4GB → 8GB RAM
```

### Horizontal Scaling (more complex)

1. Set up load balancer (Nginx, HAProxy)
2. Deploy app to multiple servers
3. Use session store (Redis)
4. Shared file system or S3 for uploads

## Support & Resources

- **Documentation**: See PRODUCTION_CHECKLIST.md
- **MongoDB Support**: https://support.mongodb.com
- **Stripe Support**: https://support.stripe.com
- **Twilio Support**: https://support.twilio.com
- **ElevenLabs Support**: https://elevenlabs.io/support

## Emergency Contacts

Keep these handy:

- DNS Provider Support
- Server Hosting Support
- MongoDB Atlas Support
- Payment Gateway Support
- Your own on-call developer 😊

---

## Post-Launch Checklist

After successful deployment:

- [ ] Monitor error logs for 48 hours
- [ ] Test all user flows
- [ ] Verify webhooks working
- [ ] Check email delivery
- [ ] Test payment processing
- [ ] Verify backups running
- [ ] Set up monitoring alerts
- [ ] Document any custom configurations
- [ ] Create runbook for common issues
- [ ] Train support team

## Success! 🎉

Your VoiceFlow CRM is now live in production!

Next steps:
1. Marketing & user acquisition
2. Monitor analytics
3. Collect user feedback
4. Iterate on features
5. Scale as needed

Good luck! 🚀
