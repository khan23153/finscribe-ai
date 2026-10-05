import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const allowed = new Map([
  ['/sw.js', ['sw.js', 'text/javascript']],
  ['/offline.html', ['offline.html', 'text/html']],
  ['/icon.svg', ['icon.svg', 'image/svg+xml']],
  ['/icons/icon-192.png', ['icons/icon-192.png', 'image/png']],
  ['/icons/icon-512.png', ['icons/icon-512.png', 'image/png']],
])
let networkFailure = false
createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://127.0.0.1').pathname
  if (pathname === '/__test/network/offline') { networkFailure = true; response.end('offline'); return }
  if (pathname === '/__test/network/online') { networkFailure = false; response.end('online'); return }
  if (pathname === '/ready') { response.end('ready'); return }
  if (pathname === '/' || pathname === '/dashboard') {
    if (networkFailure) { response.destroy(); return }
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Type', 'text/html')
    response.end('<!doctype html><title>Private fixture</title><p>Private financial fixture</p>')
    return
  }
  if (pathname.startsWith('/api/')) { response.setHeader('Content-Type', 'application/json'); response.end('{"private":"financial data"}'); return }
  const entry = allowed.get(pathname)
  if (!entry) { response.writeHead(404); response.end(); return }
  try {
    response.setHeader('Content-Type', entry[1])
    response.end(await readFile(resolve('public', entry[0])))
  } catch { response.writeHead(404); response.end('Install asset is not implemented') }
}).listen(4173, '127.0.0.1')
