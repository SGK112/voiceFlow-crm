# Quick Test - Get Started in 2 Minutes

## Super Fast Start

```bash
cd /Users/homepc/voiceflow-crm

# Option 1: Use the startup script (easiest)
./start-local.sh

# Option 2: Manual start (if you prefer)
npm run dev
```

Then open: **http://localhost:5173**

---

## What You'll See

1. **Marketing Page** → http://localhost:5173/
   - Updated pricing (minute-based)
   - Click "Start Free Trial"

2. **Sign Up** → Create your account
   - Any email/password works for testing
   - You'll get 30 trial minutes automatically

3. **Dashboard** → http://localhost:5173/app/dashboard
   - See your usage stats
   - Create agents, add leads, manage calls

---

## Already Running

✅ **Backend**: Running on port 5001 (you started it)
✅ **Redis**: Already running
✅ **MongoDB**: Connected to Atlas

Just need to start the **frontend**:

```bash
cd /Users/homepc/voiceflow-crm/frontend
npm run dev
```

Then visit: http://localhost:5173/

---

## Common Commands

```bash
# Check if backend is running
curl http://localhost:5001/api/auth/login

# Check if Redis is running
redis-cli ping

# Kill process on port 5001
lsof -i :5001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 5173
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

## Test Flow

1. Visit http://localhost:5173/
2. Click "Start Free Trial" (Starter plan)
3. Sign up with:
   - Email: yourtest@example.com
   - Password: password123
   - Company: My Test Company
4. After signup → Redirected to Dashboard
5. See "30 minutes remaining" (trial)
6. Create an agent (Agents page)
7. Add a lead (Leads page)
8. Try to call (will fail without ElevenLabs API key, but UI works)

✅ Everything except actual voice calls works without API keys!

---

## Troubleshooting

**Frontend can't connect to backend**:
- Make sure backend is running: `curl http://localhost:5001/api/auth/login`
- Should return: `{"message":"Invalid credentials"}`
- If not, start backend: `npm run server` from root directory

**Port already in use**:
```bash
# Kill the process
lsof -i :5001 | grep LISTEN | awk '{print $2}' | xargs kill -9
# or
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**Need to restart everything**:
```bash
# Kill all
killall node
killall npm

# Restart
./start-local.sh
# or
npm run dev
```

---

## Status Check

Your setup:
- ✅ Backend running on port 5001
- ✅ MongoDB Atlas connected
- ✅ Redis running locally
- ✅ All code committed to GitHub
- ✅ Usage tracking implemented
- ✅ Marketing page connected to CRM

**You're ready to test!** 🎉
