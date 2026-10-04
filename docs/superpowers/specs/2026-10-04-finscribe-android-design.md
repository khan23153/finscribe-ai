# FinScribe Android app and interface redesign

Status: proposed written specification, awaiting user review.

## Intent and agreed direction

The user asked to convert `khan23153/finscribe-ai` into a working app and replace the generic generated-looking UI. The user selected Android APK over an installable web app, then approved starting with the existing backend, a restrained finance interface, account-specific storage, and functional verification.

Success means an installable Android APK connected to the redesigned, deployed FinScribe service, with working login, onboarding, expenses, goals, contact ledger, budget summaries, reports, and EMI calculations. Core financial data survives app restarts and is isolated by account. Compilation alone does not establish that these flows work.

This is an online Android app backed by the existing Next.js service. Offline financial editing, a native Android rewrite, bank connectivity, payment processing, brokerage integration, notification delivery, and Play Store publication are outside this change.

## Repository findings

- Inspected `main` at `89ef0b3745ee61a9e9101e4baeb41a4c30cafa4a`.
- Next.js 16.2.1, React 19, Clerk authentication, PostgreSQL, and Prisma already implement the web service.
- No Android project, web app manifest, or Android build workflow exists.
- Expenses are authenticated database records. Goals, contact ledger entries, income, and budget are browser-local data with keys shared across accounts.
- Existing accounting ledger models do not match the contact-ledger screen's Customer/Supplier/Friend and Paid/Received concepts; the screen does not use those models.
- Settings collect income and budget, but Home does not use them. Notification toggles do not deliver notifications.
- UI styling mixes semantic theme variables with hard-coded zinc and green classes. The light-theme overrides do not cover all foreground/background combinations.
- The service URL present in repository metadata is `https://finscribe-ai.vercel.app`. Its public homepage returned HTTP 200 during inspection; authenticated flows and deployment ownership have not been verified.
- The repository has lint, TypeScript, Prisma validation, and production-build CI, but no dedicated functional test suite.

## Selected architecture and alternatives

Use the existing Next.js application as the single interface and server, and add an Android Trusted Web Activity package using Android Browser Helper. The Android launch URL is the configured HTTPS service's `/dashboard`; normal Clerk redirects handle signed-out users and unfinished onboarding.

This preserves same-origin authenticated API calls and browser-based sign-in rather than introducing an embedded WebView authentication implementation. Full-screen operation requires Digital Asset Links connecting the deployed origin with the actual APK signing certificate. Until verification succeeds, the browser may present Custom Tab chrome; this must be reported honestly.

Alternative 1: a fully native Android client would offer deeper platform integration and could support offline editing, but would require a separate interface, mobile authentication, and synchronization layer. Alternative 2: a remote WebView wrapper is smaller initially but adds sign-in and navigation complications. Neither is selected for this scope.

There are three independently understandable units: the Next.js interface, authenticated finance APIs/database, and Android launcher/build package. The Android package contains no Clerk secret, database credentials, or Gemini key.

## Interface design

### Visual system

Default to a warm light palette: canvas `#F6F5F1`, surface `#FFFFFF`, primary text `#202824`, secondary text `#5F6B64`, borders `#DDE2DC`, and primary action `#28634B`. Dark mode uses the same semantic roles with independently checked contrast. Keep visible keyboard focus and distinct destructive-action states.

Use one consistent system sans-serif family, normal sentence case, tabular numerals for amounts, a 4/8-pixel spacing rhythm, and 12-pixel card corners. Financial amounts carry hierarchy; secondary explanations remain readable. Avoid decorative neon glows, pulsing AI buttons, rotated floating cards, gratuitous gradients, and emoji-led financial cards. Charts may use additional subdued colors, paired with category labels.

### Navigation and layout

Phone navigation has four labeled bottom destinations: Home, Expenses, Goals, More. More is a real route listing Ledger, Reports, EMI calculator, Research, News, and Settings. Desktop keeps a compact grouped sidebar using the same destination names. A small shared page header supplies title and contextual actions.

Respect safe-area insets, keep content above bottom navigation, and preserve access to controls when the keyboard opens. Use at least 44-pixel touch targets. Financial tables scroll within their own region; the whole page must not overflow horizontally at 360-pixel width. Dialogs have labels, focus management, escape/back dismissal, and errors that preserve entered values.

### Screens

| Screen | Resulting behavior |
| --- | --- |
| Home | Month label, monthly spending as the primary metric, budget remaining or overspend state, compact trend, labeled category breakdown, recent expenses, and an Add expense action. Show Set budget when no limit exists. |
| Expenses | Search/filter controls, date-grouped transaction list on phones, equivalent desktop table, compact add form, visible save/delete progress, and refresh after successful changes. Preserve existing create/list/filter/delete functionality. |
| Goals | Saved goals appear before the creation form. Use descriptive icons, target/current amount, deadline, labeled progress, and Add savings. Confirm removal. |
| Ledger | Contact list with balances derived from entries; choose a contact to record Paid/Received. History includes date, contact, amount, and note. Explicitly explain what positive and negative balances mean. |
| Reports | Period selector, spending totals and categories derived from the same expense records as Home, optional AI commentary, and clear unavailable/error states. |
| EMI | Readable amount/rate/tenure controls, calculation summary, and expandable amortization schedule. Validate bounds and zero-interest behavior. |
| Research and News | Retain existing optional AI-backed features. Clearly distinguish generated research from a live brokerage feed. Missing AI configuration does not break core finance screens. |
| Settings | Account controls, theme, validated income/budget preferences, and sign out. Remove nonfunctional notification toggles from the active settings flow. |
| Login and onboarding | Apply the same visual system, retain Clerk and server-managed onboarding checks, and preserve external authentication navigation. |
| Landing | Match the finance visual system and describe the functionality actually delivered. |

The assistant is available through an explicitly labeled action or More destination, without a permanent animated control obscuring mobile content. Unsupported bank/portfolio features remain absent rather than becoming pretend working buttons.

## Financial data and API behavior

### Account ownership

Keep Clerk as the identity authority. Centralize authenticated database-user lookup. Every query and mutation derives the owner from the session; request bodies never select the owner. Validate referenced contacts/goals against that owner before mutation. An object ID belonging to another user behaves as not found. Disable caching of account-specific responses.

### Models

- Retain existing Expense records and APIs; do not rewrite legacy expense storage or silently alter existing amounts in this change.
- Add `Goal`: owner, name, integer target/current paise, deadline as a date, icon identifier, timestamps, and optional legacy import identifier. Adding savings is atomic, positive, and capped at the target.
- Add `Contact`: owner, name, Customer/Supplier/Friend type, optional phone, timestamps, and optional legacy import identifier.
- Add `ContactEntry`: owner, owned contact, Paid/Received type, positive integer amount in paise, transaction date, note, timestamps, and optional legacy import identifier. Calculate balance as Paid minus Received; do not maintain a second editable balance.
- Add one `FinancialPreferences` record per owner with integer income/budget paise and timestamps. Zero is valid for income; a missing/zero budget means no active spending limit.
- Preserve existing unused accounting-ledger models and records. New contact-ledger tables avoid repurposing incompatible accounting entities.

Use additive migrations. Check their application against a temporary PostgreSQL database and the repository's existing migration history. Do not reset or modify production databases during development.

### Operations and validation

Provide authenticated goals list/create/add-savings/delete, contacts list/create, contact entries list/create, and preferences read/update operations. Keep the public screens' existing behavior without adding unrelated account-management features.

New monetary storage uses integer paise. Validate finite numeric inputs, at most two fractional digits, realistic upper bounds, trimmed strings, valid calendar dates, and supported enum values. Shared formatting consistently displays INR using Indian digit grouping. Reject malformed JSON with a useful 400 response, unauthenticated requests with 401, and unknown owned records with 404.

Use the same date-only semantics for expense periods, goal deadlines, and ledger dates; tests must cover month boundaries and the user's Asia/Calcutta timezone. New records appear only after successful server acknowledgement. Failed writes retain form contents and offer retry. Avoid automatic retries of financial mutations unless protected by an idempotency key.

### Existing browser data

Never silently attach shared legacy browser data to whichever account signs in first. If legacy goals/ledger/preferences are detected, offer a reviewable import into the signed-in account. Preview names, counts, and amounts; import only after the user chooses it. Server validation and per-owner legacy identifiers prevent duplicates when import is repeated. Only mark local records imported after all relevant server writes succeed. Imported ledger balances are derived from history; inconsistent old stored balances are shown in the preview rather than fabricated as transactions.

Theme can remain device-local. Financial records and preferences cannot use unscoped browser persistence after this change.

## Android packaging and deployment

- Add an `android/` Gradle project, pinned wrapper and dependencies, launcher icon, application label FinScribe, and package ID `com.finscribe.app`.
- Support Android 8.0 and later; choose a currently supported compile/target SDK during implementation after checking official requirements and available build tooling.
- Configure the service origin through a build property, defaulting to the repository's existing HTTPS URL. Reject non-HTTPS release configuration. Preview builds must point to the preview deployment containing the same changes, rather than merely opening the old production UI.
- Add a public, unauthenticated `/.well-known/assetlinks.json` response with the app package and the configured signing certificate fingerprints. This path and public install assets must not be intercepted by login/onboarding checks.
- Add a web manifest, icons, standalone appearance, and a static offline/retry page. A narrowly scoped service worker may serve public install assets and that offline page; it must not cache authenticated pages, financial APIs, Clerk responses, or generated AI content.
- Android Back follows navigation history and returns from external login/research destinations correctly. Authentication-origin changes may show browser chrome until the user returns to the verified app origin.
- Add a reproducible CI debug APK job and upload the APK plus signing certificate fingerprint. Production signing is optional and uses injected secrets; never commit a private release key. Document that debug builds signed with different keys cannot update each other.
- Configure asset links against the certificate that signed the delivered APK. Do not disable origin verification to make a screenshot appear full-screen.
- The APK depends on a deployed Next.js backend with valid Clerk and PostgreSQL configuration. AI additionally needs Gemini configuration. Repository access is available; deployment-service access and authenticated test credentials are not yet established. Request supported connection/configuration when needed, and do not solicit secrets in source files or claim that deployment occurred without evidence.

## Error handling and accessibility

Loading, empty, error, unauthenticated, AI-unavailable, and offline are separate visible states. An API failure must not render zero balances as if data loaded successfully. Retry is available for failed reads. Destructive actions name what will be removed and wait for the result before leaving the screen.

Test both themes, keyboard navigation, screen-reader labels, enlarged text, reduced motion, touch targets, dialog focus, and chart labels. Do not communicate category or overspend meaning solely through color. Existing browser data import is optional and never blocks access to the app.

## Validation and acceptance criteria

1. Run `npm run check`, `npm run db:validate`, and `npm run build`; read the installed Next.js documentation required by AGENTS.md before implementation.
2. Run database-backed tests for validation, two-account isolation, atomic savings updates, derived ledger balances, repeat imports, and preferences persistence.
3. Test money parsing/formatting, date boundaries, budget remaining/overspend calculations, report totals, EMI zero-interest/bounds, and amortization totals.
4. Exercise login, onboarding, expense create/filter/delete, goal save/add-savings/remove, contact/entry creation, preference updates, report selection, sign out, and reload/reopen behavior. Clearly identify any scenarios verified with fixtures rather than a live authenticated deployment.
5. Render and inspect all routes at 360/390-pixel phone widths and a desktop width in both themes. Inspect long contact names, large amounts, empty lists, error messages, form keyboards, and bottom-nav overlap.
6. Build the debug APK, inspect its package/launch configuration, and install/run it on an Android emulator or device when available. Check login redirects, Back, relaunch, browser fallback, lost-network retry, and Digital Asset Links verification. Report unavailable device verification explicitly.
7. Confirm the APK opens the deployment with these changes. A successful APK build pointing to an unchanged site is not delivery of the redesigned app.
8. Deliver a reviewable GitHub change, a downloadable tested APK, short setup/signing instructions, and a precise statement of any remaining configuration or unverified runtime paths. Do not merge into main or publish to an app store without authorization.

## Review checkpoints

The user has approved the general direction. This written specification still needs review under the brainstorming workflow. After its approval, write the implementation plan and let the user select execution. Product implementation has not begun at the time of this specification.

## Primary technical references

- https://developer.android.com/develop/ui/views/layout/webapps/trusted-web-activities
- https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2
- https://github.com/GoogleChrome/android-browser-helper

