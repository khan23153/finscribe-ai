import { readFileSync } from 'node:fs'

try {
  const args = Object.fromEntries(Array.from({ length: (process.argv.length - 2) / 2 }, (_, index) => [process.argv[2 + index * 2], process.argv[3 + index * 2]]))
  let url
  try { url = new URL(args['--origin']) } catch { throw new Error('Target must be an HTTPS origin.') }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Target must be an HTTPS origin without credentials, paths, or queries.')
  }
  const badging = readFileSync(args['--badging'], 'utf8')
  const manifest = readFileSync(args['--manifest'], 'utf8')
  const certificate = readFileSync(args['--certificate'], 'utf8')
  const resources = readFileSync(args['--resources'], 'utf8')
  if (/sk_(?:live|test)_[A-Za-z0-9]{12,}|AIza[A-Za-z0-9_-]{30,}|postgres(?:ql)?:\/\//.test(`${manifest}\n${resources}`)) throw new Error('APK contains a server credential.')
  if (!/\(string(?:8|16)\)/.test(resources)) throw new Error('APK resource inspection must include string values; use aapt dump --values resources.')
  if (!/^package: name='com\.finscribe\.app'/m.test(badging)) throw new Error('Unexpected APK package.')
  if (!/^sdkVersion:'26'$/m.test(badging)) throw new Error('Unexpected minimum SDK; Android 8.0 is required.')
  if (!/^application-label:'FinScribe'$/m.test(badging)) throw new Error('Unexpected application label.')
  if (!badging.includes("launchable-activity: name='com.google.androidbrowserhelper.trusted.LauncherActivity'")) throw new Error('APK launcher is missing.')
  const launch = manifest.match(/android\.support\.customtabs\.trusted\.DEFAULT_URL[^\n]*\n\s*A: android:value[^=]*="([^"]+)"/)?.[1]
  if (launch !== `${url.origin}/dashboard`) throw new Error('APK launch URL does not match the requested deployment.')
  if (/disable-digital-asset-link-verification|disable-origin-verification/.test(manifest)) throw new Error('Origin verification must not be disabled.')
  const digest = certificate.match(/Signer #1 certificate SHA-256 digest:\s*([a-fA-F0-9]{64})(?:\s|$)/)?.[1]
  if (!digest) throw new Error('No verified APK signing certificate was supplied.')
  const fingerprint = digest.toUpperCase().match(/.{2}/g).join(':')
  console.log(JSON.stringify({ package: 'com.finscribe.app', origin: url.origin, minSdk: 26, launchUrl: launch, fingerprint }, null, 2))
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Android package verification failed.')
  process.exitCode = 1
}
