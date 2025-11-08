#!/bin/bash

# VoiceFlow CRM - Local Development Startup Script

echo "🚀 Starting VoiceFlow CRM Local Development Environment"
echo "=================================================="
echo ""

# Check if Redis is running
echo "📡 Checking Redis..."
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not running!"
    echo "   Please start Redis first:"
    echo "   - brew services start redis  (Mac with Homebrew)"
    echo "   - redis-server  (Manual start)"
    echo "   - docker run -d -p 6379:6379 redis:7-alpine  (Docker)"
    exit 1
fi

echo ""
echo "🔧 Starting Backend Server..."
echo "   - Running on: http://localhost:5001"
echo "   - API available at: http://localhost:5001/api"
echo ""

# Start backend in background
npm run server &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 8

# Check if backend is responding
if curl -s http://localhost:5001/api/auth/login > /dev/null 2>&1; then
    echo "✅ Backend is ready!"
else
    echo "⚠️  Backend might not be fully ready yet, but continuing..."
fi

echo ""
echo "🎨 Starting Frontend Development Server..."
echo "   - Running on: http://localhost:5173"
echo "   - Marketing page: http://localhost:5173/"
echo "   - Login: http://localhost:5173/login"
echo "   - Dashboard: http://localhost:5173/app/dashboard"
echo ""

# Start frontend
npm run client

# Cleanup on exit
echo ""
echo "🛑 Shutting down..."
kill $BACKEND_PID 2>/dev/null
echo "👋 Goodbye!"
