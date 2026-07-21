'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react'

import type { UploadedMedia } from '@/components/creator-studio/create-post/MediaDropzone'
import { cn } from '@/lib/utils'

export interface MediaPreviewProps {
  files: UploadedMedia[]
  onRemove: (id: string) => void
  onClear: () => void
  className?: string
}

export function MediaPreview({
  files,
  onRemove,
  onClear,
  className,
}: MediaPreviewProps) {
  const prefersReducedMotion = useReducedMotion()
  const [index, setIndex] = useState(0)

  if (!files.length) return null

  const safeIndex = Math.min(index, files.length - 1)
  const current = files[safeIndex]!

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
          Media preview
        </p>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-[12px] text-white/40 hover:text-rose-300"
        >
          <Trash2 className="size-3.5" />
          Clear all
        </button>
      </div>

      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black/40">
        <div className="relative aspect-[4/5] sm:aspect-video">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              {current.kind === 'video' ? (
                <video
                  src={current.url}
                  controls
                  className="size-full object-contain bg-black"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.url}
                  alt={current.name}
                  className="size-full object-contain bg-black"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {files.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={() =>
                  setIndex((i) => (i - 1 + files.length) % files.length)
                }
                className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => setIndex((i) => (i + 1) % files.length)}
                className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md"
              >
                <ChevronRight className="size-4" />
              </button>
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-md">
                {safeIndex + 1} / {files.length}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {files.map((file, i) => (
          <div key={file.id} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                'relative block size-16 overflow-hidden rounded-xl border',
                i === safeIndex
                  ? 'border-fuchsia-400/50 ring-2 ring-fuchsia-400/25'
                  : 'border-white/10'
              )}
            >
              {file.kind === 'video' ? (
                <video src={file.url} className="size-full object-cover" muted />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.url} alt="" className="size-full object-cover" />
              )}
            </button>
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              onClick={() => {
                onRemove(file.id)
                setIndex((prev) => Math.max(0, Math.min(prev, files.length - 2)))
              }}
              className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-black/80 text-white ring-1 ring-white/20"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>

      <p className="truncate text-[12px] text-white/40">
        {current.name} · {current.sizeLabel}
      </p>
    </div>
  )
}
