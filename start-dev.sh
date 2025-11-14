#!/bin/bash

# Kill any processes on the ports
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:5001 | xargs kill -9 2>/dev/null

# Clear problematic environment variables
unset OPENAI_API_KEY
unset ANTHROPIC_API_KEY  
unset GOOGLE_AI_API_KEY

# Wait for ports to free
sleep 2

# Start development servers
npm run dev

