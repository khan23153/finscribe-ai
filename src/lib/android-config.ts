export function readAndroidConfig(env: NodeJS.ProcessEnv) {
  const value = env.FINSCRIBE_APP_ORIGIN?.trim() || 'https://finscribe-ai.vercel.app'
  let url: URL
  try { url = new URL(value) } catch { throw new Error('FINSCRIBE_APP_ORIGIN must be an HTTPS origin.') }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('FINSCRIBE_APP_ORIGIN must be an HTTPS origin without credentials, paths, or query parameters.')
  }
  const fingerprints = (env.ANDROID_SHA256_CERT_FINGERPRINTS || '')
    .split(',').map((entry) => entry.trim().toUpperCase()).filter(Boolean)
  if (fingerprints.some((entry) => !/^(?:[A-F0-9]{2}:){31}[A-F0-9]{2}$/.test(entry))) {
    throw new Error('ANDROID_SHA256_CERT_FINGERPRINTS must contain valid SHA-256 certificate fingerprints.')
  }
  return { origin: url.origin, fingerprints: [...new Set(fingerprints)] }
}
