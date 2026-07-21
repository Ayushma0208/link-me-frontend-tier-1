import { create } from 'zustand'
import { api } from '@/lib/api'

export interface AppNotificationItem {
  id: string
  type: string
  title: string
  body: string
  href: string | null
  data: Record<string, unknown> | null
  read: boolean
  createdAt: string
}

export interface LiveToast {
  liveId: string
  title: string
  body: string
  href: string
  accessType: 'FREE' | 'PAID'
  price: number | null
  creatorName?: string
}

interface RealtimePayload {
  type: string
  title: string
  body: string
  href: string | null
  data: Record<string, unknown> | null
  createdAt: string
}

interface NotificationsState {
  items: AppNotificationItem[]
  unreadCount: number
  connected: boolean
  liveToast: LiveToast | null
  hydrated: boolean
  refresh: () => Promise<void>
  pushRealtime: (payload: RealtimePayload) => void
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  setConnected: (connected: boolean) => void
  dismissLiveToast: () => void
  reset: () => void
}

let clientSeq = 0

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unreadCount: 0,
  connected: false,
  liveToast: null,
  hydrated: false,

  refresh: async () => {
    try {
      const res = await api<{
        items: AppNotificationItem[]
        unreadCount: number
      }>('/notifications?limit=50')
      set({
        items: Array.isArray(res.items) ? res.items : [],
        unreadCount: res.unreadCount ?? 0,
        hydrated: true,
      })
    } catch {
      set({ hydrated: true })
    }
  },

  pushRealtime: (payload) => {
    clientSeq += 1
    const item: AppNotificationItem = {
      id: `sse_${Date.now()}_${clientSeq}`,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      href: payload.href,
      data: payload.data,
      read: false,
      createdAt: payload.createdAt ?? new Date().toISOString(),
    }
    set((s) => ({
      items: [item, ...s.items].slice(0, 100),
      unreadCount: s.unreadCount + 1,
    }))

    if (payload.type === 'LIVE' && payload.data) {
      const data = payload.data as Record<string, unknown>
      const liveId = typeof data.liveId === 'string' ? data.liveId : null
      const ended = data.ended === true
      const scheduled = data.scheduled === true
      if (liveId && !ended && !scheduled) {
        set({
          liveToast: {
            liveId,
            title: payload.title,
            body: payload.body,
            href: payload.href ?? `/live/${liveId}`,
            accessType: data.accessType === 'PAID' ? 'PAID' : 'FREE',
            price:
              typeof data.price === 'number'
                ? data.price
                : data.price != null
                  ? Number(data.price)
                  : null,
            creatorName:
              typeof data.creatorName === 'string'
                ? data.creatorName
                : undefined,
          },
        })
      } else if (ended) {
        // Live finished — clear the toast if it's the same session.
        const current = get().liveToast
        if (current && liveId && current.liveId === liveId) {
          set({ liveToast: null })
        }
        // Reload list so older "is live now" cards flip to "was live".
        void get().refresh()
      }
    }
  },

  markRead: async (id) => {
    const target = get().items.find((n) => n.id === id)
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount:
        target && !target.read ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
    }))
    // Server ids are UUIDs; client-only (sse_) ids skip the API call.
    if (!id.startsWith('sse_')) {
      try {
        await api(`/notifications/${id}/read`, { method: 'POST' })
      } catch {
        // best-effort
      }
    }
  },

  markAllRead: async () => {
    set((s) => ({
      items: s.items.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
    try {
      await api('/notifications/read-all', { method: 'POST' })
    } catch {
      // best-effort
    }
  },

  setConnected: (connected) => set({ connected }),
  dismissLiveToast: () => set({ liveToast: null }),
  reset: () =>
    set({
      items: [],
      unreadCount: 0,
      connected: false,
      liveToast: null,
      hydrated: false,
    }),
}))
