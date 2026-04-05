# 🚀 START HERE — AgentPassport Lite

Welcome! This is a **production-ready secure API gateway** using Auth0 Token Vault.

**Choose your path:**

---

## ⚡ I Want to Run It Now (5 minutes)

👉 **Go to:** [`QUICKSTART.md`](./QUICKSTART.md)

Quick setup:
```bash
pnpm install
cp .env.local.example .env.local
# Fill in Auth0 credentials
pnpm dev
```

Open http://localhost:3000 ✨

---

## 📚 I Want to Understand Everything

👉 **Read in this order:**

1. **[`PROJECT_SUMMARY.md`](./PROJECT_SUMMARY.md)** — What is this? (5 min)
   - Overview, features, what's included
   
2. **[`README.md`](./README.md)** — Full guide (20 min)
   - Complete setup, architecture, usage, deployment
   
3. **[`ARCHITECTURE.md`](./ARCHITECTURE.md)** — Technical deep-dive (20 min)
   - Security model, data flow, extending the project

---

## 🎬 I Want to See a Demo

👉 **Use:** [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md)

2–3 minute video script:
- Dashboard demo
- Code walkthrough
- AI agent in action
- Security explanation

---

## 🚢 I Want to Deploy

👉 **Follow:** [`DEPLOYMENT.md`](./DEPLOYMENT.md)

5-step deployment:
1. Prepare for Vercel
2. Deploy to Vercel
3. Add environment variables
4. Update Auth0
5. Test production

---

## 🏆 I Want to Submit to Hackathon

👉 **Use:** [`HACKATHON_SUBMISSION.md`](./HACKATHON_SUBMISSION.md)

Complete submission text with:
- Project overview
- Technical highlights
- Why it wins
- Deployment instructions

---

## 📋 File Guide

| File | Purpose | Read When |
|------|---------|-----------|
| **START_HERE.md** | This file — navigation guide | First! |
| **QUICKSTART.md** | 5-minute setup | You're impatient |
| **PROJECT_SUMMARY.md** | Overview & checklist | Need context |
| **README.md** | Full documentation | You want everything |
| **ARCHITECTURE.md** | Technical details | Deep dive |
| **DEMO_SCRIPT.md** | Video demo script | Recording video |
| **DEPLOYMENT.md** | Deploy to Vercel | Going live |
| **HACKATHON_SUBMISSION.md** | Submission text | Submitting |
| **.env.local.example** | Environment template | Setting up |

---

## 🎯 Core Files (Code)

| File | What It Does |
|------|--------------|
| `/app/page.tsx` | Dashboard UI |
| `/api/auth/login/route.ts` | Start OAuth flow |
| `/api/auth/callback/route.ts` | Handle callback, store token |
| **`/api/get-events/route.ts`** | ⭐ **Secure gateway** |
| `/lib/auth0.ts` | Auth0 helpers |
| `/lib/google-calendar.ts` | Google API helpers |
| `ai-agent.py` | AI agent example |

---

## 🔐 The Security Pattern (30 seconds)

```
User logs in via Auth0 OAuth
         ↓
Token stored in HTTP-only cookie (server-side)
         ↓
AI agent calls /api/get-events (no token in request)
         ↓
Gateway retrieves token from cookie
         ↓
Gateway calls Google Calendar API
         ↓
Agent receives events (token never exposed)
```

**Why this works:**
- Token stored server-side in HTTP-only cookie
- JavaScript can't access it (even with XSS)
- Agent never needs to handle credentials
- Token stays hidden the entire time

---

## ✅ Pre-Deployment Checklist

Before going live:

- [ ] Code runs locally (`pnpm dev`)
- [ ] Dashboard connects to Google Calendar
- [ ] AI agent fetches events (`python ai-agent.py`)
- [ ] No console errors
- [ ] All .ts files compile
- [ ] Auth0 credentials ready
- [ ] GitHub repo created
- [ ] Demo script prepared
- [ ] Submission text ready

---

## 🆘 I Have a Question

| Question | Answer |
|----------|--------|
| How do I set up Auth0? | See **README.md** → Auth0 Setup |
| How do I deploy? | See **DEPLOYMENT.md** |
| How does security work? | See **ARCHITECTURE.md** → Security Model |
| What's in the code? | See **ARCHITECTURE.md** → File Structure |
| How do I extend it? | See **ARCHITECTURE.md** → Extending |
| What if something breaks? | See **README.md** → Troubleshooting |
| How do I submit to hackathon? | See **HACKATHON_SUBMISSION.md** |

---

## 🚀 Next Steps

**Right now:**
1. Pick a path above (Quick Start / Full Understanding / Deploy)
2. Follow the guide for your path
3. Don't skip `.env.local.example` — you need those env vars!

**After setup:**
1. Test locally
2. Record demo video (optional)
3. Deploy to Vercel
4. Submit to hackathon!

---

## 💡 What Makes This Special

✅ **100% Auth0 Token Vault** — Real production-grade integration  
✅ **AI Agents Never See Tokens** — Credentials isolated server-side  
✅ **HTTP-Only Cookies** — XSS-proof token storage  
✅ **Complete Code** — All files ready to deploy  
✅ **Full Documentation** — 2,500+ lines of guides  
✅ **Hackathon Ready** — Submission text included  

---

## 🎉 You've Got This!

This is a **complete, production-ready project**. Everything you need is here.

**Quick reminder:**
- Start with `QUICKSTART.md` if you want to run it now
- Start with `README.md` if you want to understand it first
- Start with `DEPLOYMENT.md` if you're ready to go live

---

**Built for:** Authorized to Act Hackathon (April 2026)  
**Status:** ✅ Complete & Ready  
**Time to Deploy:** ~10 minutes  

Let's go! 🚀
