'use client'

import { motion, useReducedMotion } from 'framer-motion'

import {
  demoAnalytics,
  demoFeatureCards,
  demoNotifications,
  demoSubscription,
  productDemo,
} from '@/data/product-demo'
import { cn } from '@/lib/utils'

import { AnalyticsPopup } from './AnalyticsPopup'
import { DemoPhone } from './DemoPhone'
import { FloatingFeatureCard } from './FloatingFeatureCard'
import { FloatingNotification } from './FloatingNotification'
import { SubscriptionPopup } from './SubscriptionPopup'

interface ProductDemoProps {
  className?: string
}

export function ProductDemo({ className }: ProductDemoProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      id="product-demo"
      className={cn('relative overflow-hidden bg-black py-20 sm:py-28', className)}
      aria-labelledby="product-demo-heading"
    >
      {/* Subtle radial gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(255,255,255,0.05),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(255,255,255,0.04),transparent_40%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.03),transparent_50%)]"
      />

      <div className="relative mx-auto grid max-w-[1320px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8 lg:px-16">
        {/* Copy */}
        <motion.div
          className="max-w-xl lg:pr-6"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12%' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className={cn(
              'inline-flex items-center rounded-full border border-white/12',
              'bg-white/[0.04] px-3.5 py-1 text-[11px] font-medium tracking-[0.16em]',
              'text-white/55 uppercase backdrop-blur-md'
            )}
          >
            {productDemo.badge}
          </span>

          <h2
            id="product-demo-heading"
            className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
          >
            {productDemo.title}
          </h2>

          <p className="mt-4 text-base leading-relaxed text-white/55 sm:text-lg">
            {productDemo.description}
          </p>

          <ul className="mt-8 space-y-3 text-sm text-white/60 sm:text-[15px]">
            {[
              'Autoplay video that feels native on mobile',
              'Subscriptions and tips without leaving the page',
              'Live social proof that builds trust instantly',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-white/50" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Phone + floating UI */}
        <motion.div
          className="relative mx-auto min-h-[560px] w-full max-w-[520px] sm:min-h-[620px] lg:mx-0 lg:max-w-none"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-8%' }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <DemoPhone
              videoSrc={productDemo.videoSrc}
              videoPoster={productDemo.videoPoster}
            />
          </div>

          {demoFeatureCards.map((card, index) => (
            <FloatingFeatureCard
              key={card.id}
              title={card.title}
              description={card.description}
              icon={card.icon}
              className={card.position}
              delay={0.12 + index * 0.08}
            />
          ))}

          {demoNotifications.map((note, index) => (
            <FloatingNotification
              key={note.id}
              title={note.title}
              body={note.body}
              icon={note.icon}
              className={note.position}
              delay={0.2 + index * 0.08}
            />
          ))}

          <SubscriptionPopup
            title={demoSubscription.title}
            price={demoSubscription.price}
            period={demoSubscription.period}
            cta={demoSubscription.cta}
            icon={demoSubscription.icon}
            className={demoSubscription.position}
            delay={0.28}
          />

          <AnalyticsPopup
            title={demoAnalytics.title}
            metric={demoAnalytics.metric}
            label={demoAnalytics.label}
            change={demoAnalytics.change}
            icon={demoAnalytics.icon}
            className={demoAnalytics.position}
            delay={0.34}
          />
        </motion.div>
      </div>
    </section>
  )
}
