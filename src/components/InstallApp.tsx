'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { Check, Download, Share } from 'lucide-react'
import { Button } from '@/components/ui'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'installed' | 'ios' | 'other' | 'unknown'

function detectPlatform(): Platform {
  const standalone = window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true
  if (standalone) return 'installed'
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ? 'ios' : 'other'
}

const noopSubscribe = () => () => {}

export default function InstallApp() {
  const platform = useSyncExternalStore(noopSubscribe, detectPlatform, () => 'unknown' as const)
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    const handleInstalled = () => setInstalled(true)

    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  if (platform === 'unknown') return null

  if (installed || platform === 'installed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] text-positive font-medium">
        <Check size={15} /> Installed
      </span>
    )
  }

  if (promptEvent) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={async () => {
          await promptEvent.prompt()
          const choice = await promptEvent.userChoice
          if (choice.outcome === 'accepted') setInstalled(true)
          setPromptEvent(null)
        }}
      >
        <Download size={14} /> Install
      </Button>
    )
  }

  if (platform === 'ios') {
    return (
      <span className="text-[13px] text-muted inline-flex items-center gap-1 flex-wrap justify-end">
        <Share size={13} className="inline" aria-label="Share" /> → Add to Home Screen
      </span>
    )
  }

  return <span className="text-[13px] text-muted text-right">Browser menu → Install</span>
}
