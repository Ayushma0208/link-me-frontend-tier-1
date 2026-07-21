'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
  SquareCheck,
  SlidersHorizontal,
} from 'lucide-react'

import { ContentBulkBar } from '@/components/creator-studio/content/ContentBulkBar'
import { ContentLibraryCard } from '@/components/creator-studio/content/ContentLibraryCard'
import { ContentPreviewModal } from '@/components/creator-studio/content/ContentPreviewModal'
import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import type { StudioPost } from '@/data/creator-studio'
import {
  deletePost,
  ensureCreatorProfile,
  fetchMyPosts,
  mapApiPostToStudio,
} from '@/lib/studio-api'
import { cn } from '@/lib/utils'

type LibraryTab =
  | 'all'
  | 'images'
  | 'videos'
  | 'reels'
  | 'locked'
  | 'public'
  | 'drafts'
  | 'scheduled'

type SortKey = 'newest' | 'oldest' | 'views' | 'likes'

const TABS: { id: LibraryTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'images', label: 'Images' },
  { id: 'videos', label: 'Videos' },
  { id: 'reels', label: 'Reels' },
  { id: 'locked', label: 'Locked' },
  { id: 'public', label: 'Public' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'scheduled', label: 'Scheduled' },
]

function matchesTab(post: StudioPost, tab: LibraryTab) {
  switch (tab) {
    case 'all':
      return true
    case 'images':
      return post.type === 'image' || post.type === 'carousel'
    case 'videos':
      return post.type === 'video'
    case 'reels':
      return post.type === 'reel'
    case 'locked':
      return post.visibility === 'subscribers' || post.visibility === 'ppv'
    case 'public':
      return post.visibility === 'public'
    case 'drafts':
      return post.status === 'draft'
    case 'scheduled':
      return post.status === 'scheduled'
  }
}

export function ContentLibraryStudio() {
  const prefersReducedMotion = useReducedMotion()
  const [posts, setPosts] = useState<StudioPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [tab, setTab] = useState<LibraryTab>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [view, setView] = useState<'grid' | 'card'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      await ensureCreatorProfile()
      const items = await fetchMyPosts({ page: 1, limit: 100 })
      setPosts(items.map(mapApiPostToStudio))
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Could not load your content'
      )
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  const previewPost = posts.find((p) => p.id === previewId) ?? null

  const counts = useMemo(() => {
    const map = Object.fromEntries(TABS.map((t) => [t.id, 0])) as Record<
      LibraryTab,
      number
    >
    for (const post of posts) {
      for (const t of TABS) {
        if (matchesTab(post, t.id)) map[t.id] += 1
      }
    }
    return map
  }, [posts])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = posts.filter((p) => matchesTab(p, tab))
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.caption?.toLowerCase().includes(q) ||
          p.type.includes(q) ||
          p.visibility.includes(q) ||
          p.status.includes(q)
      )
    }
    list = [...list].sort((a, b) => {
      if (sort === 'views') return b.views - a.views
      if (sort === 'likes') return b.likes - a.likes
      if (sort === 'oldest')
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    return list
  }, [posts, tab, query, sort])

  function flash(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  function toggleSelect(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    )
  }

  async function deletePosts(ids: string[]) {
    try {
      await Promise.all(ids.map((id) => deletePost(id)))
      setPosts((current) => current.filter((p) => !ids.includes(p.id)))
      setSelected((s) => s.filter((id) => !ids.includes(id)))
      if (previewId && ids.includes(previewId)) setPreviewId(null)
      flash(ids.length > 1 ? `Deleted ${ids.length} items` : 'Deleted')
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  function editPost(post: StudioPost) {
    flash(`Editing “${post.title}” from Create Post is coming soon`)
  }

  return (
    <div>
      <StudioPageHeader
        title="Content Library"
        description="Search, filter, and manage every image, video, reel, and draft in one place."
        actions={
          <Link
            href="/influencer/create/post"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-4 text-[13px] font-semibold text-white shadow-[0_12px_32px_rgba(217,70,239,0.35)]"
          >
            <Plus className="size-4" />
            Create post
          </Link>
        }
      />

      <StudioGlassCard className="mb-5 space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, caption, type…"
              className="h-11 w-full rounded-full border border-white/10 bg-white/[0.04] pr-4 pl-10 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-full border px-3.5 text-[12px] font-semibold',
                filtersOpen
                  ? 'border-fuchsia-400/35 bg-fuchsia-500/15 text-white'
                  : 'border-white/10 bg-white/[0.04] text-white/65'
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              Filters
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectionMode((v) => !v)
                setSelected([])
              }}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-full border px-3.5 text-[12px] font-semibold',
                selectionMode
                  ? 'border-fuchsia-400/35 bg-fuchsia-500/15 text-white'
                  : 'border-white/10 bg-white/[0.04] text-white/65'
              )}
            >
              <SquareCheck className="size-3.5" />
              Bulk select
            </button>
            <div className="flex rounded-full border border-white/10 bg-white/[0.03] p-1">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setView('grid')}
                className={cn(
                  'rounded-full p-2',
                  view === 'grid' ? 'bg-white text-black' : 'text-white/50'
                )}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Card view"
                onClick={() => setView('card')}
                className={cn(
                  'rounded-full p-2',
                  view === 'card' ? 'bg-white text-black' : 'text-white/50'
                )}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {filtersOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
                <span className="text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
                  Sort
                </span>
                {(
                  [
                    ['newest', 'Newest'],
                    ['oldest', 'Oldest'],
                    ['views', 'Most views'],
                    ['likes', 'Most likes'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSort(id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-[12px] font-medium',
                      sort === id
                        ? 'border-white/20 bg-white text-black'
                        : 'border-white/10 text-white/50 hover:text-white'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </StudioGlassCard>

      <div
        className="mb-5 flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
      >
        {TABS.map((item) => {
          const active = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={cn(
                'relative shrink-0 rounded-full px-3.5 py-2 text-[12px] font-semibold transition sm:px-4 sm:text-[13px]',
                active ? 'text-black' : 'text-white/50 hover:text-white'
              )}
            >
              {active ? (
                <motion.span
                  layoutId="content-lib-tab"
                  className="absolute inset-0 rounded-full bg-white"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 34 }
                  }
                />
              ) : null}
              <span className="relative z-10">
                {item.label}
                <span className="ml-1.5 tabular-nums opacity-55">
                  {counts[item.id]}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {toast ? (
        <p className="mb-4 text-[13px] font-medium text-fuchsia-200">{toast}</p>
      ) : null}
      {loadError ? (
        <p className="mb-4 text-[13px] text-rose-300">{loadError}</p>
      ) : null}

      {loading ? (
        <StudioGlassCard className="flex min-h-[240px] items-center justify-center gap-2 text-white/50">
          <Loader2 className="size-4 animate-spin" />
          Loading your content…
        </StudioGlassCard>
      ) : visible.length === 0 ? (
        <StudioGlassCard className="flex min-h-[240px] flex-col items-center justify-center px-6 py-12 text-center">
          <p className="text-lg font-semibold text-white">
            {posts.length === 0 ? 'No posts yet' : 'No content found'}
          </p>
          <p className="mt-2 max-w-sm text-[14px] text-white/40">
            {posts.length === 0
              ? 'Publish your first image or video to see it here.'
              : 'Try another tab or clear your search.'}
          </p>
          <Link
            href="/influencer/create/post"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-black"
          >
            <Plus className="size-4" />
            Create post
          </Link>
        </StudioGlassCard>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((post, index) => (
            <ContentLibraryCard
              key={post.id}
              post={post}
              view="grid"
              selected={selected.includes(post.id)}
              selectionMode={selectionMode}
              delay={Math.min(index * 0.03, 0.24)}
              onToggleSelect={() => toggleSelect(post.id)}
              onPreview={() => setPreviewId(post.id)}
              onEdit={() => editPost(post)}
              onDuplicate={() =>
                flash('Duplicate from the API is coming soon')
              }
              onDelete={() => void deletePosts([post.id])}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((post, index) => (
            <ContentLibraryCard
              key={post.id}
              post={post}
              view="card"
              selected={selected.includes(post.id)}
              selectionMode={selectionMode}
              delay={Math.min(index * 0.03, 0.2)}
              onToggleSelect={() => toggleSelect(post.id)}
              onPreview={() => setPreviewId(post.id)}
              onEdit={() => editPost(post)}
              onDuplicate={() =>
                flash('Duplicate from the API is coming soon')
              }
              onDelete={() => void deletePosts([post.id])}
            />
          ))}
        </div>
      )}

      <ContentBulkBar
        count={selected.length}
        onClear={() => setSelected([])}
        onDuplicate={() => flash('Duplicate from the API is coming soon')}
        onDelete={() => void deletePosts(selected)}
      />

      <ContentPreviewModal
        open={!!previewPost}
        post={previewPost}
        onClose={() => setPreviewId(null)}
        onEdit={() => {
          if (previewPost) editPost(previewPost)
        }}
        onDuplicate={() => flash('Duplicate from the API is coming soon')}
        onDelete={() => {
          if (previewPost) void deletePosts([previewPost.id])
        }}
      />
    </div>
  )
}
