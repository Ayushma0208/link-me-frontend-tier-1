'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

import { PostCard } from '@/components/dashboard/PostCard'
import { SubscriptionModal } from '@/components/dashboard/SubscriptionModal'
import type { FeedCreator, FeedPost, FeedSource } from '@/data/user-feed'
import { api } from '@/lib/api'
import { getTokens } from '@/lib/api'
import { useSubscriptionsMe } from '@/lib/hooks/use-shared-queries'
import { pickImageSrc, isVideoUrl } from '@/lib/media-url'
import { useFollowStore } from '@/stores/follows'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 12

const FILTERS = [
  { id: 'all', label: 'For you' },
  { id: 'subscribed', label: 'Subscribed' },
  { id: 'following', label: 'Following' },
  { id: 'trending', label: 'Recommended' },
] as const

type FilterId = (typeof FILTERS)[number]['id']

interface ApiPost {
  id: string
  type: string
  title: string | null
  caption: string | null
  price: string | null
  likeCount: number
  commentCount: number
  locked: boolean
  unlockReason: string | null
  createdAt: string
  creator: {
    profileId: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    isVerified: boolean
  }
  media: Array<{
    url: string | null
    thumbnailKey: string | null
    blurredKey?: string | null
    type: string
  }>
}

const DEFAULT_AVATAR = 'https://picsum.photos/id/64/200/200'
const DEFAULT_COVER = 'https://picsum.photos/id/1015/1600/900'

function sourceForFilter(filter: FilterId): FeedSource {
  if (filter === 'subscribed') return 'subscribed'
  if (filter === 'following') return 'following'
  return 'trending'
}

function mapApiPost(
  post: ApiPost,
  source: FeedSource,
  subscribedProfileIds: Set<string>
): { post: FeedPost; creator: FeedCreator } {
  const media = post.media[0]
  const handle = post.creator.username.replace(/^@/, '').toLowerCase()
  const isVideo =
    post.type === 'VIDEO' ||
    post.type === 'REEL' ||
    media?.type === 'VIDEO' ||
    isVideoUrl(media?.url)
  const creatorId = post.creator.profileId
  const isSubscribed = subscribedProfileIds.has(creatorId)
  const unlockReason = post.unlockReason
  const hasPpvPrice = Boolean(post.price && Number(post.price) > 0)
  const isPpv =
    unlockReason === 'ppv' || (Boolean(post.locked) && hasPpvPrice)
  // Membership unlocks subscriber posts only — never PPV exclusives.
  const unlockedByMembership =
    isSubscribed && unlockReason === 'subscription' && !isPpv
  const isLocked = Boolean(post.locked) && !unlockedByMembership

  // Never feed video URLs into next/image — prefer thumbs / Cloudinary posters.
  const thumb = pickImageSrc(
    media?.thumbnailKey,
    media?.blurredKey,
    isVideo ? null : media?.url
  )
  const videoUrl =
    isVideo && !isLocked && media?.url && isVideoUrl(media.url)
      ? media.url
      : isVideo && !isLocked && media?.url
        ? media.url
        : undefined

  const creator: FeedCreator = {
    id: creatorId,
    name: post.creator.displayName || handle,
    username: `@${handle}`,
    handle,
    avatar: post.creator.avatarUrl || DEFAULT_AVATAR,
    coverImage: DEFAULT_COVER,
    bio: '',
    verified: post.creator.isVerified,
    followers: 0,
    category: 'Fashion',
    socialLinks: [],
    monthlyPrice: 299,
    isFollowing: source === 'following',
    isSubscribed,
    hasStory: false,
    storySeen: false,
  }

  const imageUrls = post.media
    .map((m) => {
      if (m.type === 'VIDEO' || isVideoUrl(m.url)) {
        return pickImageSrc(m.thumbnailKey, m.blurredKey, m.url)
      }
      return m.url || m.blurredKey || m.thumbnailKey
    })
    .filter(Boolean) as string[]

  const feedPost: FeedPost = {
    id: post.id,
    creatorId,
    title: post.title || 'Post',
    caption: post.caption || '',
    mediaUrl: isVideo ? videoUrl || thumb : thumb,
    mediaUrls: isVideo ? imageUrls : imageUrls.length ? imageUrls : [thumb],
    thumbnailUrl: thumb,
    blurredThumbnailUrl: pickImageSrc(media?.blurredKey, media?.thumbnailKey),
    videoUrl,
    type: post.type === 'REEL' ? 'reel' : isVideo ? 'video' : 'image',
    locked: isLocked,
    lockKind: isPpv
      ? 'ppv'
      : unlockReason === 'subscription' || (post.locked && !isPpv)
        ? 'subscribers'
        : null,
    price: post.price ? Number(post.price) : null,
    likes: post.likeCount,
    comments: post.commentCount,
    source: isSubscribed ? 'subscribed' : source,
    createdAt: post.createdAt,
  }

  return { post: feedPost, creator }
}

async function fetchFeedPage(
  page: number,
  mode: 'home' | 'discover'
): Promise<ApiPost[]> {
  const path =
    mode === 'discover'
      ? `/posts/feed/discover?page=${page}&limit=${PAGE_SIZE}`
      : `/posts/feed?page=${page}&limit=${PAGE_SIZE}`
  try {
    return (await api<ApiPost[]>(path)) ?? []
  } catch {
    if (mode === 'home') {
      return (
        (await api<ApiPost[]>(
          `/posts/feed/discover?page=${page}&limit=${PAGE_SIZE}`
        )) ?? []
      )
    }
    return []
  }
}

export interface HomeFeedProps {
  className?: string
}

export function HomeFeed({ className }: HomeFeedProps) {
  const followingByHandle = useFollowStore((s) => s.byHandle)
  const { data: memberships = [] } = useSubscriptionsMe()
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [creatorsById, setCreatorsById] = useState<Record<string, FeedCreator>>(
    {}
  )
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState<FilterId>('all')
  const [unlockPost, setUnlockPost] = useState<FeedPost | null>(null)
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])
  const [extraSubscribedIds, setExtraSubscribedIds] = useState<Set<string>>(
    () => new Set()
  )
  const subscribedProfileIds = useMemo(() => {
    const ids = new Set<string>()
    for (const sub of memberships) {
      if (sub.entitled && sub.plan?.creatorProfileId) {
        ids.add(sub.plan.creatorProfileId)
      }
    }
    for (const id of extraSubscribedIds) ids.add(id)
    return ids
  }, [memberships, extraSubscribedIds])
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (subscribedProfileIds.size === 0) return
    setCreatorsById((prev) => {
      const next = { ...prev }
      for (const id of Object.keys(next)) {
        if (subscribedProfileIds.has(id)) {
          next[id] = { ...next[id]!, isSubscribed: true }
        }
      }
      return next
    })
    setPosts((prev) =>
      prev.map((post) => {
        if (!subscribedProfileIds.has(post.creatorId)) return post
        // Unlock member-only posts; keep PPV exclusives locked until paid.
        if (post.lockKind === 'ppv') {
          return { ...post, source: 'subscribed' as const }
        }
        if (post.lockKind === 'subscribers') {
          return { ...post, locked: false, source: 'subscribed' as const }
        }
        return { ...post, source: 'subscribed' as const }
      })
    )
  }, [subscribedProfileIds])

  const loadPage = useCallback(
    async (pageNum: number, reset: boolean) => {
      if (loadingRef.current) return
      loadingRef.current = true
      setLoading(true)
      try {
        const loggedIn = Boolean(getTokens()?.accessToken)
        // For you / Subscribed / Following → home feed (follows + memberships)
        // Recommended → discover (everyone else)
        const mode: 'home' | 'discover' =
          !loggedIn || filter === 'trending' ? 'discover' : 'home'
        const items = await fetchFeedPage(pageNum, mode)
        const mapped = items.map((item) =>
          mapApiPost(item, sourceForFilter(filter), subscribedProfileIds)
        )

        setCreatorsById((prev) => {
          const next = reset ? {} : { ...prev }
          for (const row of mapped) next[row.creator.id] = row.creator
          return next
        })
        setPosts((prev) =>
          reset
            ? mapped.map((m) => m.post)
            : [...prev, ...mapped.map((m) => m.post)]
        )
        setHasMore(items.length >= PAGE_SIZE)
        setPage(pageNum)
      } catch {
        if (reset) setPosts([])
        setHasMore(false)
      } finally {
        setLoading(false)
        loadingRef.current = false
      }
    },
    [filter, subscribedProfileIds]
  )

  useEffect(() => {
    void loadPage(1, true)
  }, [loadPage])

  const loadMore = useCallback(() => {
    if (!hasMore || loadingRef.current) return
    void loadPage(page + 1, false)
  }, [hasMore, loadPage, page])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '480px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore])

  const visible = posts
    .map((post) => {
      if (unlockedIds.includes(post.id)) {
        return { ...post, locked: false }
      }
      if (
        subscribedProfileIds.has(post.creatorId) &&
        post.lockKind === 'subscribers'
      ) {
        return { ...post, locked: false }
      }
      return post
    })
    .filter((post) => {
      if (filter === 'all' || filter === 'trending') return true
      if (filter === 'subscribed') {
        return subscribedProfileIds.has(post.creatorId)
      }
      if (filter === 'following') {
        const creator = creatorsById[post.creatorId]
        const handle = creator?.handle?.replace(/^@/, '').toLowerCase()
        return Boolean(handle && followingByHandle[handle])
      }
      return true
    })

  const unlockCreator = unlockPost
    ? creatorsById[unlockPost.creatorId] ?? null
    : null

  return (
    <section className={cn('space-y-5', className)} aria-label="Home feed">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
            Feed
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
            From creators you love
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const active = filter === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors',
                active
                  ? 'border-white/20 bg-white text-black'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white'
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="space-y-6 sm:space-y-7">
        {visible.map((post) => {
          const creator = creatorsById[post.creatorId]
          if (!creator) return null
          return (
            <PostCard
              key={post.id}
              post={post}
              creator={creator}
              onUnlock={setUnlockPost}
            />
          )
        })}
        {!loading && visible.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-white/35">
            No posts yet. Follow or subscribe to AI creators to fill your feed.
          </p>
        ) : null}
      </div>

      <div ref={sentinelRef} className="flex flex-col items-center gap-3 py-6">
        {loading ? (
          <motion.div
            className="flex items-center gap-2 text-[13px] text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="size-5 animate-spin rounded-full border-2 border-white/15 border-t-white/60" />
            Loading more
          </motion.div>
        ) : null}
        {!hasMore && visible.length > 0 ? (
          <p className="text-[13px] text-white/30">You’re all caught up</p>
        ) : (
          <span className="sr-only">Scroll for more posts</span>
        )}
      </div>

      <SubscriptionModal
        open={Boolean(unlockPost)}
        post={unlockPost}
        creator={unlockCreator}
        onClose={() => setUnlockPost(null)}
        onBuyPost={(postId) => {
          setUnlockedIds((ids) => (ids.includes(postId) ? ids : [...ids, postId]))
          setUnlockPost(null)
        }}
        onSubscribe={(creatorId) => {
          setExtraSubscribedIds((prev) => new Set([...prev, creatorId]))
          setUnlockedIds((ids) => {
            const toUnlock = posts
              .filter(
                (p) =>
                  p.creatorId === creatorId &&
                  (p.lockKind === 'subscribers' || p.locked)
              )
              .map((p) => p.id)
            return Array.from(new Set([...ids, ...toUnlock]))
          })
          setUnlockPost(null)
        }}
      />
    </section>
  )
}
