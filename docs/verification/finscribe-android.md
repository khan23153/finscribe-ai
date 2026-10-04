# FinScribe Android verification — 2026-10-04

## Delivered scope

Provisional debug APK, version 0.1.0 (version code 1), package `com.finscribe.app`. Minimum Android 8.0/API 26; target API 36. Launch URL: `https://finscribe-ai.vercel.app/dashboard`.

The approved Android plan was executed independently of the pending web redesign plan. This APK opens the existing online site. It does **not** deliver the redesigned dashboard or verify account persistence. The source adds install metadata, restricted offline handling, and the Android build; those web changes have not been deployed to the target site.

## Artifact evidence

- Size: 4,693,394 bytes.
- SHA-256: `b31397d94f31491462ee7310b16191051e8c09318d0b3e07ac74782f17e2d9ce`.
- Actual signing certificate SHA-256: `B0:25:00:64:8D:27:17:1E:C8:AA:C4:B8:A2:04:06:85:D2:4E:92:3F:DA:1A:2D:94:92:8E:BD:C9:1C:07:6F:EC`.
- `apksigner verify --verbose --print-certs` passed. This is a debug signer; future debug builds may have another signer and cannot update this installation.
- Actual compiled APK inspection confirmed the package, label, launcher, min SDK, and launch URL. Decoded manifest/resources passed the credential-pattern check; origin verification was not disabled.

## Build and checks

Pinned JDK 17, Gradle 8.13, Android Gradle Plugin 8.11.1, SDK 36/build tools 36.0.0, and Android Browser Helper 2.6.2. Gradle distribution and downloaded toolchain archives were checksum-verified.

```bash
./android/gradlew -p android assembleDebug --no-daemon -PfinscribeOrigin=https://finscribe-ai.vercel.app
```

The local build used the identical Gradle 8.13 distribution directly, plus HTTPS proxy settings and `-Djavax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts` to use this environment's trusted certificate store. TLS validation stayed enabled. Build succeeded; signing inspection and the repository verification script passed. Non-HTTPS origin configuration and explicit/aggregate release builds without a private signing configuration are rejected by actual Gradle checks.

`npm run test`: 36 passing checks. `npm run test:ui`: 3 Chromium service-worker checks passed, covering private-data cache exclusion, obsolete-cache removal, and offline/retry behavior. `npm run check` passed. Next.js production build passed using dummy build-only Clerk/database settings; this does not prove live authentication or database connectivity.

## Deployment and device acceptance

Unauthenticated requests to `/.well-known/assetlinks.json` and `/manifest.webmanifest` on the target site returned HTTP 404. The delivered certificate is therefore not linked to this deployed origin. Full-screen trust is unverified, and the launcher may display a browser toolbar. Vercel hosting access is not connected; no deployment environment was changed.

No emulator or authorized Android device is available (`adb devices` has no devices, no KVM available). APK installation and Android screenshots were not executed. First launch, real Clerk login, onboarding, screen navigation, goal/expense/ledger persistence after reopen, sign out, external authentication/source links, Back, restart, full-screen/browser fallback, and device network-loss retry are all **unverified**. Chromium offline tests cover the new source only, not the current live site.

Before distribution: deploy the intended web source, configure Digital Asset Links using the actual distribution certificate, rebuild for that origin, and complete the above device acceptance cases. See `docs/android/setup.md`.
