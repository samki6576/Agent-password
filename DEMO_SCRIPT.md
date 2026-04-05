# AgentPassport Lite - Demo Video Script (2–3 minutes)

## 📹 Visual Setup

**Screen 1: Code Editor** showing the project structure  
**Screen 2: Dashboard** (localhost:3000)  
**Screen 3: Python Script** running AI agent  

---

## 📝 Script

### [0:00–0:15] Introduction

**[Visual: Show project repo]**

> "Hi, I'm demoing **AgentPassport Lite** — a production-ready security pattern for AI agents calling external APIs without ever seeing credentials.
>
> The problem: AI agents need access to APIs (Google Calendar, Slack, GitHub), but they can't safely handle OAuth tokens. Current solutions expose credentials to the agent or require complex token management.
>
> Our solution: **Auth0 Token Vault + a secure gateway.** The agent calls one endpoint, the gateway handles all credentials server-side."

---

### [0:15–0:45] Architecture Overview

**[Visual: Show README architecture diagram]**

> "Here's how it works:
>
> 1. User logs in via Auth0 OAuth
> 2. Auth0 Token Vault stores the access token server-side
> 3. The agent calls a simple gateway endpoint — `/api/get-events` — with NO token
> 4. The gateway retrieves the token from a secure HTTP-only cookie (invisible to JavaScript)
> 5. Gateway calls Google Calendar API
> 6. Agent receives events — token never exposed
>
> **This pattern scales:** One gateway per API, same security pattern."

---

### [0:45–1:15] Live Dashboard Demo

**[Visual: Click browser to dashboard at localhost:3000]**

> "Let me show the dashboard. This is the user-facing interface.
>
> **Click 'Connect Google Calendar'** [demonstrate Auth0 redirect]
>
> [Show Auth0 login screen]
>
> **The key point:** Auth0 handles OAuth, scopes are set to `read:calendar` only. Once authenticated, the token is stored in a **secure HTTP-only cookie** on the server.
>
> [After callback, show dashboard with connected state]
>
> **Here's the calendar:** These are real events pulled from Google Calendar through our secure gateway. The dashboard **never sees the raw token** — it only calls the gateway endpoint."

---

### [1:15–1:45] Code Walkthrough

**[Visual: Open `/api/get-events/route.ts`]**

> "Here's the core security magic — the `/api/get-events` endpoint.
>
> **Line 1:** This is a standard Next.js API route. Any AI agent can call it.
>
> **Line 15–20:** We retrieve the access token from the HTTP-only cookie. This is only accessible server-side — JavaScript can't see it.
>
> **Line 25–30:** We check if the token is expired. If so, we refresh it using Auth0 Token Vault.
>
> **Line 35–40:** We call Google Calendar API with the token.
>
> **Line 45:** We return events to the agent — **the token stays hidden.**
>
> **That's the pattern.** Simple, secure, production-ready."

---

### [1:45–2:15] AI Agent Demo

**[Visual: Open terminal, show `ai-agent.py`]**

> "Now let's see how an AI agent uses this. Here's a Python script — just 10 lines.
>
> [Show the script]
>
> **The agent makes one HTTP request** to `http://localhost:3000/api/get-events`. That's it. No token passing, no OAuth handling, no credentials anywhere.
>
> [Run the script: `python ai-agent.py`]
>
> [Show output: calendar events printed]
>
> **And it works.** The agent got calendar events without ever seeing the access token. The gateway handled everything."

---

### [2:15–2:45] Security Highlights

**[Visual: Show security checklist from dashboard or README]**

> "Why this wins for the hackathon:
>
> ✅ **100% Auth0 Token Vault** — Real integration, production-grade
>
> ✅ **Zero token exposure** — Agents never see credentials
>
> ✅ **HTTP-only cookies** — Automatic security, XSS-proof, no JavaScript access
>
> ✅ **Token refresh built-in** — Handles expiry automatically
>
> ✅ **Scoped access** — `read:calendar` only, minimal permissions
>
> ✅ **Instant deployment** — Deploy to Vercel in seconds
>
> This pattern works for ANY API — Google, Slack, GitHub, internal APIs. One gateway endpoint, infinite scalability."

---

### [2:45–3:00] Closing

**[Visual: Show deployed Vercel link or repo]**

> "This is **AgentPassport Lite** — the security pattern for AI agents in 2026.
>
> All code is open, fully documented, and ready to deploy. Auth0 Token Vault makes it all possible.
>
> Thanks for watching!"

---

## 🎬 Visual Checklist

- [ ] Start with repo/code overview
- [ ] Show README architecture diagram
- [ ] Click "Connect Google Calendar" button
- [ ] Show Auth0 redirect & login
- [ ] Show dashboard with connected state & events
- [ ] Open `/api/get-events/route.ts` and highlight key lines
- [ ] Show `ai-agent.py` 10-line script
- [ ] Run `python ai-agent.py` and show calendar events output
- [ ] Show security checklist/dashboard
- [ ] Show deployed URL or GitHub repo link

---

## 🎤 Key Talking Points (if asked)

**Q: Why not put tokens in the agent?**  
A: Tokens are long-lived secrets. If an agent is compromised, all its integrations are exposed. With Token Vault, we isolate credentials server-side.

**Q: Why HTTP-only cookies?**  
A: They're automatically sent with every request and invisible to JavaScript. An XSS attack can't steal them. Perfect for web apps.

**Q: How does token refresh work?**  
A: When the gateway detects an expired token, it uses the refresh token (also in a secure cookie) to get a new one from Auth0. Transparent to the agent.

**Q: Can this work for other APIs?**  
A: Yes. Auth0 supports OAuth for 1000+ apps. Add a new scope, create a new gateway endpoint, same pattern.

**Q: What about rate limiting or anomaly detection?**  
A: The gateway is the perfect place to add it. Log all API calls, detect unusual patterns, auto-revoke if needed.

---

## 📊 Estimated Video Length

- **Quick demo:** 2–2.5 minutes (just dashboard + agent)
- **Full demo:** 3–4 minutes (with code walkthrough)
- **Expert demo:** 5–6 minutes (architecture deep-dive + deployment)

**Recommendation for hackathon:** **2.5–3 minutes** — Just enough to show it works, secure, and is production-ready.
