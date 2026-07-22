'use client'

import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ImagePlus, Trash2, UploadCloud } from 'lucide-react'

import {
  KYC_DOCUMENT_ACCEPT,
  KYC_DOCUMENT_MAX_BYTES,
  type KycDocumentKind,
} from '@/lib/kyc/types'
import { cn } from '@/lib/utils'

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface DocumentUploadFieldProps {
  label: string
  kind: KycDocumentKind
  file: File | null
  onFileChange: (kind: KycDocumentKind, file: File | null) => void
  onError?: (message: string) => void
  className?: string
}

export function DocumentUploadField({
  label,
  kind,
  file,
  onFileChange,
  onError,
  className,
}: DocumentUploadFieldProps) {
  const prefersReducedMotion = useReducedMotion()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const validateAndSet = useCallback(
    (next: File | null) => {
      if (!next) {
        onFileChange(kind, null)
        return
      }

      if (!next.type.startsWith('image/')) {
        onError?.('Please upload a JPEG, PNG, or WebP image.')
        return
      }

      if (next.size > KYC_DOCUMENT_MAX_BYTES) {
        onError?.(`${label} must be 5 MB or smaller.`)
        return
      }

      onFileChange(kind, next)
    },
    [kind, label, onError, onFileChange]
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setDragging(false)
      const dropped = event.dataTransfer.files?.[0]
      if (dropped) validateAndSet(dropped)
    },
    [validateAndSet]
  )

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-white/80">{label}</p>
        {file ? (
          <button
            type="button"
            onClick={() => validateAndSet(null)}
            className="inline-flex items-center gap-1.5 text-[12px] text-white/45 transition-colors hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Remove
          </button>
        ) : null}
      </div>

      <motion.div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        whileHover={prefersReducedMotion ? undefined : { y: -1 }}
        className={cn(
          'relative overflow-hidden rounded-[22px] border border-dashed transition-colors',
          dragging
            ? 'border-fuchsia-300/60 bg-fuchsia-500/10'
            : 'border-white/15 bg-white/[0.03] hover:border-fuchsia-300/35 hover:bg-white/[0.05]'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={KYC_DOCUMENT_ACCEPT}
          className="sr-only"
          onChange={(event) => {
            const picked = event.target.files?.[0] ?? null
            validateAndSet(picked)
            event.target.value = ''
          }}
        />

        {previewUrl ? (
          <div className="grid gap-3 p-3 sm:grid-cols-[120px_1fr] sm:items-center">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={`${label} preview`}
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 px-1">
              <p className="truncate text-[13px] font-medium text-white">{file?.name}</p>
              <p className="mt-1 text-[12px] text-white/45">
                {file ? formatBytes(file.size) : ''}
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-fuchsia-200 underline-offset-4 hover:underline"
              >
                <ImagePlus className="h-3.5 w-3.5" aria-hidden />
                Replace image
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center px-4 py-8 text-center"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-200">
              <UploadCloud className="h-5 w-5" aria-hidden />
            </span>
            <span className="mt-3 text-[14px] font-medium text-white/85">
              Drop image here or click to browse
            </span>
            <span className="mt-1 text-[12px] text-white/40">
              JPEG, PNG, or WebP up to 5 MB
            </span>
          </button>
        )}
      </motion.div>
    </div>
  )
}
