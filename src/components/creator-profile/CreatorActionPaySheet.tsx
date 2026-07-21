'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { MessageCircle, Phone, Video, Wallet, X } from 'lucide-react'

import { ApiError } from '@/lib/api'
import { cn, formatCurrency } from '@/lib/utils'

export type CreatorPayAction = 'message' | 'voice-call' | 'video-call'

export interface CreatorActionPaySheetProps {
  open: boolean
  action: CreatorPayAction | null
  creatorName: string
  price: number
  minimumBalance?: number
  walletBalance?: number | null
  onClose: () => void
  /** Called when user confirms (top-up then continue, or start call). */
  onConfirm: () => Promise<void>
  /** Optional: go to wallet page instead of in-sheet payment. */
  onGoToWallet?: () => void
}

export function CreatorActionPaySheet({
  open,
  action,
  creatorName,
  price,
  minimumBalance = price,
  walletBalance = null,
  onClose,
  onConfirm,
  onGoToWallet,
}: CreatorActionPaySheetProps) {
  const prefersReducedMotion = useReducedMotion()
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setPaying(false)
      setError(null)
    }
  }, [open, action])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !paying) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, paying])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  async function confirm() {
    if (paying || !action) return
    setPaying(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Something went wrong'
      )
      setPaying(false)
    }
  }

  const isMessage = action === 'message'
  const isVoiceCall = action === 'voice-call'
  const Icon = isMessage ? MessageCircle : isVoiceCall ? Phone : Video
  const title = isMessage
    ? 'Wallet required for chat'
    : isVoiceCall
      ? 'Wallet required for voice call'
      : 'Wallet required for video call'
  const subtitle = isMessage
    ? `Each message to ${creatorName} costs ${formatCurrency(price)} from your wallet.`
    : `Private ${isVoiceCall ? 'voice' : 'video'} calls with ${creatorName} bill ${formatCurrency(price)}/min from your wallet.`
  const priceLabel = isMessage
    ? `${formatCurrency(price)} / message`
    : `${formatCurrency(price)} / min`
  const shortfall =
    walletBalance != null && walletBalance < minimumBalance
      ? Math.ceil(minimumBalance - walletBalance)
      : null

  return (
    <AnimatePresence>
      {open && action ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            disabled={paying}
            onClick={() => {
              if (!paying) onClose()
            }}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="creator-pay-title"
            initial={
              prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }
            }
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative z-10 w-full max-w-md rounded-t-[28px] border border-white/12 bg-[#121214] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:rounded-[28px] sm:p-6'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                  <Icon className="size-5 text-white/90" aria-hidden />
                </div>
                <div>
                  <h2
                    id="creator-pay-title"
                    className="text-lg font-semibold tracking-tight text-white"
                  >
                    {title}
                  </h2>
                  <p className="mt-1 text-sm text-white/45">{subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={paying}
                onClick={onClose}
                className="rounded-full p-2 text-white/40 hover:bg-white/5 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-[12px] tracking-wide text-white/35 uppercase">
                  Rate
                </p>
                <p className="mt-1 text-xl font-bold text-white">{priceLabel}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-[12px] tracking-wide text-white/35 uppercase">
                  Your wallet
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  {walletBalance == null
                    ? '—'
                    : formatCurrency(walletBalance)}
                </p>
              </div>
            </div>

            {shortfall != null && shortfall > 0 ? (
              <p className="mt-3 text-sm text-amber-200/90">
                Add at least {formatCurrency(shortfall)} to continue.
              </p>
            ) : null}

            {error ? (
              <p className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              disabled={paying}
              onClick={() => void confirm()}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[14px] font-semibold text-black disabled:opacity-60"
            >
              <Wallet className="size-4" />
              {paying
                ? 'Processing…'
                : isMessage
                  ? 'Add funds & open chat'
                  : 'Add funds & start call'}
            </button>

            {onGoToWallet ? (
              <button
                type="button"
                disabled={paying}
                onClick={onGoToWallet}
                className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-full border border-white/15 text-[13px] font-medium text-white/80 hover:bg-white/5"
              >
                Open wallet page
              </button>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
