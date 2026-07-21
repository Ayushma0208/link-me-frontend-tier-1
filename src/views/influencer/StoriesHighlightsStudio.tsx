'use client'

import { useEffect, useMemo, useState, type DragEvent } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Plus, Sparkles, CircleDot } from 'lucide-react'

import { HighlightEditorModal } from '@/components/creator-studio/stories/HighlightEditorModal'
import { HighlightManageCard } from '@/components/creator-studio/stories/HighlightManageCard'
import { StoryManageCard } from '@/components/creator-studio/stories/StoryManageCard'
import { StoryPreviewViewer } from '@/components/creator-studio/stories/StoryPreviewViewer'
import { StoryUploadModal } from '@/components/creator-studio/stories/StoryUploadModal'
import { NewHighlightButton } from '@/components/creator-studio/HighlightCard'
import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import { StoryUploadRing } from '@/components/creator-studio/StoryUpload'
import {
  isStoryActive,
  type StudioHighlight,
  type StudioStory,
} from '@/data/creator-studio'
import { api } from '@/lib/api'
import { uploadMediaFile } from '@/lib/media-upload'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

type TabId = 'active' | 'expired' | 'highlights'

const TABS: { id: TabId; label: string }[] = [
  { id: 'active', label: 'Active Stories' },
  { id: 'expired', label: 'Expired Stories' },
  { id: 'highlights', label: 'Highlights' },
]

type StoryDto = {
  id: string
  mediaType: 'IMAGE' | 'VIDEO'
  mediaKey: string
  mediaUrl?: string | null
  viewCount: number
  expiresAt: string
  createdAt: string
}

type HighlightDto = {
  id: string
  title: string
  coverKey?: string | null
  coverUrl?: string | null
  storyCount: number
  stories?: { id: string }[]
}

function toStudioStory(story: StoryDto): StudioStory {
  return {
    id: story.id,
    mediaUrl: story.mediaUrl || story.mediaKey,
    type: story.mediaType === 'VIDEO' ? 'video' : 'image',
    views: story.viewCount,
    expiresAt: story.expiresAt,
    createdAt: story.createdAt,
  }
}

function toStudioHighlight(
  highlight: HighlightDto,
  stories: StudioStory[]
): StudioHighlight {
  const storyIds = highlight.stories?.map((story) => story.id) ?? []
  return {
    id: highlight.id,
    title: highlight.title,
    cover:
      highlight.coverUrl ||
      stories.find((story) => storyIds.includes(story.id))?.mediaUrl ||
      highlight.coverKey ||
      '',
    storyIds,
    storyCount: highlight.storyCount ?? storyIds.length,
  }
}

function tabFromPath(pathname: string, queryTab: string | null): TabId {
  if (queryTab === 'expired' || queryTab === 'highlights' || queryTab === 'active') {
    return queryTab
  }
  if (pathname.includes('/highlights')) return 'highlights'
  return 'active'
}

export function StoriesHighlightsStudio() {
  const prefersReducedMotion = useReducedMotion()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState<TabId>(() =>
    tabFromPath(pathname, searchParams.get('tab'))
  )

  useEffect(() => {
    setTab(tabFromPath(pathname, searchParams.get('tab')))
  }, [pathname, searchParams])

  const [stories, setStories] = useState<StudioStory[]>([])
  const [highlights, setHighlights] = useState<StudioHighlight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [previewList, setPreviewList] = useState<StudioStory[]>([])

  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<StudioHighlight | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const studio = await api<{
          stories: StoryDto[]
          highlights: HighlightDto[]
        }>('/creators/me/stories/studio')
        if (cancelled) return
        const nextStories = studio.stories.map(toStudioStory)
        setStories(nextStories)
        setHighlights(
          studio.highlights.map((item) =>
            toStudioHighlight(item, nextStories)
          )
        )
        setError(null)
      } catch (reason) {
        if (!cancelled) {
          setError(
            reason instanceof Error ? reason.message : 'Could not load stories'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const activeStories = useMemo(
    () => stories.filter((s) => isStoryActive(s)),
    [stories]
  )
  const expiredStories = useMemo(
    () => stories.filter((s) => !isStoryActive(s)),
    [stories]
  )

  function selectTab(next: TabId) {
    setTab(next)
    const base =
      next === 'highlights' ? '/influencer/highlights' : '/influencer/stories'
    const qs = next === 'expired' ? '?tab=expired' : ''
    router.replace(`${base}${qs}`, { scroll: false })
  }

  function openPreview(list: StudioStory[], index: number) {
    setPreviewList(list)
    setPreviewIndex(index)
    setPreviewOpen(true)
  }

  function handleDragStart(e: DragEvent, story: StudioStory) {
    e.dataTransfer.setData('text/story-id', story.id)
    e.dataTransfer.effectAllowed = 'copy'
  }

  async function addStoryToHighlight(highlightId: string, storyId: string) {
    const highlight = highlights.find((item) => item.id === highlightId)
    if (!highlight || highlight.storyIds.includes(storyId)) return
    const storyIds = [...highlight.storyIds, storyId]
    try {
      await api(`/creators/me/highlights/${highlightId}`, {
        method: 'PATCH',
        body: JSON.stringify({ storyIds }),
      })
      setHighlights((current) =>
        current.map((item) =>
          item.id === highlightId
            ? { ...item, storyIds, storyCount: storyIds.length }
            : item
        )
      )
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not update highlight')
    }
  }

  async function deleteStory(id: string) {
    try {
      await api(`/creators/me/stories/${id}`, { method: 'DELETE' })
      setStories((current) => current.filter((story) => story.id !== id))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not delete story')
    }
  }

  async function deleteHighlight(id: string) {
    try {
      await api(`/creators/me/highlights/${id}`, { method: 'DELETE' })
      setHighlights((current) => current.filter((item) => item.id !== id))
      setEditorOpen(false)
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Could not delete highlight'
      )
    }
  }

  return (
    <div>
      <StudioPageHeader
        title="Stories & Highlights"
        description="Manage 24-hour stories, revive expired ones into highlights, and curate lasting collections."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-4 text-[13px] font-semibold text-white shadow-[0_12px_32px_rgba(217,70,239,0.35)]"
            >
              <CircleDot className="size-4" />
              Upload Story
            </button>
            <button
              type="button"
              onClick={() => {
                setEditorMode('create')
                setEditing(null)
                setEditorOpen(true)
                selectTab('highlights')
              }}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 text-[13px] font-semibold text-white"
            >
              <Sparkles className="size-4" />
              Create Highlight
            </button>
          </div>
        }
      />

      {error ? (
        <p className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <StudioGlassCard glow="creator" className="mb-6 p-4 sm:p-5">
        <div className="flex items-center gap-4 overflow-x-auto pb-1">
          <StoryUploadRing onUpload={() => setUploadOpen(true)} />
          {loading
            ? [0, 1].map((i) => (
                <div
                  key={i}
                  className="size-[76px] shrink-0 animate-pulse rounded-full bg-white/10"
                />
              ))
            : activeStories.map((story, index) => (
            <button
              key={story.id}
              type="button"
              onClick={() => openPreview(activeStories, index)}
              className="shrink-0"
            >
              <div className="relative size-[76px] overflow-hidden rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-[2.5px]">
                <div className="relative size-full overflow-hidden rounded-full bg-[#0a0a10] p-[2px]">
                  <div
                    className="size-full rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${story.mediaUrl})` }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-white/40">
          {loading
            ? 'Loading your stories…'
            : 'Instagram-style tray — tap a ring to preview. Drag story cards into highlights below.'}
        </p>
      </StudioGlassCard>

      <div
        className="mb-6 flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-1"
        role="tablist"
      >
        {TABS.map((item) => {
          const active = tab === item.id
          const count =
            loading
              ? null
              : item.id === 'active'
                ? activeStories.length
                : item.id === 'expired'
                  ? expiredStories.length
                  : highlights.length
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectTab(item.id)}
              className={cn(
                'relative shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold transition',
                active ? 'text-black' : 'text-white/50 hover:text-white'
              )}
            >
              {active ? (
                <motion.span
                  layoutId="stories-hl-tab"
                  className="absolute inset-0 rounded-full bg-white"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="relative z-10">
                {item.label}
                {count != null ? (
                  <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
                ) : (
                  <span className="ml-1.5 inline-block h-3 w-3 animate-pulse rounded-full bg-current/30 align-middle" />
                )}
              </span>
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-[22px] bg-white/[0.06]"
              />
            ))}
          </motion.div>
        ) : tab === 'active' ? (
          <motion.div
            key="active"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {activeStories.length === 0 ? (
              <EmptyState
                title="No active stories"
                body="Upload an image or video story to appear here for 24 hours."
                actionLabel="Upload Story"
                onAction={() => setUploadOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                <AnimatePresence>
                  {activeStories.map((story, index) => (
                    <StoryManageCard
                      key={story.id}
                      story={story}
                      draggable
                      delay={index * 0.04}
                      onPreview={() => openPreview(activeStories, index)}
                      onDragStart={handleDragStart}
                      onDelete={() => void deleteStory(story.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        ) : null}

        {tab === 'expired' ? (
          <motion.div
            key="expired"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {expiredStories.length === 0 ? (
              <EmptyState
                title="No expired stories"
                body="Stories that pass 24 hours land here — drag them into a highlight to keep them."
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {expiredStories.map((story, index) => (
                  <StoryManageCard
                    key={story.id}
                    story={story}
                    draggable
                    delay={index * 0.04}
                    onPreview={() => openPreview(expiredStories, index)}
                    onDragStart={handleDragStart}
                    onDelete={() => void deleteStory(story.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : null}

        {tab === 'highlights' ? (
          <motion.div
            key="highlights"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <NewHighlightButton
              onClick={() => {
                setEditorMode('create')
                setEditing(null)
                setEditorOpen(true)
              }}
            />
            {highlights.map((highlight, index) => (
              <HighlightManageCard
                key={highlight.id}
                highlight={highlight}
                delay={index * 0.05}
                onEdit={() => {
                  setEditorMode('edit')
                  setEditing(highlight)
                  setEditorOpen(true)
                }}
                onDelete={() => void deleteHighlight(highlight.id)}
                onDropStory={(storyId) =>
                  void addStoryToHighlight(highlight.id, storyId)
                }
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <StoryUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onAdd={async ({ type, file }) => {
          try {
            const uploaded = await uploadMediaFile({
              file,
              purpose: 'STORY',
              type: type === 'video' ? 'VIDEO' : 'IMAGE',
            })
            if (!uploaded.url) throw new Error('Story upload returned no URL')
            const response = await api<{ story: StoryDto }>(
              '/creators/me/stories',
              {
                method: 'POST',
                body: JSON.stringify({
                  mediaType: type === 'video' ? 'VIDEO' : 'IMAGE',
                  mediaKey: uploaded.asset.storageKey || uploaded.url,
                  mediaUrl: uploaded.url,
                  expiresInHours: 24,
                }),
              }
            )
            setStories((current) => [toStudioStory(response.story), ...current])
            setError(null)
            selectTab('active')
          } catch (reason) {
            setError(
              reason instanceof Error ? reason.message : 'Could not upload story'
            )
          }
        }}
      />

      <StoryPreviewViewer
        open={previewOpen}
        stories={previewList}
        initialIndex={previewIndex}
        onClose={() => setPreviewOpen(false)}
        creator={
          user
            ? {
                displayName: user.name || user.username || 'Creator',
                username: user.username || 'creator',
                avatarUrl: user.avatar,
              }
            : null
        }
      />

      <HighlightEditorModal
        open={editorOpen}
        mode={editorMode}
        highlight={editing}
        stories={stories}
        onClose={() => setEditorOpen(false)}
        onSave={async (payload) => {
          try {
            if (editorMode === 'edit' && payload.id) {
              await api(`/creators/me/highlights/${payload.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                  title: payload.title,
                  coverUrl: payload.cover || null,
                  storyIds: payload.storyIds,
                }),
              })
              setHighlights((current) =>
                current.map((highlight) =>
                  highlight.id === payload.id
                    ? {
                        ...highlight,
                        title: payload.title,
                        cover: payload.cover,
                        storyIds: payload.storyIds,
                        storyCount: payload.storyIds.length,
                      }
                    : highlight
                )
              )
            } else {
              const response = await api<{ highlight: HighlightDto }>(
                '/creators/me/highlights',
                {
                  method: 'POST',
                  body: JSON.stringify({
                    title: payload.title,
                    coverUrl: payload.cover || null,
                    storyIds: payload.storyIds,
                  }),
                }
              )
              setHighlights((current) => [
                toStudioHighlight(response.highlight, stories),
                ...current,
              ])
            }
            setError(null)
            setEditorOpen(false)
            selectTab('highlights')
          } catch (reason) {
            setError(
              reason instanceof Error
                ? reason.message
                : 'Could not save highlight'
            )
          }
        }}
        onDelete={(id) => void deleteHighlight(id)}
      />
    </div>
  )
}

function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string
  body: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <StudioGlassCard className="flex min-h-[220px] flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 max-w-md text-[14px] text-white/40">{body}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-black"
        >
          <Plus className="size-4" />
          {actionLabel}
        </button>
      ) : null}
    </StudioGlassCard>
  )
}
