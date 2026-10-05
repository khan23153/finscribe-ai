# FinScribe Android build

This Android package opens the online FinScribe service through Android Browser Helper. It shares the browser's authentication environment; the package has no database or AI credentials. Until website/certificate verification is configured, it may open with a browser toolbar.

## Build an APK

Install a full JDK 17 (including `javac`), Android SDK platform 36, and build tools 36.0.0. Set `ANDROID_HOME` to the SDK directory or put `sdk.dir` in ignored `android/local.properties`.

```bash
sdkmanager 'platforms;android-36' 'build-tools;36.0.0'
./android/gradlew -p android assembleDebug -PfinscribeOrigin=https://YOUR-DEPLOYMENT.example
```

The APK is `android/app/build/outputs/apk/debug/app-debug.apk`. The default origin is the existing `https://finscribe-ai.vercel.app`; this does not deploy changes to that site. Use the deployment containing the intended source changes when testing a new interface.

Gradle 8.13, Android Gradle Plugin 8.11.1, and Android Browser Helper 2.6.2 are pinned. Minimum Android version is 8.0 (API 26); compile/target SDK is 36. Wrapper downloads are protected by the published SHA-256 checksum.

## Inspect the actual package

```bash
APK=android/app/build/outputs/apk/debug/app-debug.apk
"$ANDROID_HOME/build-tools/36.0.0/apksigner" verify --verbose --print-certs "$APK" > /tmp/signing-certificate.txt
"$ANDROID_HOME/build-tools/36.0.0/aapt" dump badging "$APK" > /tmp/badging.txt
"$ANDROID_HOME/build-tools/36.0.0/aapt" dump xmltree "$APK" AndroidManifest.xml > /tmp/manifest.txt
"$ANDROID_HOME/build-tools/36.0.0/aapt" dump --values resources "$APK" > /tmp/resources.txt
node scripts/verify-android-config.mjs --origin https://YOUR-DEPLOYMENT.example --badging /tmp/badging.txt --manifest /tmp/manifest.txt --certificate /tmp/signing-certificate.txt --resources /tmp/resources.txt
```

The verifier rejects a wrong package, wrong launch origin, incompatible minimum SDK, missing signature evidence, and server secrets in decoded manifest and string resources. `apksigner verify` must succeed before its certificate report is used. The Android workflow also collects this evidence beside its debug APK.

## Enable full-screen trust

1. On the target website, set `FINSCRIBE_APP_ORIGIN` to its HTTPS origin.
2. Set `ANDROID_SHA256_CERT_FINGERPRINTS` to the colon-separated certificate fingerprint printed by the verifier. Multiple valid fingerprints may be comma-separated.
3. Deploy the branch containing the public `/.well-known/assetlinks.json` endpoint.
4. Fetch that endpoint while signed out and compare package `com.finscribe.app` and the signing certificate to the actual APK.
5. Install on Android and verify full-screen/browser fallback, Back, external sign-in, sign out, restart, and connectivity loss. Never disable Digital Asset Links verification.

Do not add a debug certificate to a production trust list unless that is the signing identity you intend to authorize. Different machines/CI runs normally create different debug keys. An APK with a different signer cannot update an existing installation; uninstalling it clears app-local state. Use a stable private release signer for distribution and updates.

## Optional release signing

Supply `FINSCRIBE_KEYSTORE_PATH`, `FINSCRIBE_KEYSTORE_PASSWORD`, `FINSCRIBE_KEY_ALIAS`, and `FINSCRIBE_KEY_PASSWORD` through a secure environment, then run `assembleRelease`. Missing signing configuration fails release builds; the release variant never uses a debug key. Keep the private keystore and all passwords outside git. Play Store publishing is separate from building this APK.

## Verification scope

`npm run test` checks install metadata and APK inspection inputs; `npm run test:ui` uses a local asset server to test the actual service worker in Chromium. Those browser tests simulate real failed navigation and cover retry, cache contents, and obsolete-cache removal. They do not replace Android device testing or real Clerk authentication testing.

The service worker stores only static install assets and the offline page. Account pages use network-only requests; financial APIs and external Clerk traffic are never stored in its cache. An initial install without an internet connection may still show the browser's connection error because no service worker has been installed yet.
