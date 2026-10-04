import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/', name: 'FinScribe', short_name: 'FinScribe',
    description: 'Your expenses, savings goals, and everyday finances in one place.',
    start_url: '/dashboard', scope: '/', display: 'standalone',
    background_color: '#F6F5F1', theme_color: '#28634B',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  }
}
