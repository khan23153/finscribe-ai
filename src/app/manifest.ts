import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'FinScribe',
    short_name: 'FinScribe',
    description: 'Record expenses, review spending, and plan loans and goals.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f6f6f3',
    theme_color: '#f6f6f3',
    categories: ['finance', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Add expense', url: '/dashboard/expenses?new=1', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Reports', url: '/dashboard/reports', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  }
}
