'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { MapPin, Sparkles } from 'lucide-react'

import type { PublicCreator } from '@/data/public-creator'
import { SocialLinks } from '@/components/creator-profile/SocialLinks'
import { cn, formatCurrency, formatFollowers } from '@/lib/utils'

export interface AboutSectionProps {
  creator: PublicCreator
  className?: string
}

export function AboutSection({ creator, className }: AboutSectionProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-5', className)}
    >
      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
          About
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-white/65">{creator.longBio}</p>

        <div className="mt-5 flex flex-wrap gap-4 text-[13px] text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden />
            {creator.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="size-3.5" aria-hidden />
            {creator.category}
          </span>
          <span>{creator.joinedLabel}</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            label: 'Subscribers',
            value: formatFollowers(creator.stats.subscribers),
          },
          {
            label: 'Membership',
            value: `${formatCurrency(creator.monthlyPrice)}/mo`,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4"
          >
            <p className="text-[18px] font-bold text-white">{item.value}</p>
            <p className="mt-1 text-[12px] text-white/40">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
          Connect
        </p>
        <SocialLinks links={creator.socialLinks} handle={creator.handle} />
      </div>
    </motion.div>
  )
}
