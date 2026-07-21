'use client'

import { useCallback, useRef, useState, type DragEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, UploadCloud } from 'lucide-react'

import type { PostMediaType } from '@/data/creator-studio'
import {
  uploadMediaFile,
  type MediaPurpose,
  type MediaType,
} from '@/lib/media-upload'
import { cn } from '@/lib/utils'

export interface UploadedMedia {
  id: string
  name: string
  /** Local blob or remote CDN URL for preview. */
  url: string
  kind: 'image' | 'video'
  sizeLabel: string
  storageKey: string
  remoteUrl: string | null
  mimeType: string
  mediaType: MediaType
}

export interface MediaDropzoneProps {
  mediaType: PostMediaType
  files: UploadedMedia[]
  onFilesChange: (files: UploadedMedia[]) => void
  uploading: boolean
  progress: number
  onUploadStart: () => void
  onUploadProgress: (value: number) => void
  onUploadDone: () => void
  onUploadError?: (message: string) => void
  className?: string
}

const ACCEPT: Record<PostMediaType, string> = {
  image: 'image/jpeg,image/png,image/webp,image/gif',
  video: 'video/mp4,video/quicktime,video/webm',
  reel: 'video/mp4,video/quicktime,video/webm',
  carousel: 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm',
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function purposeFor(mediaType: PostMediaType): MediaPurpose {
  if (mediaType === 'reel') return 'REEL'
  return 'POST'
}

function apiMediaType(file: File): MediaType {
  return file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
}

export function MediaDropzone({
  mediaType,
  files,
  onFilesChange,
  uploading,
  progress,
  onUploadStart,
  onUploadProgress,
  onUploadDone,
  onUploadError,
  className,
}: MediaDropzoneProps) {
  const prefersReducedMotion = useReducedMotion()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [doneFlash, setDoneFlash] = useState(false)

  const maxFiles = mediaType === 'carousel' ? 10 : 1

  const uploadFiles = useCallback(
    async (incoming: FileList | File[]) => {
      const list = Array.from(incoming).slice(0, maxFiles)
      if (!list.length) return

      onUploadStart()
      onUploadProgress(8)

      try {
        const created: UploadedMedia[] = []
        for (let i = 0; i < list.length; i++) {
          const file = list[i]!
          const previewUrl = URL.createObjectURL(file)
          onUploadProgress(Math.round(((i + 0.35) / list.length) * 100))

          const { asset, url } = await uploadMediaFile({
            file,
            purpose: purposeFor(mediaType),
            type: apiMediaType(file),
          })

          if (!asset.storageKey) {
            URL.revokeObjectURL(previewUrl)
            throw new Error('Upload did not return a storage key')
          }

          created.push({
            id: asset.id,
            name: file.name,
            url: url || previewUrl,
            kind: file.type.startsWith('video/') ? 'video' : 'image',
            sizeLabel: formatBytes(file.size),
            storageKey: asset.storageKey,
            remoteUrl: url,
            mimeType: file.type || 'application/octet-stream',
            mediaType: apiMediaType(file),
          })

          if (url) URL.revokeObjectURL(previewUrl)
          onUploadProgress(Math.round(((i + 1) / list.length) * 100))
        }

        if (mediaType === 'carousel') {
          onFilesChange([...files, ...created].slice(0, 10))
        } else {
          files.forEach((f) => {
            if (f.url.startsWith('blob:')) URL.revokeObjectURL(f.url)
          })
          onFilesChange(created.slice(0, 1))
        }

        setDoneFlash(true)
        window.setTimeout(() => setDoneFlash(false), 1400)
      } catch (err) {
        onUploadError?.(
          err instanceof Error ? err.message : 'Upload failed. Try again.'
        )
      } finally {
        onUploadDone()
      }
    },
    [
      files,
      maxFiles,
      mediaType,
      onFilesChange,
      onUploadDone,
      onUploadError,
      onUploadProgress,
      onUploadStart,
    ]
  )

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files)
  }

  const hint =
    mediaType === 'carousel'
      ? 'Drop up to 10 images or clips'
      : mediaType === 'image'
        ? 'Drop a photo, or browse'
        : mediaType === 'reel'
          ? 'Drop a vertical video'
          : 'Drop a video file'

  return (
    <div className={cn('space-y-3', className)}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[24px] border border-dashed px-6 py-10 text-center transition',
          dragging
            ? 'border-fuchsia-400/60 bg-fuchsia-500/10'
            : 'border-white/15 bg-white/[0.03] hover:border-fuchsia-400/35 hover:bg-white/[0.05]',
          uploading && 'pointer-events-none'
        )}
      >
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="progress"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full max-w-xs flex-col items-center gap-4"
            >
              <div className="relative size-16">
                <svg className="size-16 -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="url(#uploadGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 28}
                    animate={{
                      strokeDashoffset:
                        2 * Math.PI * 28 * (1 - progress / 100),
                    }}
                    transition={{ ease: 'linear', duration: 0.05 }}
                  />
                  <defs>
                    <linearGradient id="uploadGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#d946ef" />
                      <stop offset="100%" stopColor="#f472b6" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-white">
                  {progress}%
                </span>
              </div>
              <p className="text-[13px] font-medium text-white/70">
                Uploading to Cloudinary…
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-400"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear', duration: 0.05 }}
                />
              </div>
            </motion.div>
          ) : doneFlash ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="flex size-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15 text-emerald-200">
                <Check className="size-6" strokeWidth={2.5} />
              </span>
              <p className="text-[14px] font-semibold text-white">Upload complete</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl border border-white/12 bg-gradient-to-br from-violet-500/25 to-pink-500/20">
                <UploadCloud className="size-6 text-fuchsia-100" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-white">
                  Drag & drop to upload
                </p>
                <p className="mt-1 text-[13px] text-white/40">{hint}</p>
              </div>
              <span className="rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-[12px] font-medium text-white/70">
                Browse files
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT[mediaType]}
          multiple={mediaType === 'carousel'}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void uploadFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>
      <p className="text-[11px] text-white/30">
        Files upload securely to Cloudinary when you select them.
      </p>
    </div>
  )
}
