'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Camera, RotateCcw } from 'lucide-react'

import { useCamera } from '@/hooks/useCamera'
import { captureVideoFrame } from '@/lib/kyc/captureFrame'
import { cn } from '@/lib/utils'

interface KycFaceCaptureStepProps {
  selfie: Blob | null
  error?: string
  submitting?: boolean
  onSelfieChange: (selfie: Blob | null) => void
  onError: (message: string) => void
  onBack: () => void
  onSubmit: () => void
}

export function KycFaceCaptureStep({
  selfie,
  error,
  submitting = false,
  onSelfieChange,
  onError,
  onBack,
  onSubmit,
}: KycFaceCaptureStepProps) {
  const prefersReducedMotion = useReducedMotion()
  const { videoRef, status, error: cameraError, startCamera, stopCamera, isActive } =
    useCamera()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    if (!selfie) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(selfie)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [selfie])

  const displayError = error || cameraError

  const statusLabel = useMemo(() => {
    if (selfie) return 'Review your selfie'
    if (status === 'starting') return 'Starting camera…'
    if (isActive) return 'Align your face in the frame'
    return 'Live face verification'
  }, [isActive, selfie, status])

  async function handleStartCamera() {
    onError('')
    onSelfieChange(null)
    await startCamera()
  }

  async function handleCapture() {
    if (!videoRef.current) return

    onError('')
    setCapturing(true)
    try {
      const blob = await captureVideoFrame(videoRef.current)
      onSelfieChange(blob)
      stopCamera()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not capture selfie.')
    } finally {
      setCapturing(false)
    }
  }

  function handleRetake() {
    onError('')
    onSelfieChange(null)
    void handleStartCamera()
  }

  return (
    <div>
      <div className="text-center">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-transparent uppercase bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text">
          Live verification
        </p>
        <h2 className="mt-2 text-[1.45rem] font-extrabold tracking-[-0.04em] text-white sm:text-[1.6rem]">
          {statusLabel}
        </h2>
        <p className="mx-auto mt-2 max-w-[36ch] text-[14px] leading-relaxed text-white/55">
          Take a clear selfie in good lighting. This will be matched against your Aadhaar photo
          during verification.
        </p>
      </div>

      <div className="mt-7">
        {displayError ? (
          <p className="mb-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-200">
            {displayError}
          </p>
        ) : null}

        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/40">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Captured selfie preview"
              className="aspect-[4/5] w-full object-cover"
            />
          ) : (
            <div className="relative aspect-[4/5] w-full bg-black/60">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  'h-full w-full object-cover',
                  !isActive && 'opacity-0'
                )}
              />
              {!isActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-fuchsia-500/15 text-fuchsia-200">
                    <Camera className="h-6 w-6" aria-hidden />
                  </span>
                  <p className="mt-4 text-[14px] text-white/70">
                    Camera preview will appear here after you start capture.
                  </p>
                </div>
              ) : null}

              {isActive ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-8 rounded-[999px] border-2 border-fuchsia-300/45 shadow-[inset_0_0_0_9999px_rgba(0,0,0,0.18)]"
                />
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {!selfie ? (
            <>
              {!isActive ? (
                <motion.button
                  type="button"
                  onClick={() => void handleStartCamera()}
                  disabled={status === 'starting'}
                  whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                  className={cn(
                    'flex h-12 flex-1 items-center justify-center gap-2 rounded-full',
                    'border border-fuchsia-300/30 bg-fuchsia-500/10 text-[15px] font-semibold text-fuchsia-100',
                    'transition-colors hover:bg-fuchsia-500/15',
                    'disabled:pointer-events-none disabled:opacity-55'
                  )}
                >
                  <Camera className="h-4 w-4" aria-hidden />
                  {status === 'starting' ? 'Starting camera…' : 'Start camera'}
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={() => void handleCapture()}
                  disabled={capturing}
                  whileHover={prefersReducedMotion || capturing ? undefined : { y: -2 }}
                  whileTap={prefersReducedMotion || capturing ? undefined : { scale: 0.985 }}
                  className={cn(
                    'flex h-12 flex-1 items-center justify-center rounded-full',
                    'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
                    'text-[15px] font-semibold text-white',
                    'shadow-[0_12px_40px_rgba(217,70,239,0.4)]',
                    'disabled:pointer-events-none disabled:opacity-55'
                  )}
                >
                  {capturing ? 'Capturing…' : 'Capture selfie'}
                </motion.button>
              )}
            </>
          ) : (
            <motion.button
              type="button"
              onClick={handleRetake}
              whileHover={prefersReducedMotion ? undefined : { y: -1 }}
              className={cn(
                'flex h-12 flex-1 items-center justify-center gap-2 rounded-full',
                'border border-white/15 bg-white/[0.04] text-[15px] font-semibold text-white/80',
                'transition-colors hover:border-white/25 hover:bg-white/[0.07]'
              )}
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Retake
            </motion.button>
          )}
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
        <motion.button
          type="button"
          onClick={onBack}
          disabled={submitting}
          whileHover={prefersReducedMotion || submitting ? undefined : { y: -1 }}
          className={cn(
            'flex h-12 flex-1 items-center justify-center rounded-full',
            'border border-white/15 bg-white/[0.04] text-[15px] font-semibold text-white/80',
            'transition-colors hover:border-white/25 hover:bg-white/[0.07]',
            'disabled:pointer-events-none disabled:opacity-55'
          )}
        >
          Back
        </motion.button>

        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={!selfie || submitting}
          whileHover={prefersReducedMotion || !selfie || submitting ? undefined : { y: -2 }}
          whileTap={prefersReducedMotion || !selfie || submitting ? undefined : { scale: 0.985 }}
          className={cn(
            'flex h-12 flex-1 items-center justify-center rounded-full',
            'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
            'text-[15px] font-semibold text-white',
            'shadow-[0_12px_40px_rgba(217,70,239,0.4)]',
            'transition-shadow duration-200 hover:shadow-[0_16px_48px_rgba(236,72,153,0.45)]',
            'disabled:pointer-events-none disabled:opacity-55'
          )}
        >
          {submitting ? 'Submitting…' : 'Submit verification'}
        </motion.button>
      </div>
    </div>
  )
}
