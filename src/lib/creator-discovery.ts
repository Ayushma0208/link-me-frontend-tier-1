import { api, getTokens } from '@/lib/api'
import type { FeedCreator } from '@/data/user-feed'
import { listPublicCreators } from '@/lib/public-creators'
import { useFollowStore } from '@/stores/follows'

export interface MembershipRow {
  entitled: boolean
  plan: {
    creatorProfileId: string
    creator?: { username?: string } | null
  }
}

/** Active / entitled subscription creator profile IDs for the signed-in user. */
export async function fetchSubscribedCreatorIds(): Promise<{
  profileIds: Set<string>
  handles: Set<string>
}> {
  const profileIds = new Set<string>()
  const handles = new Set<string>()
  if (!getTokens()?.accessToken) return { profileIds, handles }
  try {
    const items = await api<MembershipRow[]>('/subscriptions/me?limit=100')
    for (const sub of items ?? []) {
      if (!sub.entitled) continue
      if (sub.plan?.creatorProfileId) profileIds.add(sub.plan.creatorProfileId)
      const handle = sub.plan?.creator?.username?.replace(/^@/, '').toLowerCase()
      if (handle) handles.add(handle)
    }
  } catch {
    // ignore
  }
  return { profileIds, handles }
}

/** Admin AI creators the fan has not followed and not subscribed to. */
export async function listDiscoverCreators(options?: {
  limit?: number
}): Promise<FeedCreator[]> {
  const limit = options?.limit ?? 8
  const items = await listPublicCreators({ limit: 40 })
  const { profileIds, handles } = await fetchSubscribedCreatorIds()
  const following = useFollowStore.getState().byHandle

  return items
    .filter((creator) => {
      const handle = creator.handle.replace(/^@/, '').toLowerCase()
      if (following[handle]) return false
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
}
