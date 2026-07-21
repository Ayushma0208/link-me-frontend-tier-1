'use client'

import { useEffect, useState } from 'react'
import { LogoMark } from '@/components/layout/Logo'

export function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-surface px-6 text-center">
      <LogoMark size="lg" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          You&apos;re offline
        </h1>
        <p className="max-w-sm text-sm text-white/60">
          No internet connection. Check your network and try again.
        </p>
      </div>
    </div>
  )
}
