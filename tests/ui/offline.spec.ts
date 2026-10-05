import { test, expect } from '@playwright/test'

async function installWorker(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }))
    }
  })
}

test('never stores private navigation, finance APIs, or Clerk resources', async ({ page }) => {
  await installWorker(page)
  await page.goto('/dashboard')
  await page.evaluate(async () => {
    await fetch('/api/expenses')
    await fetch('/api/ai', { method: 'POST', body: '{}' })
    await fetch('https://example.clerk.accounts.dev/v1/client').catch(() => {})
  })
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys()
    return (await Promise.all(keys.map(async (key) => (await (await caches.open(key)).keys()).map((request) => new URL(request.url).pathname)))).flat()
  })
  expect(cached).toContain('/offline.html')
  expect(cached.every((path) => ['/offline.html', '/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png'].includes(path))).toBe(true)
})

test('clears only obsolete FinScribe caches and keeps unrelated application caches', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    const legacy = await caches.open('finscribe-private-v0')
    await legacy.put('/dashboard', new Response('private balance'))
    const unrelated = await caches.open('other-app-assets')
    await unrelated.put('/other', new Response('other app'))
  })
  await installWorker(page)
  const keys = await page.evaluate(() => caches.keys())
  expect(keys).not.toContain('finscribe-private-v0')
  expect(keys).toContain('other-app-assets')
})

test('shows a useful retry screen on navigation failure without previous financial data', async ({ page, context, request }) => {
  await installWorker(page)
  await page.goto('/dashboard')
  await request.post('/__test/network/offline')
  await context.setOffline(true)
  await page.goto('/dashboard?offline=1')
  await expect(page.getByRole('heading', { name: 'You’re offline' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  await expect(page.getByText('Private financial fixture')).toHaveCount(0)
  await context.setOffline(false)
  await request.post('/__test/network/online')
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByText('Private financial fixture')).toBeVisible()
})
