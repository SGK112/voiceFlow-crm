#!/bin/bash

# VoiceFlow CRM - Production Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 VoiceFlow CRM Deployment Script"
echo "===================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found${NC}"
    echo "Please create .env.production from .env.production.template"
    exit 1
fi

echo -e "${GREEN}✅ Environment file found${NC}"

# Backup current .env
if [ -f .env ]; then
    echo "📦 Backing up current .env..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy production environment
echo "🔧 Setting production environment..."
cp .env.production .env

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Run database migrations/seeds if needed
echo "🌱 Seeding subscription plans..."
node backend/scripts/seed-plans.js

# Build frontend
echo "🏗️  Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 not found. Installing PM2...${NC}"
    npm install -g pm2
fi

# Stop existing PM2 process if running
if pm2 list | grep -q "voiceflow-api"; then
    echo "🛑 Stopping existing process..."
    pm2 stop voiceflow-api
    pm2 delete voiceflow-api
fi

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start npm --name "voiceflow-api" -- run server

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot (first time only)
if ! pm2 startup | grep -q "already"; then
    echo "⚙️  Configuring PM2 to start on boot..."
    pm2 startup
fi

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "📝 Useful Commands:"
echo "  pm2 logs voiceflow-api    # View logs"
echo "  pm2 restart voiceflow-api # Restart app"
echo "  pm2 stop voiceflow-api    # Stop app"
echo "  pm2 monit                 # Monitor resources"
echo ""
echo "🌐 Application should be running at:"
echo "  API: http://localhost:5001"
echo "  Frontend: Configure Nginx to serve frontend/dist"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo "  1. Configure Nginx reverse proxy"
echo "  2. Set up SSL certificates with Certbot"
echo "  3. Configure DNS records"
echo "  4. Test all endpoints"
echo "  5. Monitor logs for errors"
echo ""
