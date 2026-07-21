'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Film, Image as ImageIcon, UploadCloud, X } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface StoryUploadModalProps {
  open: boolean
  onClose: () => void
  onAdd: (payload: {
    type: 'image' | 'video'
    mediaUrl: string
    name: string
    file: File
  }) => void
}

export function StoryUploadModal({
  open,
  onClose,
  onAdd,
}: StoryUploadModalProps) {
  const prefersReducedMotion = useReducedMotion()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!open) {
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      setFile(null)
      setName('')
      setUploading(false)
      setProgress(0)
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, preview])

  async function handleFile(file: File) {
    const kind = file.type.startsWith('video/') ? 'video' : 'image'
    setMediaType(kind)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    setFile(file)
    setName(file.name)
    setUploading(true)
    for (let p = 0; p <= 100; p += 5) {
      await new Promise((r) => setTimeout(r, 24))
      setProgress(p)
    }
    setUploading(false)
  }

  function confirm() {
    if (!preview || !file) return
    onAdd({ type: mediaType, mediaUrl: preview, name, file })
    setPreview(null)
    onClose()
  }

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
            className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[28px] border border-white/12 bg-[#0c0c12]/95 shadow-[0_40px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:rounded-[28px]"
          >
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-white">Upload Story</h2>
                <p className="text-[12px] text-white/40">Image or video · 24h</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 p-2 text-white/70"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'image' as const, label: 'Image', icon: ImageIcon },
                    { id: 'video' as const, label: 'Video', icon: Film },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMediaType(opt.id)}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-[13px] font-semibold transition',
                      mediaType === opt.id
                        ? 'border-fuchsia-400/40 bg-fuchsia-500/15 text-white'
                        : 'border-white/10 bg-white/[0.03] text-white/50'
                    )}
                  >
                    <opt.icon className="size-4" />
                    {opt.label}
                  </button>
                ))}
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') inputRef.current?.click()
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files?.[0]
                  if (file) void handleFile(file)
                }}
                className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[22px] border border-dashed border-white/15 bg-white/[0.03] px-4 text-center hover:border-fuchsia-400/35"
              >
                {preview ? (
                  mediaType === 'video' ? (
                    <video
                      src={preview}
                      className="max-h-56 w-full object-contain"
                      controls
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt=""
                      className="max-h-56 w-full object-contain"
                    />
                  )
                ) : (
                  <>
                    <UploadCloud className="size-8 text-fuchsia-200" />
                    <p className="mt-3 text-[14px] font-semibold text-white">
                      Drag & drop or browse
                    </p>
                    <p className="mt-1 text-[12px] text-white/40">
                      Dummy upload stays in your browser
                    </p>
                  </>
                )}
                {uploading ? (
                  <div className="mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-400"
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                ) : null}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleFile(file)
                  e.target.value = ''
                }}
              />

              <button
                type="button"
                disabled={!preview || uploading}
                onClick={confirm}
                className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-[14px] font-semibold text-white disabled:opacity-40"
              >
                Add Story
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
