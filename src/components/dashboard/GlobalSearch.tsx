'use client'

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  BadgeCheck,
  Clock3,
  Flame,
  FolderKanban,
  Hash,
  ImageIcon,
  Search,
  TrendingUp,
  UserRound,
  X,
} from 'lucide-react'

import {
  hasSearchResults,
  searchGlobal,
  TRENDING_SEARCHES,
  type SearchResults,
} from '@/data/search'
import { listPublicCreators } from '@/lib/public-creators'
import {
  clearRecentSearches,
  getRecentSearches,
  pushRecentSearch,
  removeRecentSearch,
  type RecentSearch,
} from '@/lib/recent-searches'
import { cn, formatFollowers } from '@/lib/utils'

export interface GlobalSearchProps {
  className?: string
  compact?: boolean
}

type FlatLink = {
  id: string
  href: string
  label: string
  kind: 'recent' | 'trending' | 'creator' | 'post' | 'tag' | 'category'
}

export function GlobalSearch({ className, compact = false }: GlobalSearchProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [recent, setRecent] = useState<RecentSearch[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [apiCreators, setApiCreators] = useState<
    SearchResults['creators']
  >([])

  const localResults = useMemo(() => searchGlobal(query, 5), [query])

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setApiCreators([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const items = await listPublicCreators({ q, limit: 5 })
        if (cancelled) return
        setApiCreators(
          items.map((creator) => ({
            kind: 'creator' as const,
            id: `api-creator-${creator.id}`,
            creator,
          }))
        )
      } catch {
        if (!cancelled) setApiCreators([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [query])

  const results = useMemo(() => {
    const seen = new Set<string>()
    const creators = [...apiCreators, ...localResults.creators].filter(
      (hit) => {
        const handle = hit.creator.handle.toLowerCase()
        if (seen.has(handle)) return false
        seen.add(handle)
        return true
      }
    ).slice(0, 5)
    return { ...localResults, creators }
  }, [apiCreators, localResults])
  const emptyQuery = query.trim().length === 0
  const showIdle = open && emptyQuery
  const showResults = open && !emptyQuery

  useEffect(() => {
    setRecent(getRecentSearches())
  }, [])

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
        window.setTimeout(() => inputRef.current?.focus(), 0)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const flatLinks: FlatLink[] = useMemo(() => {
    if (showIdle) {
      const recentLinks = recent.map((item) => ({
        id: item.id,
        href: `/user/explore?q=${encodeURIComponent(item.query)}`,
        label: item.query,
        kind: 'recent' as const,
      }))
      const trendingLinks = TRENDING_SEARCHES.map((item) => ({
        id: item.id,
        href: `/user/explore?q=${encodeURIComponent(item.query)}`,
        label: item.query,
        kind: 'trending' as const,
      }))
      return [...recentLinks, ...trendingLinks]
    }

    return [
      ...results.creators.map((hit) => ({
        id: hit.id,
        href: `/${hit.creator.handle}`,
        label: hit.creator.name,
        kind: 'creator' as const,
      })),
      ...results.posts.map((hit) => ({
        id: hit.id,
        href: `/${hit.creator.handle}`,
        label: hit.post.title,
        kind: 'post' as const,
      })),
      ...results.tags.map((hit) => ({
        id: hit.id,
        href: `/user/explore?q=${encodeURIComponent(hit.tag)}`,
        label: hit.tag,
        kind: 'tag' as const,
      })),
      ...results.categories.map((hit) => ({
        id: hit.id,
        href: `/user/explore?q=${encodeURIComponent(hit.category)}`,
        label: hit.category,
        kind: 'category' as const,
      })),
    ]
  }, [showIdle, recent, results])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, open, showIdle])

  const commitSearch = useCallback(
    (value: string) => {
      const cleaned = value.trim()
      if (!cleaned) return
      setRecent(pushRecentSearch(cleaned))
      setOpen(false)
      setQuery(cleaned)
      router.push(`/user/explore?q=${encodeURIComponent(cleaned)}`)
    },
    [router]
  )

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const link = flatLinks[activeIndex]
    if (link) {
      if (
        link.kind === 'recent' ||
        link.kind === 'trending' ||
        link.kind === 'tag' ||
        link.kind === 'category'
      ) {
        commitSearch(link.label)
        return
      }
      setRecent(pushRecentSearch(query || link.label))
      setOpen(false)
      router.push(link.href)
      return
    }
    commitSearch(query)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true)
    }
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(flatLinks.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const recentCount = recent.length

  return (
    <div ref={rootRef} className={cn('relative z-40 w-full', className)}>
      <form onSubmit={onSubmit} className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={
            compact ? 'Search…' : 'Search creators, posts, tags, categories…'
          }
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            flatLinks[activeIndex]
              ? `${listboxId}-option-${flatLinks[activeIndex]!.id}`
              : undefined
          }
          className={cn(
            'w-full rounded-full border border-white/10 bg-white/[0.05] pr-20 pl-10',
            'text-[14px] text-white placeholder:text-white/30',
            'outline-none backdrop-blur-xl transition-[border-color,background-color,box-shadow]',
            'hover:border-white/15 hover:bg-white/[0.07]',
            'focus:border-white/25 focus:bg-white/[0.08] focus:ring-4 focus:ring-fuchsia-500/15',
            compact ? 'h-10' : 'h-11'
          )}
        />
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="hidden rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-white/35 sm:inline">
              ⌘K
            </kbd>
          )}
        </div>
      </form>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={listboxId}
            role="listbox"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 8, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 6, scale: 0.98 }
            }
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'absolute inset-x-0 top-[calc(100%+10px)] z-50 overflow-hidden',
              'rounded-[28px] border border-white/12',
              'bg-[#0c0c12]/94 shadow-[0_32px_90px_rgba(0,0,0,0.65)]',
              'backdrop-blur-2xl backdrop-saturate-150',
              'max-h-[min(72dvh,560px)] overflow-y-auto'
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-fuchsia-500/10"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />

            <div className="relative">
              {showIdle ? (
                <IdlePanel
                  recent={recent}
                  activeIndex={activeIndex}
                  recentCount={recentCount}
                  listboxId={listboxId}
                  onPickRecent={(item) => commitSearch(item.query)}
                  onPickTrending={(q) => commitSearch(q)}
                  onRemove={(id) => setRecent(removeRecentSearch(id))}
                  onClear={() => {
                    clearRecentSearches()
                    setRecent([])
                  }}
                />
              ) : null}

              {showResults ? (
                <ResultsPanel
                  results={results}
                  activeIndex={activeIndex}
                  listboxId={listboxId}
                  onNavigate={(href, label) => {
                    setRecent(pushRecentSearch(query || label))
                    setOpen(false)
                    router.push(href)
                  }}
                />
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function IdlePanel({
  recent,
  activeIndex,
  recentCount,
  listboxId,
  onPickRecent,
  onPickTrending,
  onRemove,
  onClear,
}: {
  recent: RecentSearch[]
  activeIndex: number
  recentCount: number
  listboxId: string
  onPickRecent: (item: RecentSearch) => void
  onPickTrending: (query: string) => void
  onRemove: (id: string) => void
  onClear: () => void
}) {
  return (
    <div className="space-y-1 p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
          <Clock3 className="size-3.5" />
          Recent searches
        </p>
        {recent.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] font-medium text-white/40 hover:text-white"
          >
            Clear
          </button>
        ) : null}
      </div>

      {recent.length === 0 ? (
        <p className="px-1 py-4 text-[13px] text-white/35">
          No recent searches yet — try a creator, tag, or category.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {recent.map((item, index) => (
            <li key={item.id}>
              <div
                id={`${listboxId}-option-${item.id}`}
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  'flex items-center gap-2 rounded-2xl px-2 py-2',
                  index === activeIndex && 'bg-white/[0.08]'
                )}
              >
                <button
                  type="button"
                  onClick={() => onPickRecent(item)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/50">
                    <Clock3 className="size-4" aria-hidden />
                  </span>
                  <span className="truncate text-[14px] text-white/85">
                    {item.query}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${item.query}`}
                  onClick={() => onRemove(item.id)}
                  className="rounded-full p-1.5 text-white/30 hover:bg-white/10 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
        <Flame className="size-3.5 text-amber-300" />
        Trending searches
      </div>
      <div className="flex flex-wrap gap-2 px-1 pb-1">
        {TRENDING_SEARCHES.map((item, i) => {
          const index = recentCount + i
          return (
            <button
              key={item.id}
              id={`${listboxId}-option-${item.id}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => onPickTrending(item.query)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors',
                index === activeIndex
                  ? 'border-fuchsia-400/40 bg-fuchsia-500/20 text-white'
                  : 'border-white/10 bg-white/[0.04] text-white/65 hover:border-white/20 hover:text-white'
              )}
            >
              <TrendingUp className="size-3 text-amber-300/80" />
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ResultsPanel({
  results,
  activeIndex,
  listboxId,
  onNavigate,
}: {
  results: SearchResults
  activeIndex: number
  listboxId: string
  onNavigate: (href: string, label: string) => void
}) {
  if (!hasSearchResults(results)) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-[15px] font-semibold text-white">No results</p>
        <p className="mt-1 text-[13px] text-white/40">
          Try another creator, caption, tag, or category.
        </p>
      </div>
    )
  }

  let running = 0

  return (
    <div className="space-y-1 p-3 sm:p-4">
      {results.creators.length > 0 ? (
        <ResultSection title="Creators" icon={<UserRound className="size-3.5" />}>
          {results.creators.map((hit) => {
            const index = running++
            return (
              <button
                key={hit.id}
                id={`${listboxId}-option-${hit.id}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onClick={() =>
                  onNavigate(`/${hit.creator.handle}`, hit.creator.name)
                }
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors',
                  index === activeIndex
                    ? 'bg-white/[0.09]'
                    : 'hover:bg-white/[0.05]'
                )}
              >
                <Image
                  src={hit.creator.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full object-cover ring-1 ring-white/10"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 truncate text-[14px] font-semibold text-white">
                    {hit.creator.name}
                    {hit.creator.verified ? (
                      <BadgeCheck
                        className="size-3.5 fill-sky-500 text-white"
                        aria-hidden
                      />
                    ) : null}
                  </span>
                  <span className="block truncate text-[12px] text-white/40">
                    @{hit.creator.handle} ·{' '}
                    {formatFollowers(hit.creator.followers)} fans ·{' '}
                    {hit.creator.category}
                  </span>
                </span>
              </button>
            )
          })}
        </ResultSection>
      ) : null}

      {results.posts.length > 0 ? (
        <ResultSection title="Posts" icon={<ImageIcon className="size-3.5" />}>
          {results.posts.map((hit) => {
            const index = running++
            return (
              <button
                key={hit.id}
                id={`${listboxId}-option-${hit.id}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onClick={() =>
                  onNavigate(`/${hit.creator.handle}`, hit.post.title)
                }
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors',
                  index === activeIndex
                    ? 'bg-white/[0.09]'
                    : 'hover:bg-white/[0.05]'
                )}
              >
                <span className="relative size-10 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={hit.post.thumbnailUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-white">
                    {hit.post.title}
                  </span>
                  <span className="block truncate text-[12px] text-white/40">
                    @{hit.creator.handle} · {hit.post.likes.toLocaleString()}{' '}
                    likes
                    {hit.post.hashtags?.length
                      ? ` · #${hit.post.hashtags[0]}`
                      : ''}
                  </span>
                </span>
              </button>
            )
          })}
        </ResultSection>
      ) : null}

      {results.tags.length > 0 ? (
        <ResultSection title="Tags" icon={<Hash className="size-3.5" />}>
          {results.tags.map((hit) => {
            const index = running++
            return (
              <button
                key={hit.id}
                id={`${listboxId}-option-${hit.id}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onClick={() =>
                  onNavigate(
                    `/user/explore?q=${encodeURIComponent(hit.tag)}`,
                    hit.tag
                  )
                }
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors',
                  index === activeIndex
                    ? 'bg-white/[0.09]'
                    : 'hover:bg-white/[0.05]'
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200">
                  <Hash className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-white">
                    #{hit.tag}
                  </span>
                  <span className="block truncate text-[12px] text-white/40">
                    {hit.label} · {hit.count} matches
                  </span>
                </span>
              </button>
            )
          })}
        </ResultSection>
      ) : null}

      {results.categories.length > 0 ? (
        <ResultSection
          title="Categories"
          icon={<FolderKanban className="size-3.5" />}
        >
          {results.categories.map((hit) => {
            const index = running++
            return (
              <button
                key={hit.id}
                id={`${listboxId}-option-${hit.id}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onClick={() =>
                  onNavigate(
                    `/user/explore?q=${encodeURIComponent(hit.category)}`,
                    hit.category
                  )
                }
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors',
                  index === activeIndex
                    ? 'bg-white/[0.09]'
                    : 'hover:bg-white/[0.05]'
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10 text-sky-200">
                  <FolderKanban className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-white">
                    {hit.label}
                  </span>
                  <span className="block truncate text-[12px] text-white/40">
                    Category · {hit.count}+ drops
                  </span>
                </span>
              </button>
            )
          })}
        </ResultSection>
      ) : null}

      <Link
        href={`/user/explore?q=${encodeURIComponent(results.query)}`}
        className="mt-2 flex items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-pink-500/15 px-3 py-2.5 text-[13px] font-semibold text-white/80 transition hover:text-white"
        onClick={() => pushRecentSearch(results.query)}
      >
        See all results for “{results.query}”
      </Link>
    </div>
  )
}

function ResultSection({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="pb-2">
      <div className="mb-1.5 flex items-center gap-1.5 px-2 text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
        {icon}
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </section>
  )
}
