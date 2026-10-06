'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Expense } from '@/lib/expenses'

type ExpensesResponse = { expenses?: Expense[]; error?: string }

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setError(null)
      const response = await fetch('/api/expenses', { cache: 'no-store', signal })
      const data = await response.json() as ExpensesResponse
      if (!response.ok) throw new Error(data.error ?? 'Unable to load expenses.')
      setExpenses(Array.isArray(data.expenses) ? data.expenses : [])
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === 'AbortError') return
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load expenses.')
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  return { expenses, setExpenses, isLoading, error, setError, reload: load }
}
