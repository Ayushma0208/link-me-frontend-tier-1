'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FollowedCreator {
  id: string
  handle: string
  name: string
  avatar: string
  category?: string
  /** Prefer profile URL used when they followed. */
  href: string
}

interface FollowState {
  byHandle: Record<string, FollowedCreator>
  follow: (creator: FollowedCreator) => void
  unfollow: (handle: string) => void
  toggle: (creator: FollowedCreator) => boolean
  isFollowing: (handle: string) => boolean
  list: () => FollowedCreator[]
}

function normalizeHandle(handle: string) {
  return handle.replace(/^@/, '').trim().toLowerCase()
}

export const useFollowStore = create<FollowState>()(
  persist(
    (set, get) => ({
      byHandle: {},

      follow: (creator) => {
        const handle = normalizeHandle(creator.handle)
        if (!handle) return
        set((state) => ({
          byHandle: {
            ...state.byHandle,
            [handle]: {
              ...creator,
              handle,
              href:
                creator.href ||
                `/@${handle}`,
            },
          },
        }))
      },

      unfollow: (handle) => {
        const key = normalizeHandle(handle)
        set((state) => {
          const next = { ...state.byHandle }
          delete next[key]
          return { byHandle: next }
        })
      },

      toggle: (creator) => {
        const handle = normalizeHandle(creator.handle)
        if (get().byHandle[handle]) {
          get().unfollow(handle)
          return false
        }
        get().follow(creator)
        return true
      },

      isFollowing: (handle) => Boolean(get().byHandle[normalizeHandle(handle)]),

      list: () =>
        Object.values(get().byHandle).sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
    }),
    { name: 'linkme-follows' }
  )
)
