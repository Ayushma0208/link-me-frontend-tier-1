'use client'

import { useEffect, useState, type DragEvent } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Pencil, Trash2, X } from 'lucide-react'

import {
  isStoryActive,
  type StudioHighlight,
  type StudioStory,
} from '@/data/creator-studio'
import { cn } from '@/lib/utils'

export interface HighlightEditorModalProps {
  open: boolean
  mode: 'create' | 'edit'
  highlight?: StudioHighlight | null
  stories: StudioStory[]
  onClose: () => void
  onSave: (payload: {
    id?: string
    title: string
    cover: string
    storyIds: string[]
  }) => void
  onDelete?: (id: string) => void
}

export function HighlightEditorModal({
  open,
  mode,
  highlight,
  stories,
  onClose,
  onSave,
  onDelete,
}: HighlightEditorModalProps) {
  const prefersReducedMotion = useReducedMotion()
  const [title, setTitle] = useState('')
  const [storyIds, setStoryIds] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(highlight?.title ?? '')
    setStoryIds(highlight?.storyIds ?? [])
  }, [open, highlight])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function toggleStory(id: string) {
    setStoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const id = e.dataTransfer.getData('text/story-id')
    if (id && !storyIds.includes(id)) setStoryIds((prev) => [...prev, id])
  }

  const cover =
    stories.find((s) => s.id === storyIds[0])?.mediaUrl ||
    highlight?.cover ||
    stories[0]?.mediaUrl ||
    ''
  const archivedStories = stories.filter((story) => !isStoryActive(story))
  const activeStories = stories.filter((story) => isStoryActive(story))

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-white/12 bg-[#0c0c12]/95 shadow-[0_40px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:rounded-[28px]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-[#0c0c12]/95 px-5 py-4 backdrop-blur-xl">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  {mode === 'create' ? (
                    'Create Highlight'
                  ) : (
                    <>
                      <Pencil className="size-4 text-fuchsia-200" />
                      Edit Highlight
                    </>
                  )}
                </h2>
                <p className="text-[12px] text-white/40">
                  Drag stories here or tap to select
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 p-2 text-white/70"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center gap-4">
                <div className="relative size-20 overflow-hidden rounded-full border-2 border-white/15 p-1">
                  <div className="relative size-full overflow-hidden rounded-full bg-white/5">
                    {cover ? (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                </div>
                <label className="min-w-0 flex-1 space-y-2">
                  <span className="text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
                    Title
                  </span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 24))}
                    placeholder="e.g. Summer 26"
                    className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 text-[14px] text-white outline-none focus:border-fuchsia-400/35"
                  />
                </label>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  'rounded-[22px] border border-dashed p-4 transition',
                  dragOver
                    ? 'border-fuchsia-400/50 bg-fuchsia-500/10'
                    : 'border-white/15 bg-white/[0.03]'
                )}
              >
                <p className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
                  Stories in highlight ({storyIds.length})
                </p>
                {storyIds.length === 0 ? (
                  <p className="py-6 text-center text-[13px] text-white/35">
                    Drop story cards here
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {storyIds.map((id) => {
                      const story = stories.find((s) => s.id === id)
                      if (!story) return null
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleStory(id)}
                          className="relative size-16 overflow-hidden rounded-xl border border-fuchsia-400/40"
                        >
                          <Image
                            src={story.mediaUrl}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
                  Archived stories
                </p>
                {archivedStories.length === 0 ? (
                  <p className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-5 text-center text-[13px] text-white/35">
                    Past stories will appear here after 24 hours.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {archivedStories.map((story) => {
                      const active = storyIds.includes(story.id)
                      return (
                        <StoryChoice
                          key={story.id}
                          story={story}
                          selected={active}
                          onClick={() => toggleStory(story.id)}
                        />
                      )
                    })}
                  </div>
                )}
              </div>

              {activeStories.length > 0 ? (
                <div>
                  <p className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
                    Active stories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeStories.map((story) => {
                      const active = storyIds.includes(story.id)
                      return (
                        <StoryChoice
                          key={story.id}
                          story={story}
                          selected={active}
                          onClick={() => toggleStory(story.id)}
                        />
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!title.trim() || storyIds.length === 0}
                  onClick={() =>
                    onSave({
                      id: highlight?.id,
                      title: title.trim(),
                      cover,
                      storyIds,
                    })
                  }
                  className="flex h-12 flex-1 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-[14px] font-semibold text-white disabled:opacity-40"
                >
                  {mode === 'create' ? 'Create Highlight' : 'Save changes'}
                </button>
                {mode === 'edit' && highlight && onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(highlight.id)}
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-rose-400/25 bg-rose-500/10 px-4 text-[13px] font-semibold text-rose-200"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function StoryChoice({
  story,
  selected,
  onClick,
}: {
  story: StudioStory
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative size-16 overflow-hidden rounded-xl border-2 transition',
        selected
          ? 'border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.35)]'
          : 'border-white/10 opacity-70 hover:opacity-100'
      )}
    >
      <Image
        src={story.mediaUrl}
        alt=""
        fill
        sizes="64px"
        className="object-cover"
      />
    </button>
  )
}
