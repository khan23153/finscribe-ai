import { describe, expect, it, vi, afterEach } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { config as proxyConfig } from '../../src/proxy'

type ConfigReader = (env: NodeJS.ProcessEnv) => { origin: string; fingerprints: string[] }
const configPath = resolve('src/lib/android-config.ts')
const configModule = existsSync(configPath) ? await import(configPath) : undefined
const readConfig = (env: Partial<NodeJS.ProcessEnv>) => {
  expect(configModule?.readAndroidConfig, 'Android configuration is not implemented').toBeTypeOf('function')
  return (configModule!.readAndroidConfig as ConfigReader)({ NODE_ENV: 'test', ...env })
}
const fingerprint = Array.from({ length: 32 }, () => 'AB').join(':')
afterEach(() => vi.unstubAllEnvs())

describe('Android origin configuration', () => {
  it('defaults to the known HTTPS origin without inventing certificates', () => {
    expect(readConfig({})).toEqual({ origin: 'https://finscribe-ai.vercel.app', fingerprints: [] })
  })
  it('accepts a preview origin and canonicalizes certificate casing', () => {
    expect(readConfig({ FINSCRIBE_APP_ORIGIN: 'https://preview.example.com/', ANDROID_SHA256_CERT_FINGERPRINTS: fingerprint.toLowerCase() }))
      .toEqual({ origin: 'https://preview.example.com', fingerprints: [fingerprint] })
  })
  it.each(['http://example.com', 'javascript:alert(1)', 'not a URL', 'https://user:pass@example.com', 'https://example.com/dashboard', 'https://example.com?x=1', 'https://example.com#section'])('rejects unsafe/non-origin value %s', (value) => {
    expect(() => readConfig({ FINSCRIBE_APP_ORIGIN: value })).toThrow(/HTTPS origin/)
  })
  it.each(['replace_me', 'AB:CD', 'GG:'.repeat(31) + 'GG'])('rejects malformed certificate %s', (value) => {
    expect(() => readConfig({ ANDROID_SHA256_CERT_FINGERPRINTS: value })).toThrow(/SHA-256/)
  })
  it('deduplicates the same signing identity', () => {
    expect(readConfig({ ANDROID_SHA256_CERT_FINGERPRINTS: `${fingerprint}, ${fingerprint.toLowerCase()}` }).fingerprints).toEqual([fingerprint])
  })
})

it('serves only configured real Android trust statements', async () => {
  vi.stubEnv('ANDROID_SHA256_CERT_FINGERPRINTS', fingerprint)
  const path = resolve('src/app/.well-known/assetlinks.json/route.ts')
  expect(existsSync(path), 'Asset links endpoint is not implemented').toBe(true)
  const { GET } = await import(path)
  const response = GET()
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual([{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: { namespace: 'android_app', package_name: 'com.finscribe.app', sha256_cert_fingerprints: [fingerprint] },
  }])
})

it('returns empty trust when no APK certificate is configured', async () => {
  vi.stubEnv('ANDROID_SHA256_CERT_FINGERPRINTS', '')
  const path = resolve('src/app/.well-known/assetlinks.json/route.ts')
  expect(existsSync(path), 'Asset links endpoint is not implemented').toBe(true)
  expect(await (await import(path)).GET().json()).toEqual([])
})

it('starts the installable app at the authenticated dashboard', async () => {
  const path = resolve('src/app/manifest.ts')
  expect(existsSync(path), 'App manifest is not implemented').toBe(true)
  const manifest = (await import(path)).default()
  expect(manifest).toMatchObject({ name: 'FinScribe', start_url: '/dashboard', display: 'standalone', scope: '/' })
  expect(manifest.icons.length).toBeGreaterThan(0)
})

it.each(['/.well-known/assetlinks.json', '/manifest.webmanifest', '/offline.html', '/sw.js', '/icon.svg'])('makes installation resource %s public', (pathname) => {
  expect(unstable_doesMiddlewareMatch({ config: proxyConfig, nextConfig: {}, url: `https://example.com${pathname}` })).toBe(false)
})

it('keeps the dashboard under authentication middleware', () => {
  expect(unstable_doesMiddlewareMatch({ config: proxyConfig, nextConfig: {}, url: 'https://example.com/dashboard' })).toBe(true)
})

it.each(['/.well-known/assetlinks.json/account', '/manifest.webmanifest/private'])('does not exempt metadata lookalike %s from authentication', (pathname) => {
  expect(unstable_doesMiddlewareMatch({ config: proxyConfig, nextConfig: {}, url: `https://example.com${pathname}` })).toBe(true)
})
