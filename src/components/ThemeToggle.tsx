'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useSyncExternalStore } from 'react'

type Theme = 'dark' | 'light'

const themeEvent = 'finscribe-theme-change'

function readTheme(): Theme {
  return localStorage.getItem('finscribe-theme') === 'light' ? 'light' : 'dark'
}

function subscribeToTheme(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'finscribe-theme') callback()
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(themeEvent, callback)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(themeEvent, callback)
  }
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, () => 'dark')
  const isDark = theme === 'dark'

  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDark)
  }, [isDark])

  const toggle = () => {
    const nextTheme: Theme = isDark ? 'light' : 'dark'
    localStorage.setItem('finscribe-theme', nextTheme)
    document.documentElement.classList.toggle('light', nextTheme === 'light')
    window.dispatchEvent(new Event(themeEvent))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!isDark}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-background transition-all text-sm text-muted hover:text-foreground"
    >
      {isDark ? (
        <><Sun size={16} /><span>Light Mode</span></>
      ) : (
        <><Moon size={16} /><span>Dark Mode</span></>
      )}
    </button>
  )
}
