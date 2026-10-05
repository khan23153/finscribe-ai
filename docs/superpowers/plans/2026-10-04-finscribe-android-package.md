# FinScribe Android Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver an installable Android APK opening the tested, redesigned FinScribe service with verified origin trust and honest runtime evidence.

**Architecture:** Add Android Browser Helper's Trusted Web Activity launcher to the same repository. Configure the hosted HTTPS origin and signing certificate explicitly; keep authentication and finance inside the browser-backed Next.js service. Only static install assets and an offline/retry page may be cached.

**Tech Stack:** Android Gradle project, Android Browser Helper, Java/JDK, Android SDK, Next.js manifest/asset-links routes, GitHub Actions, and Playwright.

**Spec:** `docs/superpowers/specs/2026-10-04-finscribe-android-design.md`

## Global Constraints

- This is an online Android app backed by the existing Next.js service.
- Support Android 8.0 and later; choose a currently supported compile/target SDK during implementation after checking official requirements and available build tooling.
- Application label FinScribe; package ID `com.finscribe.app`.
- The Android package contains no Clerk secret, database credentials, or Gemini key.
- Configure the service origin through a build property, defaulting to `https://finscribe-ai.vercel.app`; reject non-HTTPS release configuration.
- Preview builds must point to the preview deployment containing the same changes, rather than merely opening the old production UI.
- Do not cache authenticated pages, financial APIs, Clerk responses, or generated AI content.
- Full-screen operation requires Digital Asset Links and the actual APK signing certificate; do not disable origin verification.
- Never commit a private release key. Production signing is optional and uses injected secrets.
- Do not merge into main or publish to an app store without authorization.

## Review Focus

1. APK built against the old deployment must not be described as delivering the redesign; verify Task 3 source/version evidence.
2. Different debug signing keys must not silently be treated as update-compatible; inspect certificate and document Task 2.
3. Login leaves the app origin and returns; verify browser fallback and Back in Task 3.
4. Lost network must show retry without exposing cached financial data; assert service-worker behavior in Task 1 and device behavior in Task 3.
5. Asset-links route must be publicly available despite Clerk middleware; test Task 1 and verify the deployed route in Task 3.

## File structure

Android project files live under `android/`. Public install/offline assets live under `public/`; Next routes provide deployment-specific manifest/trust metadata. Build/verification scripts live under `scripts/`. Android artifacts are CI outputs, not tracked binaries.

### Task 1: Public install metadata and restricted offline behavior

**Files:** Create `src/app/manifest.ts`, `src/app/.well-known/assetlinks.json/route.ts`, `src/lib/android-config.ts`, `public/{icon.svg,offline.html,sw.js}`, `src/components/InstallServiceWorker.tsx`, `tests/android/install-metadata.test.ts`, and `tests/ui/offline.spec.ts`; modify `src/proxy.ts`, `src/app/layout.tsx`, and `.env.example`.

**Interfaces:** Produce `readAndroidConfig(env: NodeJS.ProcessEnv): { origin: string; fingerprints: string[] }`. Origin comes from `FINSCRIBE_APP_ORIGIN`; certificate fingerprints from `ANDROID_SHA256_CERT_FINGERPRINTS` (comma-separated valid SHA-256 fingerprints). Asset-links responses contain relation `delegate_permission/common.handle_all_urls`, namespace `android_app`, package `com.finscribe.app`, and actual configured fingerprints. Missing fingerprints yield `[]`, never invented trust.

- [ ] Write tests asserting invalid/non-HTTPS configured origins fail validation, malformed fingerprints are rejected, valid configuration creates exact package/relation/fingerprint entries, manifest start URL is `/dashboard`, and install metadata paths are public in the proxy matcher.
- [ ] Write service-worker tests proving `/api/expenses`, `/dashboard`, Clerk-origin URLs, and `/api/ai` are never stored in Cache Storage; navigation failure displays a static page with Reload and no account data.
- [ ] Run `npm run test -- tests/android/install-metadata.test.ts` and `npm run test:ui -- tests/ui/offline.spec.ts`; confirm intended failures.
- [ ] Implement public trust metadata, standalone manifest, code-native icons, theme colors, static offline/retry page, and narrowly allowlisted worker caching. Register only in production on HTTPS, and remove obsolete caches containing app navigation/API responses.
- [ ] Run focused tests, `npm run check`, and `npm run build`; inspect install assets and offline page. Commit the independently usable web install support.

### Task 2: Reproducible Android launcher and APK build

**Files:** Create `android/{settings.gradle.kts,build.gradle.kts,gradle.properties,gradlew,gradlew.bat}`, pinned Gradle wrapper files, `android/app/build.gradle.kts`, `android/app/src/main/AndroidManifest.xml`, Android string/color/icon resources, `scripts/verify-android-config.mjs`, `.github/workflows/android.yml`, and `docs/android/setup.md`; modify `.gitignore` and README.

**Interfaces:** Produce `./android/gradlew -p android assembleDebug -PfinscribeOrigin=<HTTPS_ORIGIN>`, package `com.finscribe.app`, launch `/dashboard`, and CI artifacts `finscribe-debug.apk` plus `signing-certificate.txt`. Workflow input `app_origin` controls the target deployment. Release signing uses environment-injected keystore path/password/alias values and does not default to a debug key.

- [ ] Add configuration tests asserting exact label/package/minimum API 26, HTTPS origin enforcement, launch URL, no auth/database/AI secrets in APK resources, and no verification-disable flags.
- [ ] Run `node scripts/verify-android-config.mjs` against missing/invalid project configuration; confirm failures identify the configuration rather than assuming an APK exists.
- [ ] Check official Android/Gradle/Browser Helper compatibility documentation, then pin compatible versions and wrapper checksum in the project. Add Browser Helper launcher activity with documented intent/URL handling, application assets, browser-support fallback, and proper Android manifest export/launcher settings. Use Java resources/manifest configuration unless a custom Activity is required; do not add Kotlin solely for scaffolding.
- [ ] Build with the actual redesigned deployment URL. CI validates HTTPS input, runs the Gradle build, verifies APK metadata, extracts the real SHA-256 signing fingerprint with `apksigner`, and uploads APK/fingerprint together. Provide instructions for optional stable release signing and mismatched debug update keys.
- [ ] Run configuration checks and Gradle build; use Android tools to inspect application ID, minimum SDK, launcher, signing certificate, and embedded URL. Commit source/build configuration, not build outputs. Report failed downloads/toolchain blockers explicitly if build infrastructure is unavailable.

### Task 3: Trust deployment, device acceptance, and deliverable

**Files:** Create `docs/verification/finscribe-android.md`; update Android setup/README and deployment certificate configuration through authorized hosting access.

**Interfaces:** Consume the web plan's tested deployment and Task 2 actual APK certificate. Produce the downloaded deliverable APK, certificate evidence, trust verification results, and a precise verified/unverified acceptance record.

- [ ] Configure the target deployment's `ANDROID_SHA256_CERT_FINGERPRINTS` with the delivered APK's certificate; fetch `/.well-known/assetlinks.json` without a session and compare package/fingerprint to `apksigner` output. Do not report full-screen trust if deployment configuration is unavailable.
- [ ] Install on an emulator or authorized device and test first launch, real login, onboarding, screen navigation, goal/expense/ledger persistence after reopen, sign out, external authentication/source links, Back, and lost-network retry. Confirm browser chrome behavior for verified/unverified origins. If no device is available, identify all unexecuted cases explicitly.
- [ ] Confirm the APK opens the redesigned deployment at the tested commit. Record APK checksum, size, package/version, target origin, signing fingerprint, exact build commands, installation result, screenshots, and any remaining live-auth/trust gaps.
- [ ] Run final web checks affected by install metadata and final APK verification. Review the whole branch against the spec and both plans before opening a draft PR. A build-only APK is a provisional artifact if live origin/auth/device validation remains blocked.
- [ ] Save the user-facing APK through the Library workflow and return its download link alongside the draft PR and brief verification results. Do not present source code or CI setup as equivalent to a delivered APK.

## Execution and self-review

Execute after the web plan in the same session, using the user's selected method. Packaging development can use the configured origin before live deployment, but final delivery requires checking that origin contains the redesigned source. Static asset/trust tests map to Task 1, APK/signing/CI to Task 2, and actual deployed/device acceptance to Task 3. Every Review Focus item has an owning check above.

## Execution selection

These plans implement the approved spec. Recommended method is **Native**: implement in the current session, then perform a fresh final branch review. **Subagent-driven** implementation is available if the user chooses per-task implementers and reviewers; it adds context handoffs. Await the user's plan review and execution selection before product implementation.
