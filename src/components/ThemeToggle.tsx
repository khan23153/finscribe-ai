'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useSyncExternalStore } from 'react'
import { Segmented } from '@/components/ui'
import { darkQuery, storageKey } from '@/lib/theme-script'

export type ThemePreference = 'system' | 'light' | 'dark'

const themeEvent = 'finscribe-theme-change'

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(storageKey)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

function subscribe(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey) callback()
  }
  window.addEventListener('storage', handleStorage)
  window.addEventListener(themeEvent, callback)
  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(themeEvent, callback)
  }
}

function applyTheme(preference: ThemePreference) {
  const isDark = preference === 'dark'
    || (preference === 'system' && window.matchMedia(darkQuery).matches)
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
}

export function useThemePreference() {
  const preference = useSyncExternalStore(subscribe, readPreference, () => 'system' as const)

  useEffect(() => {
    applyTheme(preference)
    if (preference !== 'system') return

    const media = window.matchMedia(darkQuery)
    const handleChange = () => applyTheme('system')
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [preference])

  const setPreference = (next: ThemePreference) => {
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      // Storage can be unavailable in private modes; the choice still applies to this page.
    }
    applyTheme(next)
    window.dispatchEvent(new Event(themeEvent))
  }

  return [preference, setPreference] as const
}

export function ThemeSwitcher() {
  const [preference, setPreference] = useThemePreference()

  return (
    <Segmented
      label="Theme"
      value={preference}
      onChange={setPreference}
      options={[
        { value: 'system', label: 'System' },
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ]}
    />
  )
}

const order: ThemePreference[] = ['system', 'light', 'dark']
const icons = { system: Monitor, light: Sun, dark: Moon }

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [preference, setPreference] = useThemePreference()
  const Icon = icons[preference]
  const next = order[(order.indexOf(preference) + 1) % order.length]

  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      className={`h-8 w-8 rounded-md flex items-center justify-center text-muted hover:bg-surface-2 hover:text-foreground ${className}`}
      aria-label={`Theme: ${preference}. Switch to ${next}.`}
      title={`Theme: ${preference}`}
    >
      <Icon size={16} />
    </button>
  )
}
