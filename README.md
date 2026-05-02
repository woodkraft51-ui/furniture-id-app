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

## Vercel Deployment

1. Push this repo to GitHub
2. Import the repo at vercel.com/new
3. In **Project Settings → Environment Variables** add:
   - `ANTHROPIC_API_KEY` = your key (all environments)
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
