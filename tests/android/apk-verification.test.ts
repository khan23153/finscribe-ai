import { it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const badging = "package: name='com.finscribe.app' versionCode='1' versionName='0.1.0'\nsdkVersion:'26'\ntargetSdkVersion:'36'\napplication-label:'FinScribe'\nlaunchable-activity: name='com.google.androidbrowserhelper.trusted.LauncherActivity'"
const manifest = 'E: meta-data\n  A: android:name="android.support.customtabs.trusted.DEFAULT_URL"\n  A: android:value="https://preview.example.com/dashboard"'
const certificate = 'Signer #1 certificate SHA-256 digest: ' + 'ab'.repeat(32)
function verify(options: { origin?: string; badging?: string; manifest?: string; certificate?: string; resources?: string } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'finscribe-apk-test-'))
  for (const [file, text] of Object.entries({ badging: options.badging ?? badging, manifest: options.manifest ?? manifest, certificate: options.certificate ?? certificate, resources: options.resources ?? '(string8) "FinScribe"' })) {
    writeFileSync(join(dir, file), text)
  }
  return spawnSync(process.execPath, ['scripts/verify-android-config.mjs', '--origin', options.origin ?? 'https://preview.example.com', '--badging', join(dir, 'badging'), '--manifest', join(dir, 'manifest'), '--certificate', join(dir, 'certificate'), '--resources', join(dir, 'resources')], { encoding: 'utf8' })
}
it('verifies the built package and derives the actual certificate fingerprint', () => {
  const result = verify()
  expect(result.status, result.stderr).toBe(0)
  expect(JSON.parse(result.stdout)).toMatchObject({ package: 'com.finscribe.app', origin: 'https://preview.example.com', minSdk: 26, fingerprint: Array(32).fill('AB').join(':') })
})
it.each(['http://preview.example.com', 'https://user:pass@preview.example.com', 'https://preview.example.com/dashboard', 'https://preview.example.com?x=1'])('rejects unsafe target %s before claiming the APK works', (origin) => {
  const result = verify({ origin })
  expect(result.status).not.toBe(0)
  expect(result.stderr).toMatch(/HTTPS origin/)
})
it('rejects a renamed package', () => {
  const result = verify({ badging: badging.replace('com.finscribe.app', 'com.other.app') })
  expect(result.status).not.toBe(0)
  expect(result.stderr).toMatch(/package/)
})
it('rejects incompatible minimum Android version', () => {
  const result = verify({ badging: badging.replace("sdkVersion:'26'", "sdkVersion:'30'") })
  expect(result.status).not.toBe(0)
  expect(result.stderr).toMatch(/minimum SDK/)
})
it('rejects an APK pointing at a different deployment', () => {
  const result = verify({ manifest: manifest.replace('preview.example.com', 'old.example.com') })
  expect(result.status).not.toBe(0)
  expect(result.stderr).toMatch(/launch URL/)
})
it('rejects certificate output that does not prove a signing identity', () => {
  const result = verify({ certificate: 'replace_me' })
  expect(result.status).not.toBe(0)
  expect(result.stderr).toMatch(/certificate/)
})
it('rejects APK resources containing a server secret without printing it', () => {
  const secret = 'sk_test_' + 'sensitive'.repeat(4)
  const result = verify({ manifest: manifest + '\n' + secret })
  expect(result.status).not.toBe(0)
  expect(result.stderr).toMatch(/credential/)
  expect(result.stderr).not.toContain(secret)
})
it('checks compiled string resources as well as the manifest for server credentials', () => {
  const result = verify({ resources: 'postgresql://database-user:private@database.example/finscribe' })
  expect(result.status).not.toBe(0)
  expect(result.stderr).toMatch(/credential/)
  expect(result.stderr).not.toContain('private@database')
})

it('rejects resource inspection that omits compiled string values', () => {
  const result = verify({ resources: 'resource 0x7f0d001d: t=0x03 d=0x00000005 (s=0x0008 r=0x00)' })
  expect(result.status).not.toBe(0)
  expect(result.stderr).toMatch(/resource.*values/)
})
