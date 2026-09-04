# FinScribe AI

FinScribe AI is a Next.js personal-finance dashboard for recording expenses, reviewing reports, calculating loan EMIs, and requesting educational AI analysis. It is designed for Indian currency and uses Clerk for authentication, PostgreSQL through Prisma for expense records, and the Gemini API for optional AI features.

## What works

- Authenticated onboarding and dashboard routes
- Per-user expense creation, listing, filtering, and deletion
- Current-month summaries, category breakdowns, and six-month trends
- Period-based expense reports and AI-assisted report commentary
- EMI calculation with a full amortization schedule
- Google Search-grounded finance news and stock research when Gemini is configured
- Browser-persisted goals, ledger entries, theme, and preferences

Goals, contact-ledger data, and settings are currently stored only in the current browser. Bank connections, portfolio syncing, notification delivery, and personalized investment advice are not implemented.

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

Dashboard routes require Clerk authentication, onboarding completion is stored in server-managed Clerk metadata, and expense mutations are scoped to the authenticated owner. AI prompts are selected on the server; clients cannot replace system instructions. Never commit `.env` files or credentials.
