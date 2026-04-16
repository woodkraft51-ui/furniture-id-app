# NCW Furniture Identification Engine

American furniture identification — Field Scan + Full Analysis modes.

## Local Development

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local — add your Anthropic API key
npm run dev
# Open http://localhost:3000
```

## Vercel Deployment

1. Push this repo to GitHub
2. Import the repo at vercel.com/new
3. In **Project Settings → Environment Variables** add:
   - `ANTHROPIC_API_KEY` = your key (all environments)
4. Deploy — no other configuration needed

## Architecture

```
app/
  layout.tsx              Root layout
  page.tsx                Full application (client component)
  api/
    analyze/
      route.ts            Server-side Anthropic proxy (Edge runtime)
                          Adds x-api-key from ANTHROPIC_API_KEY env var
                          Key is never exposed to the browser
```

The browser calls `POST /api/analyze` with the Anthropic request body.
The route handler adds the API key and forwards to `api.anthropic.com`.

## Engine Modes

In `app/page.tsx`, near the top:

```js
const EVIDENCE_ADAPTER_MODE = "live"; // "mock" | "live"
const FULL_ANALYSIS_MODE    = "live"; // "mock" | "live"
```

Set both to `"mock"` for UI development without API calls.
