'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Clock3, ShieldCheck } from 'lucide-react'

import { cn } from '@/lib/utils'

interface KycSubmissionPendingProps {
  className?: string
}

export function KycSubmissionPending({ className }: KycSubmissionPendingProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={cn('text-center', className)}>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-fuchsia-200 ring-1 ring-fuchsia-300/30"
      >
        <ShieldCheck className="h-8 w-8" aria-hidden />
      </motion.div>

      <h2 className="mt-5 text-[1.55rem] font-extrabold tracking-[-0.04em] text-white sm:text-[1.7rem]">
        Verification submitted
      </h2>
      <p className="mx-auto mt-3 max-w-[38ch] text-[14px] leading-relaxed text-white/55">
        Your account details, documents, and selfie have been collected. KYC review is pending
        while backend verification is being connected.
      </p>

      <div className="mx-auto mt-6 max-w-md rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-left">
        <div className="flex items-start gap-3">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-200" aria-hidden />
          <div>
            <p className="text-[13px] font-medium text-white/85">What happens next</p>
            <p className="mt-1 text-[12px] leading-relaxed text-white/45">
              Once backend integration is live, your documents and selfie will be verified and
              you&apos;ll be notified when your creator account is approved.
            </p>
          </div>
        </div>
      </div>

      {process.env.NODE_ENV !== 'production' ? (
        <p className="mt-4 text-[11px] text-white/30">
          Dev note: draft summary logged to the browser console.
        </p>
      ) : null}

      <motion.div
        className="mt-7"
        whileHover={prefersReducedMotion ? undefined : { y: -2 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
      >
        <Link
          href="/"
          className={cn(
            'inline-flex h-12 min-w-[220px] items-center justify-center rounded-full px-6',
            'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
            'text-[15px] font-semibold text-white',
            'shadow-[0_12px_40px_rgba(217,70,239,0.4)]'
          )}
        >
          Go to home
        </Link>
      </motion.div>
    </div>
  )
}
