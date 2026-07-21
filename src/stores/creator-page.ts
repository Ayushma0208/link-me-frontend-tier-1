'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import {
  defaultAppearance,
  type ProfileAppearance,
} from '@/lib/profile-appearance'

interface CreatorPageState {
  /** Last saved / claimed public handle (availability baseline). */
  claimedUsername: string
  /** Draft public handle in the settings form. */
  publicUsername: string
  appearance: ProfileAppearance
  setPublicUsername: (username: string) => void
  setAppearance: (patch: Partial<ProfileAppearance>) => void
  commitPublicUsername: () => void
  syncFromAuth: (username: string) => void
  resetAppearance: () => void
}

export const useCreatorPageStore = create<CreatorPageState>()(
  persist(
    (set, get) => ({
      claimedUsername: '',
      publicUsername: '',
      appearance: { ...defaultAppearance },
      setPublicUsername: (publicUsername) => set({ publicUsername }),
      setAppearance: (patch) =>
        set((state) => ({
          appearance: { ...state.appearance, ...patch },
        })),
      commitPublicUsername: () => {
        const { publicUsername } = get()
        set({ claimedUsername: publicUsername, publicUsername })
      },
      syncFromAuth: (username) => {
        if (!username) return
        set({ claimedUsername: username, publicUsername: username })
      },
      resetAppearance: () =>
        set({
          appearance: { ...defaultAppearance },
        }),
    }),
    { name: 'linkme-creator-page' }
  )
)
