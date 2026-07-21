'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

import { ExploreCategories } from '@/components/dashboard/ExploreCategories'
import { ExploreMasonryCard } from '@/components/dashboard/ExploreMasonryCard'
import { ExploreSearch } from '@/components/dashboard/ExploreSearch'
import { SubscriptionModal } from '@/components/dashboard/SubscriptionModal'
import { TrendingCreators } from '@/components/dashboard/TrendingCreators'
import {
  buildExplorePage,
  exploreCategories,
  feedCreatorsById,
  type ExploreCategory,
  type ExploreItem,
  type FeedCreator,
  type FeedPost,
} from '@/data/user-feed'
import { listPublicCreators } from '@/lib/public-creators'

const MAX_PAGES = 10

function filterItems(items: ExploreItem[], query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter((item) => {
    const creator = feedCreatorsById[item.creatorId]
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.mediaType.toLowerCase().includes(q) ||
      creator?.name.toLowerCase().includes(q) ||
      creator?.handle.toLowerCase().includes(q) ||
      creator?.bio.toLowerCase().includes(q)
    )
  })
}

export function ExplorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''

  const [category, setCategory] = useState<ExploreCategory>('For You')
  const [query, setQuery] = useState(urlQuery)
  const [items, setItems] = useState<ExploreItem[]>(() =>
    buildExplorePage(0, 'For You')
  )
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [unlockItem, setUnlockItem] = useState<ExploreItem | null>(null)
  const [trendingCreators, setTrendingCreators] = useState<FeedCreator[]>([])

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const pageRef = useRef(0)
  const loadingRef = useRef(false)
  const categoryRef = useRef<ExploreCategory>('For You')

  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const items = await listPublicCreators({
          limit: 12,
          q: urlQuery || undefined,
        })
        if (!cancelled) setTrendingCreators(items)
      } catch {
        if (!cancelled) setTrendingCreators([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [urlQuery])

  const visibleItems = useMemo(() => filterItems(items, query), [items, query])

  function updateQuery(next: string) {
    setQuery(next)
    const params = new URLSearchParams(searchParams.toString())
    if (next.trim()) params.set('q', next.trim())
    else params.delete('q')
    const qs = params.toString()
    router.replace(qs ? `/user/explore?${qs}` : '/user/explore', {
      scroll: false,
    })
  }

  const changeCategory = useCallback((next: ExploreCategory) => {
    categoryRef.current = next
    pageRef.current = 0
    loadingRef.current = false
    setCategory(next)
    setHasMore(true)
    setItems(buildExplorePage(0, next))
    setLoading(false)
  }, [])

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoading(true)

    window.setTimeout(() => {
      const nextPage = pageRef.current + 1
      if (nextPage >= MAX_PAGES) {
        setHasMore(false)
        loadingRef.current = false
        setLoading(false)
        return
      }
      pageRef.current = nextPage
      setItems((current) => [
        ...current,
        ...buildExplorePage(nextPage, categoryRef.current),
      ])
      loadingRef.current = false
      setLoading(false)
    }, 480)
  }, [hasMore])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '420px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore])

  const unlockCreator = unlockItem
    ? feedCreatorsById[unlockItem.creatorId] ?? null
    : null

  const unlockPost: FeedPost | null =
    unlockItem && unlockCreator
      ? {
          id: unlockItem.id,
          creatorId: unlockItem.creatorId,
          title: unlockItem.title,
          caption: unlockItem.title,
          mediaUrl: unlockItem.imageUrl,
          thumbnailUrl: unlockItem.imageUrl,
          blurredThumbnailUrl: unlockItem.imageUrl,
          type: unlockItem.mediaType === 'reel' ? 'reel' : unlockItem.mediaType,
          locked: true,
          lockKind: 'ppv',
          price: unlockItem.price,
          likes: 0,
          comments: 0,
          source: 'trending',
          createdAt: new Date().toISOString(),
        }
      : null

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7">
      <header className="space-y-4">
        <div className="space-y-1">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase"
          >
            Explore
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl font-extrabold tracking-tight text-white sm:text-[2rem]"
          >
            Discover creators
          </motion.h1>
          <p className="max-w-xl text-[15px] text-white/45">
            Pinterest masonry, Instagram polish, TikTok energy — browse drops,
            reels, and exclusives.
          </p>
        </div>

        <ExploreSearch value={query} onChange={updateQuery} />
      </header>

      {!query ? <TrendingCreators creators={trendingCreators} /> : null}

      <ExploreCategories
        categories={exploreCategories}
        value={category}
        onChange={changeCategory}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] text-white/35">
          {query
            ? `${visibleItems.length} result${visibleItems.length === 1 ? '' : 's'} for “${query}”`
            : `${category} · images · videos · reels`}
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {visibleItems.length > 0 ? (
          <motion.div
            key={`${category}-${query}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="columns-2 gap-3 sm:columns-3 xl:columns-4"
          >
            {visibleItems.map((item, index) => (
              <ExploreMasonryCard
                key={item.id}
                item={item}
                trending={!query && category === 'For You' && index < 3}
                onUnlock={() => setUnlockItem(item)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-[220px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center"
          >
            <p className="text-lg font-semibold text-white">No matches</p>
            <p className="mt-1 max-w-sm text-[14px] text-white/40">
              Try another search or switch categories.
            </p>
            <button
              type="button"
              onClick={() => updateQuery('')}
              className="mt-4 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black"
            >
              Clear search
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={sentinelRef} className="flex flex-col items-center gap-2 py-8">
        {loading ? (
          <div className="flex items-center gap-2 text-[13px] text-white/40">
            <span className="size-5 animate-spin rounded-full border-2 border-white/15 border-t-white/60" />
            Loading more
          </div>
        ) : null}
        {!hasMore && !query ? (
          <p className="text-[13px] text-white/30">You’ve reached the end</p>
        ) : (
          <span className="sr-only">Scroll for more</span>
        )}
      </div>

      <SubscriptionModal
        open={Boolean(unlockItem)}
        post={unlockPost}
        creator={unlockCreator}
        onClose={() => setUnlockItem(null)}
        onBuyPost={() => setUnlockItem(null)}
        onSubscribe={() => setUnlockItem(null)}
      />
    </div>
  )
}
