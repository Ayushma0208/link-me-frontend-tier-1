'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { BackgroundVideo } from '@/components/hero/BackgroundVideo'
import { FloatingCard } from '@/components/hero/FloatingCard'
import { HeroCTA } from '@/components/hero/HeroCTA'
import { PhonePreview } from '@/components/hero/PhonePreview'
import type { HeroBackground, HeroContentData } from '@/components/hero/types'
import {
  defaultHeroBackground,
  defaultHeroContent,
  defaultHeroVideos,
  heroScenes,
  HERO_SCENE_MS,
} from '@/data/hero'
import { cn } from '@/lib/utils'

interface HeroProps {
  content?: HeroContentData
  background?: HeroBackground
  videos?: string[]
  overlayOpacity?: number
  className?: string
}

export function Hero({
  content = defaultHeroContent,
  background = defaultHeroBackground,
  videos = background.videos ?? (background.src ? [background.src] : defaultHeroVideos),
  overlayOpacity = background.overlayOpacity ?? 0.5,
  className,
}: HeroProps) {
  const prefersReducedMotion = useReducedMotion()
  const [sceneIndex, setSceneIndex] = useState(0)

  useEffect(() => {
    if (heroScenes.length <= 1) return

    const timer = window.setInterval(() => {
      setSceneIndex((current) => (current + 1) % heroScenes.length)
    }, HERO_SCENE_MS)

    return () => window.clearInterval(timer)
  }, [])

  const scene = heroScenes[sceneIndex] ?? heroScenes[0]!
  const leftCard = scene.floatingCards.find((card) => card.position === 'left')
  const rightCard = scene.floatingCards.find((card) => card.position === 'right')
  const sceneVideos = heroScenes.map((item) => item.video)
  const playlist = videos.length === heroScenes.length ? videos : sceneVideos

  return (
    <section
      className={cn(
        'relative flex h-screen items-center overflow-hidden bg-black',
        className
      )}
      aria-labelledby="hero-heading"
    >
      <BackgroundVideo
        videos={playlist}
        activeIndex={sceneIndex}
        overlayOpacity={overlayOpacity}
      />

      <div className="relative z-20 mx-auto grid h-full w-full max-w-[1320px] -translate-y-10 items-center gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-8 lg:px-16 xl:gap-12">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, x: -42 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full max-w-[640px] flex-col items-start lg:max-w-none"
        >
          <h1
            id="hero-heading"
            className="max-w-[600px] text-[2.65rem] leading-[0.95] font-extrabold tracking-[-0.04em] text-white sm:text-[3.15rem] lg:text-[72px]"
          >
            <span className="block italic">{content.italicLine}</span>
            <span className="block not-italic">{content.boldLine}</span>
          </h1>

          <p className="mt-7 max-w-[560px] text-[17px] leading-[1.65] text-white/90 sm:text-[18px] sm:leading-[1.7]">
            {content.description}
          </p>

          <div className="mt-8 w-full max-w-[480px]">
            <HeroCTA
              prefix={content.ctaPrefix}
              placeholder={content.ctaPlaceholder}
              buttonLabel={content.ctaButtonLabel}
            />
          </div>
        </motion.div>

        <div className="relative flex h-full min-h-0 w-full translate-x-0 items-center justify-center sm:translate-x-12 lg:translate-x-14">
          {leftCard ? <FloatingCard card={leftCard} /> : null}
          <PhonePreview creator={scene.creator} />
          {rightCard ? <FloatingCard card={rightCard} /> : null}
        </div>
      </div>
    </section>
  )
}
