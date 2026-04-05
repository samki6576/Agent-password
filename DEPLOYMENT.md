# 📦 AgentPassport Lite — Deployment Checklist

Deploy to Vercel in **5 steps**.

---

## ✅ Pre-Deployment Checklist

- [ ] Code is working locally (`pnpm dev` runs without errors)
- [ ] Calendar events load after Auth0 login
- [ ] `ai-agent.py` successfully fetches events
- [ ] All `.ts` files compile without errors
- [ ] No console errors in browser dev tools

---

## 🚀 Step 1: Prepare for Vercel

### 1.1 Create GitHub Repository (if not already done)

```bash
# Initialize git if needed
git init
git add .
git commit -m "AgentPassport Lite - Production Ready"

# Create repo on GitHub, then push
git remote add origin https://github.com/YOUR_USERNAME/agentpassport-lite.git
git branch -M main
git push -u origin main
```

### 1.2 Verify Project Structure

```bash
# These files should exist:
- /app/page.tsx                    # Dashboard
- /src/app/api/auth/login/route.ts
- /src/app/api/auth/callback/route.ts
- /src/app/api/get-events/route.ts # ⭐ Secure Gateway
- /src/lib/auth0.ts
- /src/lib/google-calendar.ts
- /package.json                    # Should have "jwt-decode": "^4.0.0"
- /.env.local.example
```

---

## 🚀 Step 2: Deploy to Vercel

### 2.1 Go to Vercel Dashboard

1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. **Import** your GitHub repository
4. Click **"Deploy"**

### 2.2 Wait for Build

Vercel will:
- Build your Next.js project
- Run `pnpm install`
- Run `next build`
- Deploy to CDN

**Status:** Check progress in Vercel dashboard (~1-2 minutes)

---

## 🚀 Step 3: Add Environment Variables

### 3.1 In Vercel Dashboard

1. Go to your project **Settings** → **Environment Variables**
2. Add these 4 variables:

| Variable | Value |
|----------|-------|
| `AUTH0_DOMAIN` | `your-auth0-domain.auth0.com` |
| `AUTH0_CLIENT_ID` | Your Auth0 Client ID |
| `AUTH0_CLIENT_SECRET` | Your Auth0 Client Secret |
| `NEXT_PUBLIC_APP_URL` | `https://your-vercel-domain.vercel.app` |

### 3.2 Get Your Vercel Domain

In Vercel Dashboard → **Deployments** → **Production**, copy the domain:

```
https://agentpassport-lite.vercel.app
```

Use this as your `NEXT_PUBLIC_APP_URL`.

### 3.3 Save and Redeploy

After adding env vars:
1. Click **"Save"**
2. Go to **Deployments**
3. Click the latest deployment → **"Redeploy"**

---

## 🔐 Step 4: Update Auth0

### 4.1 Auth0 Dashboard Setup

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Select your Application
3. Go to **Settings**

### 4.2 Update Allowed Callback URLs

Add your Vercel domain to **Allowed Callback URLs**:

```
https://agentpassport-lite.vercel.app/api/auth/callback
```

Your list should now have:
```
http://localhost:3000/api/auth/callback
https://agentpassport-lite.vercel.app/api/auth/callback
```

### 4.3 Update Allowed Logout URLs (Optional)

Add for logout:
```
https://agentpassport-lite.vercel.app
```

### 4.4 Save Changes

Click **"Save Changes"** at the bottom.

---

## 🚀 Step 5: Test Production

### 5.1 Visit Your Live App

Open your Vercel domain:
```
https://agentpassport-lite.vercel.app
```

### 5.2 Test Login Flow

1. Click **"Connect Google Calendar"**
2. You should be redirected to Auth0
3. Log in with your Google account
4. You should be redirected back to dashboard
5. Calendar events should load

### 5.3 Test AI Agent

Update `ai-agent.py` with your production URL:

```python
GATEWAY_URL = "https://agentpassport-lite.vercel.app"
```

Then run:
```bash
python ai-agent.py
```

You should see calendar events!

---

## ✅ Production Verification Checklist

- [ ] Vercel build successful (no errors in logs)
- [ ] Environment variables added to Vercel Dashboard
- [ ] Auth0 callback URLs updated
- [ ] Login flow works end-to-end
- [ ] Calendar events load in dashboard
- [ ] AI agent successfully fetches events
- [ ] No console errors in browser (F12 → Console)
- [ ] Domain works over HTTPS (check browser address bar)

---

## 🔒 Security Verification

- [ ] HTTP-only cookies are being set (Browser DevTools → Application → Cookies)
- [ ] Access token is in a Secure, HttpOnly cookie
- [ ] No credentials visible in network requests (Browser DevTools → Network)
- [ ] No secrets in public environment variables
- [ ] `AUTH0_CLIENT_SECRET` is only in Vercel (not in `.env.local` committed to git)

---

## 🐛 Troubleshooting

### Build Failed in Vercel

**Error:** "Command failed: next build"

**Solution:**
1. Run locally: `pnpm build` (see if there are TypeScript errors)
2. Fix errors
3. Commit and push
4. Vercel will auto-redeploy

### Login Redirects to Vercel Error Page

**Problem:** Callback URL mismatch

**Solution:**
1. Check Auth0 Settings → **Allowed Callback URLs**
2. Should include: `https://your-vercel-domain.vercel.app/api/auth/callback`
3. Check `NEXT_PUBLIC_APP_URL` in Vercel matches your domain

### Calendar Events Don't Load

**Problem:** Google Calendar API error

**Solution:**
1. Ensure Google Calendar API is enabled in [Google Cloud Console](https://console.cloud.google.com)
2. Check browser Console (F12) for error message
3. Verify Auth0 scopes include `read:calendar`

### "Missing Auth0 environment variables"

**Problem:** Env vars not found

**Solution:**
1. Check Vercel Dashboard → **Settings** → **Environment Variables**
2. All 4 variables should be listed
3. Click **"Redeploy"** to apply changes
4. Wait 1-2 minutes for redeploy to complete

---

## 📊 Monitoring (Optional)

### Vercel Analytics

1. Vercel Dashboard → **Analytics**
2. View:
   - Page load times
   - Error rates
   - Request volume

### Error Monitoring

Vercel automatically tracks:
- Build failures
- Runtime errors
- API errors (in logs)

Check **Functions** tab for API route errors.

---

## 🎉 You're Live!

Your AgentPassport Lite is now live on the internet!

**Share your URL:**
```
https://agentpassport-lite.vercel.app
```

**For Hackathon Submission:**
- Deployed URL
- GitHub repo link
- Demo video (optional)

---

## 🚀 Next Steps

1. **Record Demo Video** — Show dashboard + agent in action
2. **Write Submission Text** — Use `HACKATHON_SUBMISSION.md`
3. **Test Everything Again** — Ensure it's production-ready
4. **Share with Judges** — Send deployed URL + GitHub link

---

## 📝 Environment Variables Summary

| Variable | Example | Type |
|----------|---------|------|
| `AUTH0_DOMAIN` | `dev-abc123.auth0.com` | Secret |
| `AUTH0_CLIENT_ID` | `abcd1234efgh5678` | Secret |
| `AUTH0_CLIENT_SECRET` | `secret-key-here` | Secret |
| `NEXT_PUBLIC_APP_URL` | `https://agentpassport-lite.vercel.app` | Public |

**Important:** Only `NEXT_PUBLIC_*` variables are exposed to the browser. Auth0 secrets are server-side only.

---

## ✨ Deployment Complete!

Your production-ready AgentPassport Lite is now live. Agents can securely access Google Calendar through your gateway.

**Questions?** Check README.md or DEMO_SCRIPT.md
