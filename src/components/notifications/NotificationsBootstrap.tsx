'use client'

import { useEffect } from 'react'
import { getTokens } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api'

/**
 * Opens the notification SSE stream while a user is signed in, and keeps the
 * notification store hydrated. Mounted once near the app root.
 */
export function NotificationsBootstrap() {
  const userId = useAuthStore((s) => s.user?.id)

  useEffect(() => {
    if (!userId) {
      useNotificationsStore.getState().reset()
      return
    }

    const store = useNotificationsStore.getState()
    void store.refresh()

    let source: EventSource | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let closed = false

    const connect = () => {
      if (closed) return
      const token = getTokens()?.accessToken
      if (!token) {
        retryTimer = setTimeout(connect, 4000)
        return
      }

      const url = `${API_BASE}/notifications/stream?token=${encodeURIComponent(
        token
      )}`
      source = new EventSource(url)

      source.addEventListener('ready', () => {
        useNotificationsStore.getState().setConnected(true)
      })

      source.addEventListener('notification', (event) => {
        try {
          const payload = JSON.parse((event as MessageEvent).data)
          useNotificationsStore.getState().pushRealtime(payload)
        } catch {
          // ignore malformed frames
        }
      })

      source.onerror = () => {
        useNotificationsStore.getState().setConnected(false)
        source?.close()
        source = null
        if (!closed) {
          retryTimer = setTimeout(connect, 5000)
        }
      }
    }

    connect()

    return () => {
      closed = true
      if (retryTimer) clearTimeout(retryTimer)
      source?.close()
      useNotificationsStore.getState().setConnected(false)
    }
  }, [userId])

  return null
}
