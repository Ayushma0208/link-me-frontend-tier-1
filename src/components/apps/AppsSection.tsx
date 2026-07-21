'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { appRows } from '@/data/apps'
import { cn } from '@/lib/utils'

import { AppsMarquee } from './AppsMarquee'

interface AppsSectionProps {
  className?: string
}

const ROW_CONFIG = [
  { direction: 'left' as const, duration: 38, offset: 'pl-0' },
  { direction: 'right' as const, duration: 44, offset: 'pl-10 sm:pl-16 lg:pl-24' },
  { direction: 'left' as const, duration: 32, offset: 'pl-4 sm:pl-8 lg:pl-12' },
  { direction: 'right' as const, duration: 50, offset: 'pl-14 sm:pl-20 lg:pl-28' },
]

export function AppsSection({ className }: AppsSectionProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      id="apps"
      className={cn('relative overflow-hidden bg-black py-20 sm:py-24 lg:py-28', className)}
      aria-labelledby="apps-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-[12%] left-1/2 size-[min(900px,110vw)] -translate-x-1/2 rounded-full bg-white/[0.03] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className={cn(
              'inline-flex items-center rounded-full border border-white/[0.1]',
              'bg-white/[0.04] px-3.5 py-1 text-[11px] font-medium tracking-[0.18em]',
              'text-white/50 uppercase'
            )}
          >
            Integrations
          </span>

          <h2
            id="apps-heading"
            className="mt-5 text-[1.875rem] leading-[1.12] font-extrabold tracking-[-0.04em] text-white sm:text-4xl sm:leading-[1.1] lg:text-[2.75rem] lg:leading-[1.08]"
          >
            Add all your favorite apps to your profile
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/50 sm:mt-5 sm:text-lg">
            Easily integrate the platforms you already use like Instagram, TikTok, and YouTube.
            Linkme brings all your favorite apps together in one seamless profile.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="relative mt-12 sm:mt-14 lg:mt-16"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="-space-y-2 sm:-space-y-3 lg:-space-y-4">
          {appRows.map((row, index) => {
            const config = ROW_CONFIG[index] ?? ROW_CONFIG[0]
            return (
              <AppsMarquee
                key={`apps-row-${index}`}
                apps={row}
                direction={config.direction}
                duration={config.duration}
                offsetClassName={config.offset}
              />
            )
          })}
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-black via-black/80 to-transparent sm:w-20 lg:w-28"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-black via-black/80 to-transparent sm:w-20 lg:w-28"
        />
      </motion.div>
    </section>
  )
}
