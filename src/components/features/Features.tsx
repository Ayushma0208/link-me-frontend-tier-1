'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { features } from '@/data/landing'
import { cn } from '@/lib/utils'

import { FeatureCard } from './FeatureCard'

interface FeaturesProps {
  className?: string
}

export function Features({ className }: FeaturesProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      id="features"
      className={cn('relative overflow-hidden bg-black py-20 sm:py-28', className)}
      aria-labelledby="features-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 size-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.025] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-16">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12%' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className={cn(
              'inline-flex items-center rounded-full border border-white/12',
              'bg-white/[0.04] px-3.5 py-1 text-[11px] font-medium tracking-[0.16em]',
              'text-white/55 uppercase backdrop-blur-md'
            )}
          >
            Features
          </span>

          <h2
            id="features-heading"
            className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.75rem]"
          >
            Everything you need to grow
          </h2>

          <p className="mt-4 text-base leading-relaxed text-white/55 sm:text-lg">
            A modern creator toolkit — content, commerce, and analytics in one premium page.
          </p>
        </motion.div>

        <motion.div
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-8%' }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.08,
                delayChildren: prefersReducedMotion ? 0 : 0.06,
              },
            },
          }}
        >
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              accent={feature.accent}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
