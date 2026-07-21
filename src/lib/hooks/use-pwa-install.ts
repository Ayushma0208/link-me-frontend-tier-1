'use client'

import { useCallback, useEffect, useState } from 'react'

const DISMISS_KEY = 'linkme-pwa-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    ('standalone' in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

function isIos() {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    setInstalled(isStandalone())
    setIos(isIos())
    setDismissed(localStorage.getItem(DISMISS_KEY) === '1')

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }, [])

  const install = useCallback(async () => {
    if (!deferred) return false
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    if (outcome === 'accepted') {
      setInstalled(true)
      return true
    }
    return false
  }, [deferred])

  const canPrompt = Boolean(deferred) && !installed && !dismissed
  // iOS never fires beforeinstallprompt — show manual instructions instead
  const canShowIosHint = ios && !installed && !dismissed

  return {
    installed,
    canPrompt,
    canShowIosHint,
    install,
    dismiss,
  }
}
