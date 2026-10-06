'use client'

import { useSyncExternalStore } from 'react'

let snapshot: Date | null = null

function getSnapshot() {
  // Refresh at most once a minute so long-lived app sessions roll over to a new day/month.
  if (!snapshot || Date.now() - snapshot.getTime() > 60_000) snapshot = new Date()
  return snapshot
}

const subscribe = () => () => {}

/**
 * The current time, available only after hydration. Returns `null` during
 * server rendering so date-dependent text never mismatches the server's clock.
 */
export function useClientNow() {
  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}
