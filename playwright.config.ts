import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/ui',
  use: { baseURL: 'http://127.0.0.1:4173', headless: true },
  webServer: { command: 'node tests/ui/asset-server.mjs', url: 'http://127.0.0.1:4173', reuseExistingServer: false },
  reporter: 'list',
})
