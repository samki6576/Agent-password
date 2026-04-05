# 🚀 AgentPassport Lite — Quick Start

Get up and running in **5 minutes**.

---

## Step 1: Install Dependencies (1 minute)

```bash
pnpm install
```

---

## Step 2: Auth0 Setup (2 minutes)

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. **Create a new "Regular Web Application"**
3. Copy these from **Settings:**
   - `AUTH0_DOMAIN` → `your-auth0-domain.auth0.com`
   - `AUTH0_CLIENT_ID` → `your-client-id`
   - `AUTH0_CLIENT_SECRET` → `your-client-secret`
4. In **Allowed Callback URLs**, add:
   ```
   http://localhost:3000/api/auth/callback
   ```

---

## Step 3: Create .env.local (1 minute)

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Auth0 values:

```env
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 4: Start the Server (1 minute)

```bash
pnpm dev
```

Open **http://localhost:3000**

---

## Step 5: Test

1. Click **"Connect Google Calendar"**
2. Follow Auth0 OAuth flow
3. See your calendar events (fetched via secure gateway!)
4. Run AI agent: `python ai-agent.py`

---

## ✨ Done!

Your secure API gateway is running. Agents can now call `/api/get-events` without handling tokens.

---

## 📚 Next Steps

- Read **README.md** for full documentation
- Watch **DEMO_SCRIPT.md** for video tips
- Deploy to Vercel via **Settings** menu

---

## 🆘 Troubleshooting

**"No access token found"**
→ Click "Connect Google Calendar" and complete Auth0 login

**"Missing Auth0 environment variables"**
→ Check `.env.local` has all 4 values, restart dev server

**"Google Calendar API error"**
→ Enable Google Calendar API in [Google Cloud Console](https://console.cloud.google.com)

---

## 🎉 That's it!

You now have a production-ready secure API gateway using Auth0 Token Vault.
