# Ask DeTLeng AI — Render setup

## What is ready

The repository now contains a Mastra agent, a Node/Express API and a consent-based chat panel. The directory is the knowledge source. The AI recommends up to three site IDs; the backend and browser resolve those IDs to approved directory URLs. Curated recommendations remain usable without online AI.

Mastra FRAMEWORK runs inside this Render service. No separate Mastra Platform project, Mastra API key, database, vector store or Supabase configuration is required. Do not connect the unrelated ExcelFlow AI Analyst project.

## 1. Push the code first

Use the Git checkout at `D:\DETLENG2\network-detleng-publish`. The original `network-detleng` folder has no Git metadata. Push package.json, package-lock.json, server/, config.js, ai-guide.js, .gitignore, .env.example, .node-version, this guide and the updated index.html/styles.css. Never commit a real API key or .env file.

## 2. Fill the Render New Web Service form

| Field | Value |
|---|---|
| Repository | Navid-Ishaq/network-detleng |
| Name | network-detleng-ai (or an available unique name) |
| Project | Optional; leave blank or choose the existing intended project |
| Language | Node |
| Branch | main |
| Region | Frankfurt (EU Central), for the Spain-based audience |
| Root Directory | Leave blank |
| Build Command | npm ci --omit=dev |
| Start Command | npm start |
| Instance | Free for an initial trial; sleeping/cold starts can delay first replies |
| Advanced → Health Check Path | /health |

Do not change the existing GitHub Pages custom domain. This is a separate API service.

## 3. Environment variables

Paste these non-secret settings with Render's Add from .env option, then replace the empty secret with your own Groq key in Render:

```dotenv
NODE_ENV=production
NODE_VERSION=22
GROQ_API_KEY=
AI_MODEL=groq/openai/gpt-oss-20b
ALLOWED_ORIGINS=https://network.detleng.com
DAILY_REQUEST_LIMIT=200
```

- `GROQ_API_KEY`: required for AI replies. Obtain from https://console.groq.com/keys and enter directly in Render. Do not send it in chat, put it in config.js or commit it.
- `AI_MODEL`: model router ID used by Mastra. Change only to a supported Groq model available to your account.
- `ALLOWED_ORIGINS`: comma-separated exact frontend origins, no trailing slash or paths. To test the UI on the Render URL too, append the actual Render origin. For local API testing append http://localhost:10000 if needed.
- `DAILY_REQUEST_LIMIT`: in-memory cap per running instance, resetting on UTC day change or service restart. It is not a durable provider spending cap; configure provider account limits separately. Per-client cap: 8 requests/minute; maximum 2 concurrent model calls.
- `PORT`: Render supplies it automatically. Code binds to 0.0.0.0 and uses PORT (local default 10000).
- No MASTRA_API_KEY, OPENAI_API_KEY, DATABASE_URL or frontend secret is used by this setup.

## 4. Connect the frontend after deployment

Render assigns the actual service URL. Open `/health` and `/api/status` on that URL. Health is liveness; `configured: true` indicates a key exists, NOT that a model call succeeded.

In config.js replace the blank apiBaseUrl with the EXACT actual Render URL (HTTPS, no trailing slash), for example:

```js
window.DETLENG_CONFIG = { apiBaseUrl: 'https://YOUR-ACTUAL-SERVICE.onrender.com' };
```

Push that config.js change. Then open network.detleng.com, open Ask DeTLeng AI, tick the data-sharing permission and send a test question. Without a URL on GitHub Pages, the curated guide works and AI shows unavailable. Blank config automatically uses same origin on localhost and *.onrender.com.

## 5. Acceptance checks after adding your key

- Ask which tool organizes documents: Arrange My Files; no claim that it uploads files to Naveed.
- Compare Business Flow and ExcelFlow AI; mention online data sharing for optional AI investigation.
- Ask to enter Student Chat: registered users only; no invented demo or private access.
- Ask about Speaking n8n: roadmap, not completed lessons.
- Ask for unknown capabilities: uncertainty + a requirements conversation.
- Try a provider error or temporary service outage: curated guide remains usable.
- Review desktop/mobile chat, consent, clear conversation, Escape/close and actual approved links.

## Privacy and operational scope

Question plus up to six recent messages are sent through Render to Groq only on explicit submission with consent. The application has no chat database or configured agent memory; page chat is held in browser memory. The service does not intentionally log prompt bodies. Render/Groq policies and platform logs still apply. Do not claim zero provider retention. The public endpoint has CORS and in-memory rate/concurrency limits; CORS is not authentication. For higher traffic use durable quota/abuse protection before scaling replicas.

Seven automated API tests passed locally using stub model responses. Installed Mastra agent initialization and JS syntax checks passed. No real provider response, deployed Render service, frontend-to-provider round trip or visual browser check has yet been verified. Provider credentials were not available. Live verification follows deployment.

Official references: https://render.com/docs/web-services · https://render.com/docs/node-version · https://mastra.ai/docs/agents/overview · https://mastra.ai/docs/agents/structured-output · https://mastra.ai/models/providers/groq
