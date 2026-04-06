# AgentPassport: Winning Hackathon Demo Script 🏆

*This script is designed for a **2:30–3:00 minute** video. It is optimized for a confident, professional delivery.*

---

## 🎬 Part 1: The Problem (0:00 - 0:30)

**[Visual: Show a dark terminal with an AI Agent (Python script) and a red "EXPOSED TOKEN" warning overlay]**

**Voiceover:**
"We love AI agents. They can schedule our meetings, scan our emails, and manage our lives. But they have a massive security flaw: **Token Sprawl.**

To give an agent access to your Google Calendar, you usually have to hand it a high-privilege OAuth token. If that agent is compromised, your entire digital identity is at risk.

Today, developers are forced to choose between **giving agents too much power** or **spending weeks building complex, fragile authentication layers.**"

---

## 🛡️ Part 2: The Pivot (0:30 - 1:00)

**[Visual: Show the AgentPassport Login Page at `/login`. Focus on the "Continue with Google" button and the "Shield" branding.]**

**Voiceover:**
"Introducing **AgentPassport**: The first Auth0-powered Token Vault and Secure Gateway for AI Agents.

Instead of directly integrating OAuth—which exposes apps to security risks and verification hurdles—we use **Auth0 Token Vault** to securely manage authentication and delegate access.

By leveraging Auth0’s Management API and Identity Platform, we isolate high-privilege secrets in a secure vault, giving your agents exactly what they need—and nothing more."

---

## 🚀 Part 3: The Dashboard & "Vaulted" Data (1:00 - 1:45)

**[Visual: Transition to the Dashboard. Point out the 'Vault Status: Encrypted' and 'Live Agent Logs'.]**

**Voiceover:**
"Welcome to the **Security Control Center.** 

Here, you can see our **Token Vault** in action. Auth0 has already handled the complex Google OAuth handshake. The high-privilege tokens are safely encrypted on the server, never touching the browser or the AI agent's context.

Look at our **Live Audit Logs.** You can see exactly which agents are requesting data. When 'Agent Butler' needs your calendar, it doesn't use a token. It calls our **Secure Gateway.**

The gateway retrieves the token from the Auth0 Vault, fetches the data, and returns only the necessary information. **Zero token exposure. Maximum security.**"

---

## 🤖 Part 4: The Agent in Action (1:45 - 2:30)

**[Visual: Split screen. Left: `ai-agent.py` code. Right: Terminal running the script.]**

**Voiceover:**
"And for the developers? It’s seamless. 

The agent doesn't need to know about OAuth, refresh tokens, or scopes. It makes one simple call to the AgentPassport Gateway. 

**[Visual: Highlight the 10-line Python script]**

As you can see, the agent gets the data it needs to be productive, while the credentials stay locked in the vault. We’ve turned a complex security nightmare into a 10-line integration. 

This works for ANY API Auth0 supports—from Google and Slack to GitHub and beyond."

---

## 🏁 Part 5: The Winning Close (2:30 - 3:00)

**[Visual: Show the GitHub repo and the "Winning Sentence" on screen.]**

**Voiceover:**
"This isn't just a calendar app. It's security infrastructure for the agentic future. 

By using **Auth0 as a Token Vault**, we’ve built a pattern that Google trusts, developers love, and users can rely on. 

My name is [Your Name], and this is **AgentPassport.** Securely bridging the gap between humans, agents, and data. Thanks for watching."

---

## 💡 Pro Tips for Your Recording:
1.  **Energy**: Speak with authority and enthusiasm. You’re solving a *real* problem.
2.  **Pacing**: Don't rush the "Security Audit Log" part—it's your most impressive visual.
3.  **The "Hook"**: Make sure the "red exposed token" at the start is very clear; it sets up the "hero" moment for Auth0.
