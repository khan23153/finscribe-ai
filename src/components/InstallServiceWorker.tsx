'use client'

import { useEffect } from 'react'

export default function InstallServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && window.location.protocol === 'https:' && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js').catch(() => {
        // Online financial operations remain available if installation support fails.
      })
    }
  }, [])
  return null
}
