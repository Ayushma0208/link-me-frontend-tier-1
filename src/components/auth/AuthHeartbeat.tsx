'use client'

import { useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const HEARTBEAT_MS = 5 * 60_000

export function AuthHeartbeat() {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user) return

    let cancelled = false

    async function ping() {
      if (cancelled || document.visibilityState === 'hidden') return
      try {
        await api('/auth/heartbeat', { method: 'POST' })
      } catch {
        // ignore — refresh/auth errors handled elsewhere
      }
    }

    void ping()
    const id = window.setInterval(() => void ping(), HEARTBEAT_MS)
    const onVis = () => {
      if (document.visibilityState === 'visible') void ping()
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelled = true
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [user])

  return null
}
