# Proof Sleuth

Evidence-based identification, dating, and valuation for American antique furniture. Field Scan for buyers in the wild, Full Analysis for depth.

A product of New Creations Woodcraft.

## Local Development

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local — add your Anthropic API key
npm run dev
# Open http://localhost:3000
```

## Render Deployment

Deploy config lives in the repo as a Render Blueprint (`render.yaml`): a long-running
Node web service (`next start`) that auto-deploys on every push to `main`.

1. Push this repo to GitHub
2. Render Dashboard → **Blueprints → New Blueprint Instance**, pointed at this repo
   (if a Web Service already exists, give it the same `name` as in `render.yaml` so the
   Blueprint manages it instead of creating a duplicate)
3. Set `ANTHROPIC_API_KEY` in the Render dashboard (it is `sync: false` in `render.yaml`,
   so it is never committed)
4. Deploy — no other configuration needed

## Architecture

```
app/
  layout.tsx              Root layout, metadata, global header
  page.tsx                Full application (client component)
  api/
    analyze/
      route.ts            Server-side Anthropic proxy (Node runtime)
                          Adds x-api-key from ANTHROPIC_API_KEY env var
                          Key is never exposed to the browser
lib/
  engine.ts                  Phase 0–7 reasoning engine
  store.ts                   In-memory case store
  intake.ts                  Intake configuration and photo guidance
  fieldScan.ts               Field Scan output shaper
  makerMarks.ts              Maker mark constraint library
  historicalClueLibrary.ts   Clue indicator and weighting library
  conflictResolution.ts      Conflict patterns and narrative composer
  constants.ts               WM tier weights and conflict resolution rules
```

The browser calls `POST /api/analyze` with the Anthropic request body. The route handler adds the API key and forwards to api.anthropic.com.

## Modes

Proof Sleuth runs in two modes selected at the start of each scan:

- **Field Scan** — buyer-facing, friction-minimized, BUY/CONSIDER/PASS recommendation
- **Full Analysis** — deeper intake, segmented valuation, photo-coached
