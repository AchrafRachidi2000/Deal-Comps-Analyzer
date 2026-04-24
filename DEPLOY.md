# Deploying to Vercel

The frontend is a Vite React SPA; the backend lives as **Vercel Serverless Functions** under `api/`. Local development continues to use the Vite middleware plugin — no change to the `npm run dev` flow.

## 1. Required environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (Production **and** Preview scopes):

| Variable | Purpose |
|---|---|
| `PERPLEXITY_API_KEY` | Perplexity `sonar-pro` — peer discovery + company enrichment |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI — query parsing, insights, assistant tool-calling |
| `AZURE_OPENAI_ENDPOINT` | e.g. `https://alpha10x-open-ai.openai.azure.com/` |
| `OPENAI_API_VERSION` | e.g. `2024-10-21` |

Optional: `GEMINI_API_KEY` is already in `vite.config.ts` as a client-side exposure — only needed if anything still reads it. (Nothing currently does.)

**Do not** commit `.env`. The repo-level `.env` is dev-only.

## 2. First deploy

Assuming the repo is pushed to a Git provider Vercel supports (GitHub / GitLab / Bitbucket):

1. Go to https://vercel.com/new and import the repo.
2. Vercel auto-detects Vite. Build settings are already defined in `vercel.json`:
   - Build command: `vite build`
   - Output dir: `dist`
   - Framework: `vite`
3. Add the four env vars above before clicking Deploy.
4. Deploy.

After the first deploy, every push to the default branch triggers a new production deploy; every push to other branches creates a preview deploy with its own URL.

## 3. Function timeouts — plan matters

`vercel.json` requests these `maxDuration` values per function:

| Function | Requested max | Typical runtime |
|---|---|---|
| `api/assistant/chat` | 60s | 10–40s (discovery + Yahoo + insights in one SSE stream) |
| `api/peers/discover` | 60s | 5–15s |
| `api/company/enrich` | 30s | 2–5s |
| `api/query/parse-filters` | 30s | 1–2s |
| `api/insights` | 30s | 2–5s |
| `api/peer/[ticker]` | 15s | 0.5–2s |

**Plan limits:**
- **Hobby** caps all functions at **10s**. `assistant/chat`, `peers/discover`, `company/enrich`, `insights` WILL time out on cold starts or slower peer sets. The Q&A / exclude / include / regenerate-insights paths of the assistant still fit in 10s.
- **Pro** ($20/mo) raises the cap to **60s** — requirement for the full run-search pipeline.
- **Enterprise** goes to 900s.

If you deploy on Hobby, the `run_search` and `update_filters` assistant tools will fail with timeout errors. Everything else works.

## 4. SSE on Vercel

`api/assistant/chat.ts` writes Server-Sent Events via `res.write()`. Vercel's Node runtime supports this directly; no Edge runtime needed. The `x-accel-buffering: no` header tells any intermediate proxies not to buffer the stream.

## 5. Verification after first deploy

After the deploy succeeds, hit these from your terminal to confirm the endpoints work:

```bash
# Substitute your actual deploy URL
BASE=https://<your-project>.vercel.app

# 1. Yahoo ticker fetch
curl -s $BASE/api/peer/RMD | head -c 400

# 2. Perplexity discovery (~10s)
curl -s "$BASE/api/peers/discover?company=ResMed&sector=Medical%20Devices" | head -c 400

# 3. Azure query parse (~2s)
curl -s -X POST $BASE/api/query/parse-filters \
  -H 'content-type: application/json' \
  -d '{"query":"AI companies above $1B in the US"}'

# 4. Azure insights (~3s) — paste in a small peer array
curl -s -X POST $BASE/api/insights \
  -H 'content-type: application/json' \
  -d '{"targetCompany":"ResMed","peers":[{"ticker":"RMD","companyName":"ResMed","country":"US","marketCap":32000,"enterpriseValue":31400,"revenueLTM":5398,"ebitdaLTM":2025,"ebitdaMargin":37.5,"revenueGrowthYoY":11,"evRevenueLTM":5.8,"evEbitdaLTM":15.5,"peLTM":21.7,"revenueNTM":6061,"ntmRevenueGrowth":7.5,"evRevenueNTM":5.18,"netDebtToEbitda":-0.28}]}'

# 5. Assistant SSE stream
curl -sN -X POST $BASE/api/assistant/chat \
  -H 'content-type: application/json' \
  -d '{"state":{"mode":"landing","targetCompany":"","peers":[]},"messages":[{"role":"user","content":"Find me AI companies above $1B in the US"}]}' | head -c 2000
```

Then open the deploy URL in a browser and run the full user journey:
- Landing → By Company → "Alpha10x" → Research → Run → dashboard populates
- Open the assistant, say "exclude PLTR" → should stream status + patch
- Say "tighten market cap to $1–5B" → should re-run discovery (needs Pro plan)

## 6. Local development is unchanged

`npm run dev` still works exactly as before. The Vite middleware plugin in `src/server/peerApiPlugin.ts` imports from the same shared modules (`src/server/{yahoo,perplexity,azure,assistant}.ts`) that the Vercel functions use. Any backend code change needs to be made once and applies to both environments.

## 7. Known deploy-time gotchas

- **`better-sqlite3` in `dependencies`** is currently unused. If Vercel build fails on native-module compilation, remove it from `package.json` — the app does not reference it.
- **`yahoo-finance2` is unofficial.** Yahoo occasionally rotates cookies/crumbs; the library handles this automatically, but a sudden spike of 4xx responses in production usually means Yahoo changed something and the package needs an update (`npm update yahoo-finance2`).
- **`.env` is not deployed.** All env vars must be set in the Vercel dashboard. If `assistant/chat` 500s with "AZURE_OPENAI_API_KEY missing in environment", the env vars were not configured for the Production scope.
