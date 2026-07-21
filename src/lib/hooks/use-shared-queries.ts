'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { FeedCreator } from '@/data/user-feed'
import { api, getTokens } from '@/lib/api'
import {
  type MembershipRow,
  listDiscoverCreators,
} from '@/lib/creator-discovery'
import { listPublicCreators } from '@/lib/public-creators'
import { queryKeys } from '@/lib/query-keys'
import { useFollowStore } from '@/stores/follows'

const CREATORS_POOL_LIMIT = 40
const STALE = 60_000

export function usePublicCreatorsPool() {
  return useQuery({
    queryKey: queryKeys.publicCreatorsPool,
    queryFn: () => listPublicCreators({ limit: CREATORS_POOL_LIMIT }),
    staleTime: STALE,
  })
}

export function useSubscriptionsMe<T = MembershipRow>() {
  return useQuery({
    queryKey: queryKeys.subscriptionsMe,
    queryFn: async () => {
      if (!getTokens()?.accessToken) return [] as T[]
      return (await api<T[]>('/subscriptions/me?limit=100')) ?? []
    },
    staleTime: STALE,
  })
}

export function useDiscoverCreators(limit = 8) {
  const byHandle = useFollowStore((s) => s.byHandle)
  const followKey = Object.keys(byHandle).sort().join(',')

  return useQuery({
    queryKey: [...queryKeys.discoverCreators(limit), followKey],
    queryFn: () => listDiscoverCreators({ limit }),
    staleTime: STALE,
  })
}

export function useStoriesFeed() {
  return useQuery({
    queryKey: queryKeys.storiesFeed,
    queryFn: async () => {
      if (!getTokens()?.accessToken) return []
      return (await api('/stories/feed')) ?? []
    },
    staleTime: STALE,
  })
}

/** Filter the shared creators pool client-side (no extra network). */
export function useSuggestedFromPool(limit: number): {
  data: FeedCreator[]
  isLoading: boolean
} {
  const pool = usePublicCreatorsPool()
  const subs = useSubscriptionsMe()
  const byHandle = useFollowStore((s) => s.byHandle)

  const data = useMemo(() => {
    const items = pool.data ?? []
    const profileIds = new Set<string>()
    const handles = new Set<string>()
    for (const sub of subs.data ?? []) {
      if (!sub.entitled) continue
      if (sub.plan?.creatorProfileId) profileIds.add(sub.plan.creatorProfileId)
      const handle = sub.plan?.creator?.username?.replace(/^@/, '').toLowerCase()
      if (handle) handles.add(handle)
    }

    return items
      .filter((creator) => {
        const handle = creator.handle.replace(/^@/, '').toLowerCase()
        if (byHandle[handle]) return false
        if (handles.has(handle)) return false
        if (profileIds.has(creator.id)) return false
        return true
      })
      .slice(0, limit)
      .map((creator) => ({
        ...creator,
        isSubscribed: false,
        isFollowing: false,
      }))
  }, [pool.data, subs.data, byHandle, limit])

  return {
    data,
    isLoading: pool.isLoading || subs.isLoading,
  }
}
