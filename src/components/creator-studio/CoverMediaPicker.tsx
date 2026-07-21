'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { Film, ImageIcon, Loader2, Upload } from 'lucide-react'

import {
  COVER_IMAGE_PRESETS,
  COVER_VIDEO_PRESETS,
  type CoverMediaType,
  type ProfileAppearance,
} from '@/lib/profile-appearance'
import { cn } from '@/lib/utils'

interface CoverMediaPickerProps {
  appearance: ProfileAppearance
  onChange: (patch: Partial<ProfileAppearance>) => void
  onUploadImage?: (file: File) => Promise<void>
  uploading?: boolean
  className?: string
}

export function CoverMediaPicker({
  appearance,
  onChange,
  onUploadImage,
  uploading = false,
  className,
}: CoverMediaPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState('')

  function setType(coverType: CoverMediaType) {
    onChange({ coverType })
  }

  const presetActive =
    appearance.coverType === 'image' &&
    COVER_IMAGE_PRESETS.includes(appearance.coverImage)

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h2 className="text-[15px] font-bold text-white">Cover media</h2>
        <p className="mt-1 text-[13px] text-white/45">
          Full-bleed image or looping video behind your profile.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { id: 'image' as const, label: 'Image', icon: ImageIcon },
            { id: 'video' as const, label: 'Video', icon: Film },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setType(option.id)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-[13px] font-semibold transition-colors',
              appearance.coverType === option.id
                ? 'border-fuchsia-400/40 bg-fuchsia-500/15 text-white'
                : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white'
            )}
          >
            <option.icon className="size-4" />
            {option.label}
          </button>
        ))}
      </div>

      {appearance.coverType === 'image' ? (
        <>
          {onUploadImage ? (
            <div className="space-y-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] text-[13px] font-semibold text-white/80 transition hover:border-fuchsia-400/40 hover:bg-white/[0.05] disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    Upload cover image
                  </>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file || !onUploadImage) return
                  setUploadError('')
                  try {
                    await onUploadImage(file)
                  } catch (err) {
                    setUploadError(
                      err instanceof Error ? err.message : 'Upload failed'
                    )
                  }
                }}
              />
              {uploadError ? (
                <p className="text-[12px] text-rose-300">{uploadError}</p>
              ) : null}
              {!presetActive && appearance.coverImage ? (
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border-2 border-fuchsia-400">
                  <Image
                    src={appearance.coverImage}
                    alt=""
                    fill
                    sizes="400px"
                    className="object-cover"
                    unoptimized={appearance.coverImage.includes('cloudinary')}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {COVER_IMAGE_PRESETS.map((src) => {
              const active = appearance.coverImage === src
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => onChange({ coverImage: src })}
                  className={cn(
                    'relative aspect-[16/10] overflow-hidden rounded-2xl border-2 transition-colors',
                    active
                      ? 'border-fuchsia-400 shadow-[0_0_24px_rgba(217,70,239,0.35)]'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  )}
                >
                  <Image src={src} alt="" fill sizes="160px" className="object-cover" />
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {COVER_VIDEO_PRESETS.map((src) => {
            const active = appearance.coverVideo === src
            return (
              <button
                key={src}
                type="button"
                onClick={() => onChange({ coverVideo: src })}
                className={cn(
                  'relative aspect-[16/10] overflow-hidden rounded-2xl border-2 bg-black transition-colors',
                  active
                    ? 'border-fuchsia-400 shadow-[0_0_24px_rgba(217,70,239,0.35)]'
                    : 'border-transparent opacity-75 hover:opacity-100'
                )}
              >
                <video
                  src={src}
                  muted
                  playsInline
                  className="absolute inset-0 size-full object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
