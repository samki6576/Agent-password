# Troubleshooting AgentPassport Lite

## Error: "Server configuration error. Please set Auth0 environment variables in Vercel Dashboard."

**Root Cause:** The API gateway is returning this error because one or more required Auth0 environment variables are missing.

**Required Variables:**
- `AUTH0_DOMAIN` - Your Auth0 tenant domain (e.g., `yourapp.auth0.com`)
- `AUTH0_CLIENT_ID` - Your Auth0 application client ID
- `AUTH0_CLIENT_SECRET` - Your Auth0 application client secret
- `NEXT_PUBLIC_APP_URL` - Your application URL (e.g., `http://localhost:3000` locally or `https://yourapp.vercel.app` in production)

**How to Fix:**

### For Local Development
1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your Auth0 credentials:
   ```
   AUTH0_DOMAIN=your-tenant.auth0.com
   AUTH0_CLIENT_ID=your_client_id_here
   AUTH0_CLIENT_SECRET=your_client_secret_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. Restart your dev server:
   ```bash
   pnpm dev
   ```

### For Vercel Deployment
1. Go to your Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all four variables:
   - `AUTH0_DOMAIN`
   - `AUTH0_CLIENT_ID`
   - `AUTH0_CLIENT_SECRET`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL)
5. Redeploy your project

## Error: "Failed to execute 'json' on 'Response': Unexpected token '<'"

**Root Cause:** The API returned an HTML error page instead of JSON. This typically happens when:
- Environment variables are missing (see above)
- The API route has a syntax error
- There's a 404 or 500 server error

**Solution:** 
1. Check the browser console for the actual error
2. Verify all environment variables are set (see above)
3. Check the server logs for more details
4. Ensure the API route file exists at `/src/app/api/get-events/route.ts`

## Error: "Not authenticated. Please connect your Google Calendar first."

**Root Cause:** The request reached the gateway successfully, but no access token was found in the HTTP-only cookie.

**Solution:**
1. Click "Connect Google Calendar" button
2. Complete the Auth0 OAuth flow
3. You'll be redirected back to the dashboard with a token stored in the cookie

## Error: "Your Google Calendar token is invalid. Please reconnect."

**Root Cause:** The access token stored in the cookie has expired or been revoked.

**Solution:**
1. Click "Connect Google Calendar" again
2. Complete the OAuth flow to get a fresh token
3. The gateway will automatically refresh expired tokens if a refresh token is available

## Error: "Session expired. Please reconnect your Google Calendar."

**Root Cause:** Both the access token and refresh token have expired or are missing.

**Solution:**
1. Click "Connect Google Calendar" to start a fresh session
2. The app will store new tokens that are valid for 24 hours

## Debugging Steps

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Make a request** (click "Refresh" or "Connect")
4. **Find the API call** to `/api/get-events` or `/api/auth/login`
5. **Check the response** - it should be valid JSON with either:
   - `{ "success": true, "events": [...] }`
   - `{ "error": "..." }`

## Key Security Pattern to Understand

The error handling has been improved to provide better debugging while maintaining security:

1. **Never** return actual tokens or credentials to the client
2. **Always** validate environment variables on the server
3. **Always** use HTTP-only cookies for token storage
4. **Always** return JSON errors (not HTML) from API routes

The dashboard now:
- Catches both JSON and HTML error responses
- Provides helpful messages for configuration errors
- Shows setup instructions for missing environment variables

## Still Stuck?

1. Check `DEPLOYMENT.md` for detailed setup instructions
2. Review `QUICKSTART.md` for local development setup
3. Read `ARCHITECTURE.md` to understand the security pattern
4. Check your Vercel Dashboard logs for server-side errors
