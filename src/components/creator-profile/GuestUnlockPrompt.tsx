'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Lock, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface GuestUnlockPromptProps {
  creatorHandle: string
  creatorName: string
  className?: string
}

export function GuestUnlockPrompt({
  creatorHandle,
  creatorName,
  className,
}: GuestUnlockPromptProps) {
  const prefersReducedMotion = useReducedMotion()
  const signupHref = `/signup?role=user&from=${encodeURIComponent(`/@${creatorHandle}`)}`

  return (
    <motion.aside
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'relative overflow-hidden rounded-[28px] border border-white/12 p-5 sm:p-6',
        'bg-gradient-to-br from-[#ff4d9a]/15 via-white/[0.04] to-[#ffb03a]/10',
        'backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.35)]',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 right-0 h-40 w-40 rounded-full bg-[#ff4d9a]/20 blur-3xl"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white">
            <Lock className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-white">
              Unlock the rest of {creatorName.split(' ')[0]}’s page
            </p>
            <p className="mt-1 max-w-md text-[13px] leading-relaxed text-white/55">
              The first two posts are free. Sign up to unlock exclusives, premium
              stories, and member-only drops.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={signupHref}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-black hover:bg-neutral-100"
          >
            <Sparkles className="size-4" aria-hidden />
            Sign up free
          </Link>
          <Link
            href={`/login?from=${encodeURIComponent(`/@${creatorHandle}`)}`}
            className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/[0.05] px-5 text-[13px] font-semibold text-white hover:bg-white/[0.09]"
          >
            Log in
          </Link>
        </div>
      </div>
    </motion.aside>
  )
}
