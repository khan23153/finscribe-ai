# FinScribe Working Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the account-safe online finance service and restrained mobile interface that the Android APK will open.

**Architecture:** Keep Next.js and Clerk. Separate validated finance domain operations from HTTP authentication and presentation; persist new financial records in PostgreSQL. Reuse the current expense APIs, onboarding checks, and optional AI endpoint.

**Tech Stack:** Next.js 16.2.1, React 19, TypeScript, Prisma/PostgreSQL, Clerk, Tailwind, Zod, Vitest, and Playwright component tests.

**Spec:** `docs/superpowers/specs/2026-10-04-finscribe-android-design.md`

## Global Constraints

- This is an online Android app backed by the existing Next.js service.
- No offline editing, bank connectivity, payment processing, brokerage integration, notification delivery, native rewrite, or Play Store publication.
- Read relevant installed Next.js documentation under `node_modules/next/dist/docs/` before writing product code, as required by AGENTS.md.
- Use additive migrations; retain legacy Expense amounts and existing accounting-ledger records.
- New monetary storage uses integer paise. Financial ownership is derived from Clerk, never from request input.
- Default palette: canvas `#F6F5F1`, surface `#FFFFFF`, primary text `#202824`, secondary text `#5F6B64`, borders `#DDE2DC`, action `#28634B`.
- Use one system sans-serif family, tabular numerals, 4/8-pixel spacing, 12-pixel card corners, and at least 44-pixel touch targets.
- Phone destinations: Home, Expenses, Goals, More. Preserve both themes and 360-pixel layouts.
- The Android package contains no Clerk secret, database credentials, or Gemini key.
- Do not reset production databases, merge into main, or publish to an app store without authorization.

## Review Focus

1. Two accounts using one browser must never share financial records or automatically inherit old local data; test Tasks 2 and 6.
2. Concurrent Add savings requests must not lose contributions or exceed the goal target; test Task 2.
3. A lost response must not cause automatic duplicate writes, and a failed read must not display zero as confirmed data; test Tasks 3 and 5.
4. Old ledger balances may disagree with history; import must preview the discrepancy and preserve actual entries, tested in Task 6.
5. Large amounts, long names, enlarged text, and an open phone keyboard must not obscure controls or navigation; inspect Task 7.

## File structure and interfaces

Domain modules live under `src/lib/finance/`; HTTP adapters remain under `src/app/api/`; reusable interface controls live under `src/components/finance/`. Preserve routes instead of moving unrelated code.

`src/lib/finance/types.ts` owns these JSON-safe DTOs:

```ts
type GoalDto = { id: string; name: string; targetPaise: number; currentPaise: number; deadline: string; icon: string; createdAt: string }
type ContactDto = { id: string; name: string; type: 'Customer' | 'Supplier' | 'Friend'; phone: string; balancePaise: number }
type ContactEntryDto = { id: string; contactId: string; type: 'Paid' | 'Received'; amountPaise: number; date: string; note: string }
type PreferencesDto = { incomePaise: number; budgetPaise: number }
type CreateGoalInput = { name: string; targetPaise: number; currentPaise: number; deadline: string; icon: string; legacyId?: string }
type CreateContactInput = { name: string; type: ContactDto['type']; phone: string; legacyId?: string }
type CreateEntryInput = { contactId: string; type: ContactEntryDto['type']; amountPaise: number; date: string; note: string; legacyId?: string }
```

BigInt database fields are serialized to safe numeric DTOs after validating `0 <= value <= 100_000_000_000`. Stored dates serialize as `YYYY-MM-DD`. Legacy expense amounts remain rupee numbers.

Test scripts resolve to `vitest run` (`test`), `vitest run --config vitest.database.config.ts` (`test:db`), and `playwright test --config playwright-ct.config.ts` (`test:ui`). Create `vitest.database.config.ts` alongside Task 2's database setup; isolated unit tests must not require PostgreSQL. Browser fixtures are test-only and never enable an authentication bypass in Next.js.

### Task 1: Tested monetary, date, and EMI primitives

**Files:** Create `src/lib/finance/{types,money,dates,summary,emi}.ts`, `tests/finance/domain.test.ts`, `vitest.config.ts`; modify `package.json`, `package-lock.json`, `.github/workflows/ci.yml`, and `src/lib/expenses.ts`.

**Interfaces:** Produce `parseRupees(input: string): number | null` (paise), `formatPaise(paise: number): string`, `validDate(input: string): boolean`, `summarizeBudget(expenses: Expense[], budgetPaise: number, month: string): { spendPaise: number; remainingPaise: number | null; overspent: boolean }`, and `calculateEmi(principal: number, annualRate: number, months: number): { emi: number; totalInterest: number; totalPayable: number; rows: { month: number; principal: number; interest: number; balance: number }[] }`.

- [ ] Read the installed framework guides after locked dependency setup. Add Vitest and the `test` script as part of this task; use `npm ci` for existing dependencies and lock any additions.
- [ ] Write domain tests: `parseRupees('1.01') === 101`, `parseRupees('0.001') === null`, reject negatives/NaN/exponents, accept the documented upper bound; invalid `2026-02-30` is rejected. With one ₹125 expense in October and a ₹100 budget, assert `spendPaise === 12500`, `remainingPaise === -2500`, `overspent === true`.
- [ ] Add timezone regression: expense date `2026-10-01` belongs to October in both UTC and Asia/Calcutta. Assert zero-interest `calculateEmi(12000, 0, 12).emi === 1000`; amortization principal sums to the original principal within ₹0.01; reject zero/negative tenure and nonfinite inputs.
- [ ] Run `npm run test -- tests/finance/domain.test.ts`; confirm failures identify missing implementations rather than environment errors.
- [ ] Implement the listed signatures. Parse paise from decimal text without floating multiplication. Use date-only keys for period grouping; update existing date helpers consistently without reinterpreting legacy stored amounts.
- [ ] Run the focused tests under `TZ=UTC` and `TZ=Asia/Calcutta`, then `npm run check`. Commit the independently usable finance primitives and test configuration.

### Task 2: Account-scoped database services

**Files:** Modify `prisma/schema.prisma`; create `prisma/migrations/20261004000000_account_finance/migration.sql`, `src/lib/finance/{schemas,goals,contacts,preferences}.ts`, `tests/finance/database.test.ts`, and `tests/finance/database-setup.ts`.

**Interfaces:** Consume Task 1 DTOs/parsers. Produce `listGoals(ownerId: string)`, `createGoal(ownerId: string, input: CreateGoalInput)`, `addGoalSavings(ownerId: string, goalId: string, amountPaise: number)`, `removeGoal(ownerId: string, goalId: string)`, `listContacts(ownerId: string)`, `createContact(ownerId: string, input: CreateContactInput)`, `listContactEntries(ownerId: string)`, `createContactEntry(ownerId: string, input: CreateEntryInput)`, `readPreferences(ownerId: string)`, and `savePreferences(ownerId: string, input: PreferencesDto)`. Return the DTOs above; missing owned objects raise a typed `FinanceNotFoundError`.

- [ ] Add real PostgreSQL service tests using two synthetic database users and a dedicated test database. Assert an owner's Goal/Contact/Entry/Preferences never appears in another owner's list or mutation; a foreign contact cannot receive an entry.
- [ ] Add tests for concurrent savings contributions (₹40 + ₹30 to a ₹100 target yields ₹70), capped contributions (₹80 + ₹40 yields ₹100), and balance derivation (Paid ₹200, Received ₹75 yields positive ₹125). Repeat creation with an existing per-owner legacy ID must not duplicate a record.
- [ ] Run `npm run test:db -- tests/finance/database.test.ts`; confirm the migration/service tests fail for the intended missing behavior. Add `test:db` and temporary PostgreSQL CI service with isolated test credentials in this task.
- [ ] Add Goal, Contact, ContactEntry, and FinancialPreferences models and owner indexes; use BigInt for paise, date-only fields for transaction dates/deadlines, unique `[userId, legacyId]` import identifiers, and one preferences record per owner. Keep existing models and data unchanged.
- [ ] Implement schemas: names max 80, phone max 30, entry note max 160, bounded paise, supported enum values, and valid dates. Cap savings with an atomic PostgreSQL update scoped by both goal ID and owner ID. Aggregate balance from entries. No ledger removal operation is introduced.
- [ ] Apply all repository migrations to an empty temporary database with `npm run db:migrate`; run `npm run db:validate`, focused database tests, and `npm run check`. Commit schema, migration, services, and database tests.

### Task 3: Authenticated HTTP adapters and client read/write states

**Files:** Create `src/lib/finance/{authenticated-user,http,client}.ts`, `src/app/api/goals/route.ts`, `src/app/api/goals/[id]/route.ts`, `src/app/api/goals/[id]/savings/route.ts`, `src/app/api/contacts/route.ts`, `src/app/api/contact-entries/route.ts`, `src/app/api/preferences/route.ts`, and `tests/finance/http.test.ts`; modify `src/app/api/expenses/route.ts`.

**Interfaces:** Produce `getFinanceUser(): Promise<{ id: string; clerkId: string } | null>`, `fetchFinance<T>(url: string, init?: RequestInit): Promise<T>`, and `useFinanceResource<T>(url: string): { data: T | null; loading: boolean; error: string | null; reload: () => Promise<void> }`. Collection bodies are `{ goals }`, `{ contacts }`, `{ entries }`; individual responses use `{ goal }`, `{ contact }`, `{ entry }`, `{ preferences }`. Create payloads use validated paise fields; savings body is `{ amountPaise }`.

- [ ] Write route tests with test-only Clerk mocks and the Task 2 test database: unauthenticated 401, malformed JSON 400, invalid date 400, client-supplied owner rejected, foreign record 404, valid create 201, success responses `Cache-Control: no-store`. Verify expense ownership behavior survives helper extraction.
- [ ] Run `npm run test:db -- tests/finance/http.test.ts`; observe intended failures.
- [ ] Implement GET/POST collections, DELETE owned goal, POST savings, GET/PUT preferences, and the authentication/error adapters. Next route parameters use the installed version's asynchronous conventions. Never log credentials or complete financial request bodies.
- [ ] Implement the client helper: expose server errors, abort abandoned reads, retain null data on initial failures, and never automatically retry POST/PUT/DELETE. Add tests asserting one POST after a simulated lost response and distinguishing read failure from a successful empty array.
- [ ] Run route/client tests and `npm run check`; commit the usable account-scoped APIs and client states.

### Task 4: Shared visual system and navigation

**Files:** Modify `src/app/{globals.css,layout.tsx}`, `src/components/{DashboardShell,ThemeToggle}.tsx`; create `src/components/finance/{PageHeader,ReadState,ConfirmDialog}.tsx`, `src/app/dashboard/more/page.tsx`, `playwright-ct.config.ts`, `tests/ui/navigation.spec.tsx`, and `tests/ui/fixtures/{clerk-client,next-navigation}.tsx`; modify package scripts and lockfile for Playwright component tests.

**Interfaces:** Produce `PageHeader({ title, description?, action? })`, `ReadState({ loading, error, empty, onRetry, children })`, and `ConfirmDialog({ open, title, description, busy, onConfirm, onClose })`. Client-only test fixtures alias Clerk/navigation during component testing and are excluded from production app routes.

- [ ] Write component assertions for four bottom labels, current-route state, More links, default light theme, persisted dark selection, focus return after dialog dismissal, and an error/retry view that does not render children as loaded data.
- [ ] Run `npm run test:ui -- tests/ui/navigation.spec.tsx`; confirm expected visual/behavior failures.
- [ ] Implement spec palette and semantic roles; add deliberate dark equivalents (canvas `#151B18`, surface `#1D2621`, text `#EEF2EF`, muted `#A5B2A9`, border `#354138`, action `#80B89A`). Replace global zinc overrides with explicit semantic screen styling as each screen is migrated. Keep appropriate foreground contrast on filled actions.
- [ ] Implement mobile bottom navigation, desktop grouped sidebar, real More route, safe-area padding, common headers/states, and a native HTML dialog with accessible focus behavior. Remove shell glow and relocate the assistant to a labeled More action; shared dialogs must close on browser Back without losing the preceding page.
- [ ] Run component tests at 360 and 1280 pixels in both themes, inspect screenshots, and run `npm run check`. Commit the reusable interface shell.

### Task 5: Account-safe core finance screens and summaries

**Files:** Modify `src/app/dashboard/{page.tsx,expenses/page.tsx,goals/page.tsx,ledger/page.tsx,settings/page.tsx,reports/page.tsx}`; create `src/components/finance/{ExpenseList,GoalCard,ContactLedger}.tsx` and `tests/ui/finance-flows.spec.tsx`.

**Interfaces:** Consume Tasks 1–4 helpers and the exact Task 3 response shapes. Goal, ledger, and preferences screens read APIs rather than unscoped local-storage keys. Home consumes expenses plus preferences; Reports consumes the same date/amount primitives.

- [ ] Write component interaction tests using test-only provider fixtures and intercepted finance APIs: create goal, add savings, cancel/confirm removal; create contact and Paid/Received entries; save budget then render Home remaining/overspend; failed writes preserve input. Switching fixture accounts must issue new reads and never show the previous account's data while loading.
- [ ] Add assertions for expense create/filter/delete, retry after read failure, consistent Home/report totals, Set budget when unset, and confirmed empty data only after a successful response. Include long names and large amounts in fixtures.
- [ ] Run `npm run test:ui -- tests/ui/finance-flows.spec.tsx`; observe failures before screen changes.
- [ ] Implement mobile date-grouped expenses with search and equivalent desktop table; confirmed deletions and server-acknowledged mutations; goals-first layout; derived contact balances/history; validated income/budget settings; and Home summaries. Remove nonfunctional notification switches. Use `ReadState` for failures/loading/empty states.
- [ ] Share account-scoped reads through URLs/session-aware component lifetimes; clear stale state on auth transitions. Do not put account financial records in browser storage. Reports retain optional commentary without blocking deterministic totals.
- [ ] Run UI tests, domain/database tests affected by these flows, and `npm run check`. Inspect the core screens before committing.

### Task 6: Reviewable, idempotent legacy import

**Files:** Create `src/lib/finance/legacy-import.ts`, `src/app/api/finance-import/route.ts`, `src/components/finance/LegacyImport.tsx`, `tests/finance/import.test.ts`, and `tests/ui/import.spec.tsx`; modify Settings to expose the import.

**Interfaces:** Produce `readLegacyPreview(storage: Pick<Storage, 'getItem'>): LegacyPreview | null`. Define `LegacyPreview` in the same module: `goals: (CreateGoalInput & { legacyId: string })[]`, `contacts: (CreateContactInput & { legacyId: string })[]`, `entries: (Omit<CreateEntryInput, 'contactId'> & { legacyId: string; legacyContactId: string })[]`, `preferences: PreferencesDto | null`, `rejectedRecords: number`, and `discrepancies: { legacyContactId: string; storedPaise: number; calculatedPaise: number }[]`. POST body is `{ preview: LegacyPreview; replacePreferences: boolean }`; resolve entry references only against the signed-in owner's imported contacts inside one transaction. Return `{ imported: { goals: number; contacts: number; entries: number }; alreadyImported: boolean }`.

- [ ] Write database/UI tests: sign-in alone performs no import; only explicit confirmation sends the preview; repeated import produces no duplicate owned records; foreign IDs are rejected; malformed browser data cannot crash Settings; failed import leaves source data and review controls intact.
- [ ] Assert old contact stored balance ₹500 with Paid ₹200/Received ₹75 previews stored ₹500 versus calculated ₹125, and imports actual history without inventing a ₹375 adjustment. Preserve preferences unless the reviewed preview explicitly opts to replace existing server preferences.
- [ ] Run focused import tests; confirm missing behavior fails.
- [ ] Implement validated preview and explicit import choice. Use per-owner legacy IDs and one transaction; server side validates contact references within the imported/owned set. Display discrepancy counts and totals before confirmation. Mark success locally only after complete server acknowledgement; never delete original local data automatically.
- [ ] Run import tests and `npm run check`; commit the migration path.

### Task 7: Remaining screens, login, and complete visual verification

**Files:** Modify `src/app/page.tsx`, `src/app/sign-in/[[...sign-in]]/page.tsx`, `src/app/sign-up/[[...sign-up]]/page.tsx`, `src/app/onboarding/{quiz/page.tsx,result/page.tsx}`, `src/app/dashboard/{emi/page.tsx,news/page.tsx,stocks/page.tsx}`, `src/components/{AuthMarketingPanel,AIChatbot}.tsx`; create `tests/ui/secondary-screens.spec.tsx` and `docs/verification/finscribe-web.md`.

**Interfaces:** Consume `calculateEmi` and common UI controls. Preserve Clerk components, onboarding server metadata checks, existing `/api/ai` modes, source links, and signed-out redirects.

- [ ] Write interaction assertions for bounded/zero-interest EMI, expandable table, AI 503/error/timeout responses, onboarding submission failure with retained answers, and assistant access without covering content. Research is labeled generated educational research; no simulated live prices.
- [ ] Run the focused component tests before implementation; confirm the intended failures.
- [ ] Apply the semantic design to landing/auth/onboarding and all secondary screens. Replace decorative glows/emoji/glassy rotated cards and inconsistent text/background combinations. Use shared EMI calculation and make normal calculations independent of Gemini availability.
- [ ] Run all component tests and inspect screenshots for every route at 360/390/1280 widths in both themes. Inspect 200% text, long names/amounts, focus states, reduced motion, and mobile form focus/keyboard viewport resizing. Keep corrections in this task until controls remain accessible.
- [ ] Run `npm run test`, `npm run test:db`, `npm run test:ui`, `npm run check`, `npm run db:validate`, and `npm run build`. Record exact commands/results and whether browser cases used fixtures. Commit screen changes and verification notes.

### Task 8: Deployable service and live acceptance handoff

**Files:** Modify `.github/workflows/ci.yml`, `.env.example`, `README.md`, and `docs/verification/finscribe-web.md`.

**Interfaces:** Produce a tested HTTPS deployment URL for the Android plan. Requirements: valid Clerk configuration, applied PostgreSQL migrations, optional Gemini, and the exact tested commit. A repository branch is not evidence of deployment.

- [ ] Ensure CI runs lint/types/domain tests, PostgreSQL migration/service tests, component checks, and production build with explicit build-only credentials. Browser fixture aliases must not appear in production output.
- [ ] Establish available hosting/deployment access through supported connections or existing repository integration. Do not invent deployment access, put keys in source, or change production before a reviewed deployment is ready. If access is unavailable, document the exact blocker and continue all reproducible local checks.
- [ ] Against the configured test deployment, verify real login/onboarding, expense save/delete, goals and ledger after reopen, preferences across two sessions, account isolation, reports, sign out, and configured/unconfigured AI behavior. Record which checks remain unavailable without authorized test-account access.
- [ ] Confirm deployed version matches the tested source commit and record its URL, timestamp, migration status, and live results. Commit setup/verification documentation; proceed to the Android plan only with an actual redesigned deployment or explicitly label packaging as provisional.

## Execution and self-review

Recommended order is Tasks 1–8 in this session, followed by `2026-10-04-finscribe-android-package.md`. The account/API/UI interfaces are tightly connected; native execution avoids repeated context handoffs. A separate final review must compare the resulting branch and verification evidence to both the spec and plans.

Coverage check: spec interface screens map to Tasks 4, 5, and 7; data ownership/models/validation map to Tasks 1–3; import maps to Task 6; errors/accessibility map to Tasks 3–7; web deployment and truthful verification map to Task 8. Android-only criteria belong to the second plan. Plans require user review and execution selection before product implementation.
