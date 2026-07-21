'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Check, Eye, Rocket, Send } from 'lucide-react'

import {
  CaptionEditor,
  MediaDropzone,
  MediaPreview,
  MediaTypePicker,
  PostPreviewPanel,
  SchedulePost,
  VisibilityPricing,
  type UploadedMedia,
} from '@/components/creator-studio/create-post'
import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import type { ContentVisibility, PostMediaType } from '@/data/creator-studio'
import { api, ApiError } from '@/lib/api'
import {
  ensureCreatorProfile,
  mapMediaTypeToApi,
  mapVisibilityToApi,
} from '@/lib/studio-api'
import { cn } from '@/lib/utils'

function defaultSchedule() {
  const d = new Date(Date.now() + 3600_000)
  d.setMinutes(0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function CreatePostStudio() {
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()

  const [mediaType, setMediaType] = useState<PostMediaType>('image')
  const [files, setFiles] = useState<UploadedMedia[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [caption, setCaption] = useState('')
  const [visibility, setVisibility] = useState<ContentVisibility>('public')
  const [price, setPrice] = useState('99')
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleAt, setScheduleAt] = useState(defaultSchedule)
  const [showPreview, setShowPreview] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (mediaType !== 'carousel' && files.length > 1) {
      files.slice(1).forEach((f) => {
        if (f.url.startsWith('blob:')) URL.revokeObjectURL(f.url)
      })
      setFiles((prev) => prev.slice(0, 1))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when media type changes
  }, [mediaType])

  function clearFiles() {
    files.forEach((f) => {
      if (f.url.startsWith('blob:')) URL.revokeObjectURL(f.url)
    })
    setFiles([])
  }

  function removeFile(id: string) {
    setFiles((current) => {
      const target = current.find((f) => f.id === id)
      if (target?.url.startsWith('blob:')) URL.revokeObjectURL(target.url)
      return current.filter((f) => f.id !== id)
    })
  }

  async function handlePublish() {
    if (!files.length || publishing) return
    if (visibility === 'ppv' && !Number(price)) return
    if (mediaType === 'carousel' && files.length < 2) {
      setError('Carousels need at least two media items')
      return
    }

    setPublishing(true)
    setError('')
    try {
      await ensureCreatorProfile()

      const title =
        caption.trim().split('\n')[0]?.slice(0, 80) ||
        files[0]?.name.replace(/\.[^.]+$/, '') ||
        'Untitled post'

      await api('/posts', {
        method: 'POST',
        body: JSON.stringify({
          type: mapMediaTypeToApi(mediaType),
          title,
          caption: caption.trim() || null,
          visibility: mapVisibilityToApi(visibility),
          price: visibility === 'ppv' ? Number(price) : null,
          currency: 'INR',
          publish: !scheduleEnabled,
          scheduledAt: scheduleEnabled
            ? new Date(scheduleAt).toISOString()
            : null,
          media: files.map((f, index) => ({
            type: f.mediaType,
            storageKey: f.storageKey,
            ...(f.remoteUrl ? { url: f.remoteUrl } : {}),
            mimeType: f.mimeType,
            sortOrder: index,
            processingStatus: 'READY',
          })),
        }),
      })

      setPublished(true)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Could not publish post'
      )
    } finally {
      setPublishing(false)
    }
  }

  const canPublish =
    files.length > 0 &&
    files.every((f) => !!f.storageKey) &&
    !uploading &&
    (visibility !== 'ppv' || Number(price) > 0) &&
    (!scheduleEnabled || !!scheduleAt) &&
    (mediaType !== 'carousel' || files.length >= 2)

  return (
    <div>
      <StudioPageHeader
        title="Create Post"
        description="Upload media, craft the caption, set visibility, and preview before you publish."
        actions={
          <Link
            href="/influencer/create"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 text-[13px] font-semibold text-white"
          >
            <ArrowLeft className="size-4" />
            Create hub
          </Link>
        }
      />

      <AnimatePresence mode="wait">
        {published ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg"
          >
            <StudioGlassCard glow="creator" className="p-8 text-center">
              <motion.span
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 360, damping: 16 }}
                className="mx-auto flex size-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
              >
                <Check className="size-7" strokeWidth={2.5} />
              </motion.span>
              <h2 className="mt-5 text-2xl font-extrabold text-white">
                {scheduleEnabled ? 'Post scheduled' : 'Post published'}
              </h2>
              <p className="mt-2 text-[14px] text-white/50">
                Your {mediaType} is live in Content.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/influencer/content')}
                  className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-semibold text-black"
                >
                  View content
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearFiles()
                    setCaption('')
                    setPublished(false)
                    setVisibility('public')
                    setScheduleEnabled(false)
                    setError('')
                  }}
                  className="inline-flex h-11 items-center rounded-full border border-white/12 bg-white/[0.05] px-5 text-[13px] font-semibold text-white"
                >
                  Create another
                </button>
              </div>
            </StudioGlassCard>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 lg:grid-cols-5"
          >
            <div className="space-y-5 lg:col-span-3">
              <StudioGlassCard className="space-y-5 p-5 sm:p-6">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
                    Format
                  </p>
                  <div className="mt-3">
                    <MediaTypePicker
                      value={mediaType}
                      onChange={(type) => {
                        setMediaType(type)
                        setUploadError('')
                        setError('')
                      }}
                    />
                  </div>
                </div>

                <MediaDropzone
                  mediaType={mediaType}
                  files={files}
                  onFilesChange={setFiles}
                  uploading={uploading}
                  progress={progress}
                  onUploadStart={() => {
                    setUploading(true)
                    setProgress(0)
                    setUploadError('')
                  }}
                  onUploadProgress={setProgress}
                  onUploadDone={() => setUploading(false)}
                  onUploadError={setUploadError}
                />
                {uploadError ? (
                  <p className="text-[13px] text-rose-300">{uploadError}</p>
                ) : null}

                <MediaPreview
                  files={files}
                  onRemove={removeFile}
                  onClear={clearFiles}
                />
              </StudioGlassCard>

              <StudioGlassCard className="p-5 sm:p-6">
                <CaptionEditor value={caption} onChange={setCaption} />
              </StudioGlassCard>

              <StudioGlassCard className="space-y-5 p-5 sm:p-6">
                <VisibilityPricing
                  visibility={visibility}
                  onVisibilityChange={setVisibility}
                  price={price}
                  onPriceChange={setPrice}
                />
                <SchedulePost
                  enabled={scheduleEnabled}
                  onEnabledChange={setScheduleEnabled}
                  datetime={scheduleAt}
                  onDatetimeChange={setScheduleAt}
                />
              </StudioGlassCard>

              {error ? (
                <p className="text-[13px] text-rose-300">{error}</p>
              ) : null}

              <div className="flex flex-wrap gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 text-[13px] font-semibold text-white"
                >
                  <Eye className="size-4" />
                  Preview
                </button>
                <button
                  type="button"
                  disabled={!canPublish || publishing}
                  onClick={handlePublish}
                  className={cn(
                    'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-semibold text-white',
                    'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
                    'disabled:cursor-not-allowed disabled:opacity-45'
                  )}
                >
                  {publishing ? (
                    'Publishing…'
                  ) : scheduleEnabled ? (
                    <>
                      <Send className="size-4" />
                      Schedule
                    </>
                  ) : (
                    <>
                      <Rocket className="size-4" />
                      Publish
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="hidden space-y-4 lg:col-span-2 lg:block">
              <div className="sticky top-24 space-y-4">
                <PostPreviewPanel
                  mediaType={mediaType}
                  files={files}
                  caption={caption}
                  visibility={visibility}
                  price={Number(price) || 0}
                  scheduled={scheduleEnabled}
                  scheduleAt={scheduleAt}
                />

                {error ? (
                  <p className="text-[13px] text-rose-300">{error}</p>
                ) : null}

                <motion.button
                  type="button"
                  disabled={!canPublish || publishing}
                  onClick={handlePublish}
                  whileHover={
                    prefersReducedMotion || !canPublish
                      ? undefined
                      : { y: -2 }
                  }
                  className={cn(
                    'flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-white',
                    'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
                    'shadow-[0_14px_40px_rgba(217,70,239,0.35)]',
                    'disabled:cursor-not-allowed disabled:opacity-45'
                  )}
                >
                  {publishing ? (
                    'Publishing…'
                  ) : scheduleEnabled ? (
                    <>
                      <Send className="size-4" />
                      Schedule post
                    </>
                  ) : (
                    <>
                      <Rocket className="size-4" />
                      Publish now
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreview ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-4 backdrop-blur-md sm:items-center lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="max-h-[90dvh] w-full max-w-md overflow-y-auto"
            >
              <PostPreviewPanel
                mediaType={mediaType}
                files={files}
                caption={caption}
                visibility={visibility}
                price={Number(price) || 0}
                scheduled={scheduleEnabled}
                scheduleAt={scheduleAt}
              />
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-[13px] font-semibold text-white"
              >
                Close preview
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
