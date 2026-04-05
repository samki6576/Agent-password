# 🏗️ AgentPassport Lite — Technical Architecture

Complete technical reference for building and extending the secure API gateway.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Dashboard (/app/page.tsx)                         │  │
│  │                                                          │  │
│  │  • "Connect Google Calendar" button                      │  │
│  │  • Calls /api/auth/login on click                       │  │
│  │  • Displays calendar events from /api/get-events        │  │
│  │  • Shows security status                               │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│           │                                    │                 │
│           │ POST /api/auth/login               │ GET /api/get-events
│           │ (no credentials in request)        │ (no credentials in request)
│           ▼                                    ▼                 │
└─────────────────────────────────────────────────────────────────┘
           │                                    │
           │                                    │
┌──────────────────────────────────────────────────────────────────┐
│                   NEXT.JS SERVER (Routes)                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  /api/auth/login (route.ts)                             │   │
│  │                                                         │   │
│  │  1. Receive request from browser                        │   │
│  │  2. Generate Auth0 URL with OAuth params:              │   │
│  │     - client_id, client_secret                         │   │
│  │     - scope: "openid profile email read:calendar"     │   │
│  │     - redirect_uri: /api/auth/callback                │   │
│  │  3. Redirect browser to Auth0                          │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           │ Redirect to Auth0                   │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Auth0 (OAuth Provider)                                │   │
│  │                                                         │   │
│  │  1. User logs in with Google account                   │   │
│  │  2. Grants permission for "read:calendar" scope        │   │
│  │  3. Redirects back to /api/auth/callback with code     │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           │ Callback with authorization code    │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  /api/auth/callback (route.ts)                          │   │
│  │                                                         │   │
│  │  1. Receive authorization code from Auth0              │   │
│  │  2. Exchange code for access_token:                    │   │
│  │     - POST to Auth0 /oauth/token                       │   │
│  │     - Send: code, client_id, client_secret             │   │
│  │     - Receive: access_token, refresh_token, expires_in │   │
│  │  3. Store tokens in HTTP-only cookies:                 │   │
│  │     - access_token (HttpOnly, Secure, SameSite)        │   │
│  │     - refresh_token (HttpOnly, Secure, SameSite)       │   │
│  │     - token_expires_at (visible, for UI)               │   │
│  │  4. Redirect to dashboard (/)                          │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           │ Set cookies, redirect to /           │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  /api/get-events (route.ts) ⭐ SECURE GATEWAY           │   │
│  │                                                         │   │
│  │  🔒 CORE SECURITY PATTERN 🔒                           │   │
│  │                                                         │   │
│  │  Step 1: Check Authentication                         │   │
│  │    • Get access_token from HTTP-only cookie            │   │
│  │    • If missing → 401 Unauthorized                     │   │
│  │                                                         │   │
│  │  Step 2: Check Token Expiry                            │   │
│  │    • Compare token_expires_at with current time        │   │
│  │    • If expired:                                       │   │
│  │      - Use refresh_token to get new token              │   │
│  │      - POST to Auth0 /oauth/token                      │   │
│  │      - Update cookies with new access_token            │   │
│  │    • If refresh fails → 401 Unauthorized               │   │
│  │                                                         │   │
│  │  Step 3: Call External API                             │   │
│  │    • Fetch Google Calendar API                         │   │
│  │    • Header: Authorization: Bearer ${access_token}     │   │
│  │    • Note: Token from cookie, never exposed to client  │   │
│  │                                                         │   │
│  │  Step 4: Return Data                                   │   │
│  │    • 200 OK + calendar events JSON                     │   │
│  │    • Token NOT included in response                    │   │
│  │    • AI agent receives only event data                 │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           │ JSON response (events only)         │
│                           ▼                                      │
└──────────────────────────────────────────────────────────────────┘
           │
           │ Events displayed in dashboard
           ▼
      Browser re-renders dashboard
      Events shown to user
      Token stays hidden (HTTP-only cookie)

┌──────────────────────────────────────────────────────────────────┐
│                    AI AGENT (Python/JS)                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  import requests                                                │
│  response = requests.get('http://localhost:3000/api/get-events')│
│  events = response.json()['events']                             │
│                                                                  │
│  ✓ No token in request                                          │
│  ✓ No credentials handled                                       │
│  ✓ Just receives data                                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Model

### Token Storage Comparison

| Approach | Location | XSS Safe? | CSRF Safe? | Accessible to JS? |
|----------|----------|-----------|-----------|-------------------|
| **localStorage** | Browser | ❌ No | ⚠️ Vulnerable | ✅ Yes (XSS steal) |
| **sessionStorage** | Browser | ❌ No | ⚠️ Vulnerable | ✅ Yes (XSS steal) |
| **Regular Cookie** | Browser | ❌ No | ⚠️ Vulnerable | ✅ Yes (access) |
| **HTTP-Only Cookie** ⭐ | Browser | ✅ Yes | ✅ Yes (SameSite) | ❌ No (safe) |

**AgentPassport uses HTTP-Only Cookies** because:
- Not accessible to JavaScript → XSS attacks can't steal tokens
- Automatically sent with requests → Agent doesn't need to handle them
- Secure flag ensures HTTPS only in production
- SameSite=Strict prevents CSRF attacks

### Token Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. USER LOGS IN                                            │
│  ├─ Browser → /api/auth/login                              │
│  ├─ Redirects to Auth0 (OAuth)                              │
│  ├─ Auth0 redirects back with code                          │
│  └─ /api/auth/callback exchanges code for tokens            │
│                                                             │
│  2. TOKENS STORED (HTTP-Only Cookies)                       │
│  ├─ access_token: JWT from Auth0, expires in 24h            │
│  ├─ refresh_token: Long-lived token (weeks/months)          │
│  └─ token_expires_at: Timestamp for client-side awareness   │
│                                                             │
│  3. AGENT CALLS GATEWAY                                     │
│  ├─ Agent: GET /api/get-events (no credentials)             │
│  ├─ Browser/request includes cookies automatically          │
│  └─ Gateway checks access_token from cookie                 │
│                                                             │
│  4. TOKEN VALIDATION                                        │
│  ├─ If valid & not expired: Use token immediately           │
│  ├─ If expired: Use refresh_token to get new token          │
│  ├─ If refresh fails: Return 401 Unauthorized               │
│  └─ Update cookies with new token/expiry                    │
│                                                             │
│  5. API CALL                                                │
│  ├─ Gateway calls Google Calendar with token                │
│  ├─ Google returns events                                   │
│  └─ Gateway returns events to agent (token hidden)          │
│                                                             │
│  6. USER DISCONNECTS                                        │
│  ├─ Browser: POST /api/auth/logout                          │
│  ├─ Server clears all cookies                               │
│  └─ Session ended, tokens destroyed                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Token Expiry Handling

```typescript
// In /api/get-events/route.ts

const accessToken = request.cookies.get('access_token')?.value;
const expiresAt = request.cookies.get('token_expires_at')?.value;

// Check if expired
if (expiresAt && Date.now() > parseInt(expiresAt)) {
  // Token expired, try to refresh
  const refreshToken = request.cookies.get('refresh_token')?.value;
  
  if (!refreshToken) {
    // No refresh token, ask user to log in again
    return 401; // Unauthorized
  }
  
  try {
    // Call Auth0 to get new token
    const newToken = await refreshAccessToken(refreshToken);
    
    // Update cookies with new token
    response.cookies.set('access_token', newToken.access_token);
    response.cookies.set('token_expires_at', ...);
    
    // Continue with API call using new token
    const events = await getCalendarEvents(newToken.access_token);
    return 200 + events;
  } catch {
    // Refresh failed, ask user to log in again
    return 401; // Unauthorized
  }
}
```

---

## 🏗️ File Structure & Responsibilities

### `/app/page.tsx` (Dashboard UI)

**Purpose:** User-facing interface  
**Responsibilities:**
- Display "Connect Google Calendar" button
- Show calendar events fetched from gateway
- Handle auth state (authenticated vs not)
- Display security status
- Implement refresh and logout functions

**Key Code:**
```typescript
// Fetch events from gateway (no token in request)
const response = await fetch('/api/get-events', {
  credentials: 'include', // Include cookies
});

// Events received without credentials exposed
const events = await response.json();
```

### `/api/auth/login/route.ts`

**Purpose:** Initiate OAuth flow  
**Responsibilities:**
- Receive request to start login
- Build Auth0 authorization URL
- Include scopes: `openid profile email read:calendar`
- Redirect browser to Auth0

**Key Code:**
```typescript
const loginUrl = getLoginUrl(callbackUrl);
return NextResponse.redirect(loginUrl);

// getLoginUrl builds:
// https://AUTH0_DOMAIN/authorize?
//   client_id=xxx
//   scope=openid profile email read:calendar
//   redirect_uri=http://localhost:3000/api/auth/callback
```

### `/api/auth/callback/route.ts`

**Purpose:** Handle Auth0 callback  
**Responsibilities:**
- Receive authorization code from Auth0
- Exchange code for access_token (via Auth0 API)
- Store tokens in HTTP-only cookies
- Redirect to dashboard

**Key Code:**
```typescript
// Exchange code for tokens
const tokenResponse = await exchangeCodeForToken(code, redirectUri);

// Store in HTTP-only cookie (JavaScript can't access)
response.cookies.set({
  name: 'access_token',
  value: tokenResponse.access_token,
  httpOnly: true,      // ⭐ Key security feature
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
});
```

### `/api/get-events/route.ts` (Secure Gateway) ⭐⭐⭐

**Purpose:** Secure API gateway for agents  
**Responsibilities:**
- Retrieve access token from HTTP-only cookie (server-side)
- Check token expiry and refresh if needed
- Call Google Calendar API with token
- Return events to agent (token hidden)
- Handle all errors gracefully

**Security Pattern:**
1. Agent calls `/api/get-events` (no credentials in request)
2. Server retrieves token from cookie (not accessible to JS)
3. Server calls Google API with token
4. Server returns events to agent
5. Token never exposed to agent

**Key Code:**
```typescript
// Step 1: Get token from server-side cookie
const accessToken = request.cookies.get('access_token')?.value;

// Step 2: Token is never exposed to JavaScript/browser
// (only available in this server function)

// Step 3: Call Google with token
const events = await getCalendarEvents(accessToken);

// Step 4: Return events (token is NOT in response)
return NextResponse.json({ events });
```

### `/lib/auth0.ts`

**Purpose:** Auth0 configuration and helpers  
**Exports:**
- `getAuth0Config()` — Get config from env vars
- `getLoginUrl()` — Build Auth0 login URL
- `exchangeCodeForToken()` — Exchange code for tokens
- `refreshAccessToken()` — Refresh expired tokens
- `isTokenExpired()` — Check token expiry

### `/lib/google-calendar.ts`

**Purpose:** Google Calendar API integration  
**Exports:**
- `getCalendarEvents()` — Fetch events from Google
- `formatEventTime()` — Format event timestamps

---

## 🔌 Integration Points

### Auth0 Integration

**OAuth Flow:**
```
Browser → /api/auth/login
  ↓
Auth0 Login Page
  ↓
User approves "read:calendar" scope
  ↓
Auth0 → /api/auth/callback (with code)
  ↓
/api/auth/callback exchanges code for token
  ↓
Token stored in HTTP-only cookie
```

**Token Vault:**
- Auth0 manages token storage on their servers
- We request tokens, Auth0 returns them
- We store in HTTP-only cookies
- We use cookies for subsequent requests

### Google Calendar API Integration

**OAuth Flow:**
- Auth0 handles OAuth (not us directly)
- Auth0 obtains `access_token` with `read:calendar` scope
- We receive token from Auth0
- We use token to call Google Calendar API

**API Call:**
```typescript
const response = await fetch(
  'https://www.googleapis.com/calendar/v3/calendars/primary/events',
  {
    headers: {
      Authorization: `Bearer ${accessToken}`, // From Auth0
    },
  }
);
```

---

## 🚀 Extending AgentPassport

### Add a New API (e.g., Slack)

**Step 1: Update Auth0 Scope**
```typescript
// In getLoginUrl()
scope: 'openid profile email read:calendar chat:write',
```

**Step 2: Create New Gateway Endpoint**
```typescript
// /api/send-slack-message/route.ts
export async function POST(request: NextRequest) {
  const slackToken = request.cookies.get('slack_token')?.value;
  
  if (!slackToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  const { channel, text } = await request.json();
  
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${slackToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel, text }),
  });
  
  const data = await response.json();
  return NextResponse.json(data);
}
```

**Step 3: Agent Uses New Endpoint**
```python
# ai-agent.py
response = requests.post(
  'http://localhost:3000/api/send-slack-message',
  json={'channel': '#general', 'text': 'Hello from AI!'}
)
```

### Add Rate Limiting

```typescript
// /lib/rate-limiter.ts
const requestCounts = new Map<string, number>();

export function checkRateLimit(userId: string, maxRequests = 100) {
  const count = (requestCounts.get(userId) || 0) + 1;
  requestCounts.set(userId, count);
  
  // Reset every hour
  setTimeout(() => requestCounts.delete(userId), 3600000);
  
  if (count > maxRequests) {
    return false; // Rate limit exceeded
  }
  return true; // Allow
}
```

### Add Request Logging

```typescript
// In /api/get-events/route.ts
console.log(`[${new Date().toISOString()}] GET /api/get-events`);
console.log(`User IP: ${request.headers.get('x-forwarded-for')}`);
console.log(`Token expires at: ${expiresAt}`);
console.log(`Events fetched: ${events.length}`);
```

---

## 📊 Data Models

### TokenResponse (from Auth0)

```typescript
interface TokenResponse {
  access_token: string;    // JWT token for calling external API
  refresh_token?: string;  // Token to refresh access_token
  expires_in: number;      // Seconds until expiry (usually 86400 = 24h)
  token_type: string;      // "Bearer"
  scope: string;           // "openid profile email read:calendar"
}
```

### CalendarEvent (from Google)

```typescript
interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;  // ISO 8601 datetime
    date?: string;      // ISO 8601 date (all-day events)
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
}
```

---

## 🧪 Testing

### Test Locally

```bash
# 1. Start dev server
pnpm dev

# 2. Test login flow
curl http://localhost:3000/api/auth/login

# 3. Test gateway (after login)
curl http://localhost:3000/api/get-events \
  -H "Cookie: access_token=..."

# 4. Test Python agent
python ai-agent.py
```

### Test in Production

```bash
# Update ai-agent.py with production URL
GATEWAY_URL = "https://your-domain.vercel.app"

# Run agent
python ai-agent.py

# Should see calendar events!
```

---

## 🛡️ Security Checklist

- [ ] HTTP-only cookies set with `httpOnly: true`
- [ ] Secure flag set in production: `secure: process.env.NODE_ENV === 'production'`
- [ ] SameSite flag set to Strict: `sameSite: 'strict'`
- [ ] Tokens never logged or exposed in errors
- [ ] Auth0 client secret stored in env vars (not in code)
- [ ] Google Calendar API calls use Bearer token
- [ ] Token expiry checked before every API call
- [ ] Refresh token used for token renewal
- [ ] Error messages don't expose sensitive info
- [ ] CORS headers not allowing all origins (default: restricted)

---

## 📈 Performance Considerations

### Token Caching
- Token stored in cookie, reused for multiple requests
- No repeated Auth0 calls for same user

### Lazy Token Refresh
- Only refresh when token is about to expire
- Don't refresh on every request (save API calls)

### Connection Pooling
- Google Calendar API connections reused
- Next.js handles this automatically

---

## 🔗 References

- [Auth0 Documentation](https://auth0.com/docs)
- [Google Calendar API](https://developers.google.com/calendar)
- [HTTP-Only Cookies](https://owasp.org/www-community/attacks/xss/)
- [OAuth 2.0 Authorization Code Flow](https://tools.ietf.org/html/rfc6749#section-1.3.1)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

This architecture is **production-ready**, **secure**, and **infinitely extensible**.
