'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

const localStorageEvent = 'finscribe-local-storage'

export function useLocalStorageValue(key: string, fallback: string) {
  const subscribe = useCallback((callback: () => void) => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) callback()
    }
    const handleLocalChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail === key) callback()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(localStorageEvent, handleLocalChange)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(localStorageEvent, handleLocalChange)
    }
  }, [key])

  const getSnapshot = useCallback(
    () => localStorage.getItem(key) ?? fallback,
    [fallback, key],
  )
  const getServerSnapshot = useCallback(() => fallback, [fallback])

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setValue = useCallback((nextValue: string) => {
    localStorage.setItem(key, nextValue)
    window.dispatchEvent(new CustomEvent(localStorageEvent, { detail: key }))
  }, [key])

  return [value, setValue] as const
}

type JsonUpdater<T> = T | ((currentValue: T) => T)

export function useLocalStorageJson<T>(
  key: string,
  fallback: T,
  parse: (value: unknown) => T | undefined,
) {
  const fallbackJson = useMemo(() => JSON.stringify(fallback), [fallback])
  const [rawValue, setRawValue] = useLocalStorageValue(key, fallbackJson)

  const value = useMemo(
    () => parseJson(rawValue, fallback, parse),
    [fallback, parse, rawValue],
  )

  const setValue = useCallback((nextValue: JsonUpdater<T>) => {
    const currentValue = parseJson(
      localStorage.getItem(key) ?? fallbackJson,
      fallback,
      parse,
    )
    const resolvedValue = typeof nextValue === 'function'
      ? (nextValue as (currentValue: T) => T)(currentValue)
      : nextValue

    setRawValue(JSON.stringify(resolvedValue))
  }, [fallback, fallbackJson, key, parse, setRawValue])

  return [value, setValue] as const
}

function parseJson<T>(
  rawValue: string,
  fallback: T,
  parse: (value: unknown) => T | undefined,
) {
  try {
    return parse(JSON.parse(rawValue)) ?? fallback
  } catch {
    return fallback
  }
}
