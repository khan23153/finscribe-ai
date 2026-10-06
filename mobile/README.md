# FinScribe for Android

A native Flutter app for FinScribe. It uses the same server as the website
(`/api/expenses` and `/api/ai` on the Next.js app), but has no sign-in.

## How identity works without sign-in

On first launch the app creates a random 256-bit key and keeps it in Android's
encrypted storage (`flutter_secure_storage`). Every request sends it in the
`x-finscribe-device-key` header. The server (`src/lib/request-user.ts`) hashes it
and uses the hash as that device's account, so each phone sees only its own
expenses.

Consequences to know about:

- Expenses recorded in the app are separate from a Clerk account on the website.
- Uninstalling the app or clearing its data deletes the key, and the expenses
  saved under it can't be opened again.
- Anyone with the app can call the AI endpoints. They are rate limited per key,
  but a determined user can create many keys, so add sign-in before a wide release.

Goals, the ledger, the monthly budget, and the theme are stored only on the
phone, as they are in the browser on the website.

## Getting an APK

The `Android APK` GitHub Actions workflow (`.github/workflows/android.yml`) runs
on every push to `main` that touches `mobile/`, and can be started by hand from
the Actions tab (where you can also point it at a different server). It analyzes,
tests, and builds `app-release.apk`; download it from the run's **Artifacts**.

### Signing (do this once)

Without a signing key each build gets a new throwaway signature, so Android
refuses to install a new APK over an old one, and uninstalling loses the device
key. Create one key and store it as repository secrets:

```bash
keytool -genkeypair -v -keystore finscribe-release.jks -keyalg RSA -keysize 2048 \
  -validity 10000 -alias finscribe
base64 -w0 finscribe-release.jks   # paste the output into ANDROID_KEYSTORE_BASE64
```

Secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
`ANDROID_KEY_ALIAS` (`finscribe`), `ANDROID_KEY_PASSWORD`. Keep the `.jks` file
and passwords somewhere safe; losing them means users must reinstall.

## Developing

Requires Flutter 3.47 or newer.

```bash
flutter pub get
flutter analyze
flutter test
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000   # emulator → local `npm run dev`
```

`API_BASE_URL` defaults to `https://finscribe-ai.vercel.app` (see
`lib/core/config.dart`).

Building an APK needs the Android SDK on an x86-64 machine (Linux, macOS, or
Windows). Google does not ship the Android build tools for ARM Linux, so on such
machines use the GitHub workflow.

## Layout

```
lib/
  core/      config, theme (colour tokens shared with the web app), formatting
  data/      API client, models, stores (server expenses, on-device data), analytics
  ui/        app shell (tab bar), shared widgets, and one file per screen
test/        unit tests and widget tests that run the app against a fake server
```
