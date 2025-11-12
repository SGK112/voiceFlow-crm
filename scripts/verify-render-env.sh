#!/bin/bash

# VoiceFlow CRM - Render Environment Variable Verification Script
# This script checks if all required environment variables are set in Render

echo "================================================"
echo "  VoiceFlow CRM - Render Environment Check"
echo "================================================"
echo ""

# Get the service name
SERVICE_NAME="voiceflow-crm"

echo "Fetching environment variables from Render..."
echo ""

# Get all environment variables from Render
ENV_VARS=$(render env list --service $SERVICE_NAME --format json 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to fetch environment variables from Render"
    echo "   Make sure you're logged in: render login"
    exit 1
fi

# Required backend environment variables
REQUIRED_BACKEND_VARS=(
    "NODE_ENV"
    "PORT"
    "MONGODB_URI"
    "JWT_SECRET"
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "STRIPE_STARTER_PRICE_ID"
    "STRIPE_PROFESSIONAL_PRICE_ID"
    "STRIPE_ENTERPRISE_PRICE_ID"
    "ELEVENLABS_API_KEY"
    "SMTP_USER"
    "SMTP_PASSWORD"
    "SMTP_FROM_EMAIL"
)

# Required frontend environment variables (embedded at build time)
REQUIRED_FRONTEND_VARS=(
    "VITE_API_URL"
    "VITE_GOOGLE_CLIENT_ID"
    "VITE_STRIPE_PUBLISHABLE_KEY"
)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Backend Environment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

MISSING_BACKEND=()

for var in "${REQUIRED_BACKEND_VARS[@]}"; do
    # Check if variable exists in Render
    VALUE=$(render env get --service $SERVICE_NAME --key $var 2>/dev/null)

    if [ -z "$VALUE" ] || [ "$VALUE" = "null" ]; then
        echo "❌ $var - MISSING"
        MISSING_BACKEND+=("$var")
    else
        # Mask sensitive values
        if [[ "$var" == *"SECRET"* ]] || [[ "$var" == *"KEY"* ]] || [[ "$var" == *"PASSWORD"* ]]; then
            MASKED="${VALUE:0:10}***"
            echo "✅ $var - SET ($MASKED)"
        else
            echo "✅ $var - SET ($VALUE)"
        fi
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Frontend Environment Variables (Build Time)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

MISSING_FRONTEND=()

for var in "${REQUIRED_FRONTEND_VARS[@]}"; do
    VALUE=$(render env get --service $SERVICE_NAME --key $var 2>/dev/null)

    if [ -z "$VALUE" ] || [ "$VALUE" = "null" ]; then
        echo "❌ $var - MISSING (CRITICAL: Frontend won't work!)"
        MISSING_FRONTEND+=("$var")
    else
        if [[ "$var" == *"KEY"* ]]; then
            MASKED="${VALUE:0:15}***"
            echo "✅ $var - SET ($MASKED)"
        else
            echo "✅ $var - SET ($VALUE)"
        fi
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_MISSING=$((${#MISSING_BACKEND[@]} + ${#MISSING_FRONTEND[@]}))

if [ $TOTAL_MISSING -eq 0 ]; then
    echo "✅ All required environment variables are set!"
    echo ""
    echo "⚠️  IMPORTANT: If you just added VITE_* variables,"
    echo "   you MUST trigger a manual deploy to rebuild the frontend."
    echo ""
    read -p "Trigger manual deploy now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Triggering manual deploy..."
        render deploy --service $SERVICE_NAME --clear-cache
        echo ""
        echo "✅ Deploy triggered! Check Render dashboard for progress."
        echo "   URL: https://dashboard.render.com"
    fi
else
    echo "❌ Missing $TOTAL_MISSING environment variable(s)"
    echo ""

    if [ ${#MISSING_FRONTEND[@]} -gt 0 ]; then
        echo "🚨 CRITICAL: Missing frontend variables (app won't load):"
        for var in "${MISSING_FRONTEND[@]}"; do
            echo "   - $var"

            # Provide the correct value
            case $var in
                "VITE_STRIPE_PUBLISHABLE_KEY")
                    echo "     Value: pk_live_51Rr3YyHDbK8UKkrvbyxTOIvyaWrJgMbhbiRmeysHzDOAEzpjnEUCKRPArMpGeOPCT9GdWtJhbvwzPO8OUixFdRe600b9zYzxYT"
                    ;;
                "VITE_API_URL")
                    echo "     Value: /api"
                    ;;
                "VITE_GOOGLE_CLIENT_ID")
                    echo "     Value: 710258787879-qmvg6o96r0k3pc6r47mutesavrhkttik.apps.googleusercontent.com"
                    ;;
            esac
        done
        echo ""
    fi

    if [ ${#MISSING_BACKEND[@]} -gt 0 ]; then
        echo "Missing backend variables:"
        for var in "${MISSING_BACKEND[@]}"; do
            echo "   - $var"
        done
        echo ""
    fi

    echo "To fix:"
    echo "1. Go to: https://dashboard.render.com"
    echo "2. Select service: $SERVICE_NAME"
    echo "3. Go to: Environment tab"
    echo "4. Add the missing variables above"
    echo "5. Trigger a manual deploy to apply changes"
    echo ""
fi
