'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Clock3, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react'

import type { KycStatusResponse } from '@/lib/kyc/api'
import { cn } from '@/lib/utils'

interface KycSubmissionPendingProps {
  status: KycStatusResponse | null
  className?: string
}

export function KycSubmissionPending({ status, className }: KycSubmissionPendingProps) {
  const prefersReducedMotion = useReducedMotion()
  const current = status?.status ?? 'PROCESSING'

  const isProcessing = current === 'PROCESSING' || current === 'NOT_SUBMITTED'
  const isApproved = current === 'APPROVED'
  const isRejected = current === 'REJECTED'
  const isReview = current === 'REVIEW_REQUIRED'

  const title = isApproved
    ? 'Verification approved'
    : isRejected
      ? 'Verification rejected'
      : isReview
        ? 'Under manual review'
        : 'Verification submitted'

  const description = isApproved
    ? 'Your creator account is verified. You can start using the creator dashboard.'
    : isRejected
      ? status?.rejectionReason ??
        'We could not verify your identity. Please check your documents and try again.'
      : isReview
        ? 'Our team will verify your documents manually. We’ll notify you once your creator account is approved.'
        : 'Your documents and selfie are being verified. This usually takes a minute.'

  const Icon = isApproved
    ? CheckCircle2
    : isRejected
      ? ShieldAlert
      : isProcessing
        ? Loader2
        : ShieldCheck

  return (
    <div className={cn('text-center', className)}>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={cn(
          'mx-auto flex h-16 w-16 items-center justify-center rounded-full ring-1',
          isApproved && 'bg-emerald-500/15 text-emerald-200 ring-emerald-300/30',
          isRejected && 'bg-red-500/15 text-red-200 ring-red-300/30',
          isReview && 'bg-amber-500/15 text-amber-200 ring-amber-300/30',
          isProcessing &&
            'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-fuchsia-200 ring-fuchsia-300/30'
        )}
      >
        <Icon
          className={cn('h-8 w-8', isProcessing && 'animate-spin')}
          aria-hidden
        />
      </motion.div>

      <h2 className="mt-5 text-[1.55rem] font-extrabold tracking-[-0.04em] text-white sm:text-[1.7rem]">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-[38ch] text-[14px] leading-relaxed text-white/55">
        {description}
      </p>

      {!isApproved && !isRejected ? (
        <div className="mx-auto mt-6 max-w-md rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-left">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-200" aria-hidden />
            <div>
              <p className="text-[13px] font-medium text-white/85">What happens next</p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/45">
                {isReview
                  ? 'You do not need to resubmit. Stay tuned — approval usually completes after a short manual check.'
                  : 'We are matching your selfie against your Aadhaar photo. Stay on this page for live status updates.'}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <motion.div
        className="mt-7"
        whileHover={prefersReducedMotion ? undefined : { y: -2 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
      >
        <Link
          href={isApproved ? '/influencer' : '/'}
          className={cn(
            'inline-flex h-12 min-w-[220px] items-center justify-center rounded-full px-6',
            'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
            'text-[15px] font-semibold text-white',
            'shadow-[0_12px_40px_rgba(217,70,239,0.4)]'
          )}
        >
          {isApproved ? 'Go to creator dashboard' : 'Go to home'}
        </Link>
      </motion.div>
    </div>
  )
}
