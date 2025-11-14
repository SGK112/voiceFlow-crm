# Google OAuth Redirect URI Mismatch - Fix Guide

## Error
```
Error 400: redirect_uri_mismatch
Access blocked: This app's request is invalid
```

## Root Cause
The redirect URI being sent by the app doesn't match the authorized redirect URIs in Google Cloud Console.

## Current Configuration

**App is sending:**
- `http://localhost:5173/auth/google/callback` (local login)
- `https://voiceflow-crm.onrender.com/auth/google/callback` (production login)
- `http://localhost:5173/auth/integration/callback` (local integrations)
- `https://voiceflow-crm.onrender.com/auth/integration/callback` (production integrations)

## Fix Steps

### Step 1: Add Redirect URIs to Google Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your project
3. Click on the OAuth 2.0 Client ID: `710258787879-qmvg6o96r0k3pc6r47mutesavrhkttik`
4. Under "Authorized redirect URIs", add these EXACT URIs:

```
http://localhost:5173/auth/google/callback
http://localhost:5173/auth/integration/callback
https://voiceflow-crm.onrender.com/auth/google/callback
https://voiceflow-crm.onrender.com/auth/integration/callback
```

5. Click **SAVE**

### Step 2: Wait for Changes to Propagate

Google OAuth changes can take **5-10 minutes** to propagate. After saving:
1. Wait 5 minutes
2. Clear browser cache or use incognito mode
3. Try logging in again

### Step 3: Test the Flow

1. Go to: http://localhost:5173/login
2. Click "Continue with Google"
3. Select your Google account
4. Should redirect back successfully

## Verification

After adding the redirect URIs, you should see them listed in the Google Console under:
```
APIs & Services > Credentials > OAuth 2.0 Client IDs > [Your Client ID]
```

## Common Issues

1. **Still seeing error after adding URIs**
   - Wait 5-10 minutes for Google to propagate changes
   - Clear browser cache
   - Try incognito/private browsing mode

2. **URIs must match EXACTLY**
   - No trailing slashes
   - Correct protocol (http vs https)
   - Correct port number
   - Case-sensitive path

3. **Multiple environments**
   - Add URIs for both local (localhost) and production (onrender.com)
   - Each environment needs its own redirect URI

## Current Server Status

- Backend: http://localhost:5001/api ✅
- Frontend: http://localhost:5173 ✅
- Google Client ID: 710258787879-qmvg6o96r0k3pc6r47mutesavrhkttik

## Next Steps After Fix

Once Google OAuth is working:
1. Test login locally
2. Test on production (after deployment)
3. Test integration OAuth flow
4. Verify both environments work

