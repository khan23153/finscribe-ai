/* FinScribe caches public install assets only. Account data is always network-only. */
const publicCache = 'finscribe-public-v1'
const publicPaths = ['/offline.html', '/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png']
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(publicCache)
    await cache.addAll(publicPaths.map((path) => new Request(path, { credentials: 'omit', cache: 'reload' })))
    await self.skipWaiting()
  })())
})
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key.startsWith('finscribe-') && key !== publicCache).map((key) => caches.delete(key)))
    await self.clients.claim()
  })())
})
self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request, { cache: 'no-store' }).catch(async () => {
      const offline = await (await caches.open(publicCache)).match('/offline.html')
      return offline || new Response('FinScribe needs an internet connection. Reconnect and reload.', { status: 503, headers: { 'Content-Type': 'text/plain' } })
    }))
    return
  }
  if (!url.search && publicPaths.includes(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(publicCache)
      return (await cache.match(url.pathname)) || fetch(request)
    })())
  }
})
