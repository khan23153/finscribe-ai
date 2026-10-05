import { readAndroidConfig } from '@/lib/android-config'

export const dynamic = 'force-dynamic'

export function GET() {
  const { fingerprints } = readAndroidConfig(process.env)
  const statements = fingerprints.length ? [{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: { namespace: 'android_app', package_name: 'com.finscribe.app', sha256_cert_fingerprints: fingerprints },
  }] : []
  return Response.json(statements, { headers: { 'Cache-Control': 'public, max-age=300' } })
}
