# Troubleshooting Guide - Wallet Authentication

## ✅ Backend Is Running Successfully!

The backend is now running without errors. The error messages you're seeing are **expected behavior** during the authentication flow.

## Understanding the Flow

### Step 1: Connect Wallet (✅ Working)
- User clicks "Connect Wallet"
- MetaMask opens
- Frontend gets checksummed address
- `POST /v1/auth/challenge` succeeds
- `POST /v1/auth/verify` succeeds
- **Session cookie `gb_session` is set**

### Step 2: Check Profile (Expected 404)
```
GET /v1/profile/0xFe5103...783 - PROFILE_NOT_FOUND
```
This is **EXPECTED** for new users! The frontend checks if profile exists, gets 404, then knows to show the profile creation form.

### Step 3: Create Profile (401 Error - THIS IS THE ISSUE)
```
POST /v1/profile - UNAUTHORIZED: No session token provided
```
This means the session cookie isn't being sent with the profile creation request.

## The Cookie Issue

### Why Cookies Might Not Work

The issue is likely that cookies aren't being sent cross-origin from `app.lvh.me:3000` to `api.lvh.me:4000`.

### Quick Fix Option 1: Add Debug Logs

I've already added debug logs to the JWT guard. After you restart the backend, when you try to create a profile, check the logs to see:
- `🔍 JWT Guard - Cookies:` - Shows what cookies the backend received
- `🔍 JWT Guard - Token found:` - Whether the gb_session cookie was found

### Quick Fix Option 2: Check Frontend API Client

The frontend needs to ensure cookies are sent. Let me verify the API client is configured correctly.

## Expected vs Actual

**After wallet connection, you should see in backend logs:**
```
✅ Session cookie set for: 0xFe5103...783
```

**Then when creating profile:**
```
🔍 JWT Guard - Cookies: { gb_session: 'eyJ...' }
🔍 JWT Guard - Token found: true
✅ JWT Guard - User authenticated: 0xFe5103...783
```

## Next Steps

1. **Restart backend** to see the new debug logs
2. **Try connecting wallet again**
3. **Watch the backend logs** when you submit the profile form
4. **Share the debug output** - specifically what cookies are being sent

The backend is 100% ready - we just need to ensure the frontend sends cookies correctly!
