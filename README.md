# FinScribe AI

FinScribe AI is a Next.js personal-finance app for recording expenses, reviewing reports, calculating loan EMIs, and requesting educational AI analysis. It is designed for Indian currency and uses Clerk for authentication, PostgreSQL through Prisma for expense records, and the Gemini API for optional AI features.

## What works

- Authenticated onboarding and dashboard routes
- Per-user expense creation, listing, filtering, and deletion
- Current-month summaries, category breakdowns, and six-month trends
- Period-based expense reports and AI-assisted report commentary
- EMI calculation with a full amortization schedule
- Google Search-grounded finance news and stock research when Gemini is configured
- Browser-persisted goals, ledger entries, monthly budget, theme, and preferences
- Installable progressive web app with a mobile tab bar, home-screen icon, and offline screen

## Installing as an app

FinScribe ships a web app manifest (`src/app/manifest.ts`), icons (`public/icons/`), and a
service worker (`public/sw.js`). Over HTTPS, users can install it from Chrome or Edge
("Install app") or from Safari on iOS (Share → Add to Home Screen); Settings also shows an
install control. The service worker registers only in production builds. It caches
immutable build assets and serves `/offline` when a navigation fails; it never caches pages
or API responses, which are user-specific.

To change the app icon, edit `public/icons/icon.svg` and regenerate the PNG sizes listed in
the manifest.

Goals, contact-ledger data, and settings are currently stored only in the current browser. Stock research does not show live prices. Bank connections, portfolio syncing, notification delivery, and personalized investment advice are not implemented.

## Android app

`mobile/` contains a native Flutter app for Android that talks to this server's
API without sign-in: each install identifies itself with a random device key
(see `src/lib/request-user.ts`). GitHub Actions builds the APK. Setup, signing,
and the trade-offs of device keys are in [`mobile/README.md`](mobile/README.md).

## Requirements

- Node.js 20.9 or newer
- npm
- PostgreSQL
- A Clerk application
- A Gemini API key for AI, news, and stock-research features (optional)

## Local setup

1. Install the exact locked dependencies:

   ```bash
   npm ci
   ```

2. Copy the environment template and replace its placeholders:

   ```bash
   cp .env.example .env
   ```

3. Apply the database migrations:

   ```bash
   npm run db:migrate
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

### Existing legacy database

The migration history now includes an idempotent baseline followed by a schema-reconciliation migration. If an existing database already records one of the `202604...` migrations in its `_prisma_migrations` table, mark only the new baseline as applied before deployment, then apply pending migrations:

```bash
npx prisma migrate resolve --applied 00000000000000_baseline
npm run db:migrate
```

Back up production data before applying any schema migration.

## Validation

Run the repository checks before committing:

```bash
npm run check
npm run db:validate
npm run build
```

`npm run build` requires valid Clerk values and `DATABASE_URL`. `GEMINI_API_KEY` is not required to compile, but AI endpoints return `503` until it is configured.

## Main scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run check` | Run ESLint and TypeScript validation |
| `npm run build` | Generate Prisma Client and create a production build |
| `npm run db:validate` | Validate the Prisma schema |
| `npm run db:migrate` | Apply pending production migrations |
| `npm start` | Serve a completed production build |

## Security model

Dashboard routes require Clerk authentication; the API also accepts a mobile device key in place of a Clerk session, onboarding completion is stored in server-managed Clerk metadata, and expense mutations are scoped to the authenticated owner. AI prompts are selected on the server; clients cannot replace system instructions. Never commit `.env` files or credentials.
