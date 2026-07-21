'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

import { BackgroundVideo } from '@/components/hero/BackgroundVideo'
import { heroScenes, HERO_SCENE_MS } from '@/data/hero'
import { cn } from '@/lib/utils'

interface SignupBackdropProps {
  className?: string
}

/**
 * Reuses the Hero video playlist + floating creator cards behind the signup UI.
 */
export function SignupBackdrop({ className }: SignupBackdropProps) {
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
  const videos = heroScenes.map((item) => item.video)

  return (
    <div className={cn('pointer-events-none absolute inset-0 z-0 overflow-hidden', className)}>
      <BackgroundVideo videos={videos} activeIndex={sceneIndex} overlayOpacity={0.65} />

      {/* Soft vignette so the glass card stays readable */}
      <div
        aria-hidden
        className="absolute inset-0 z-[11] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.45)_70%,rgba(0,0,0,0.7)_100%)]"
      />

      <div className="absolute inset-0 z-[12]">
        {scene.floatingCards.map((card, index) => {
          const isLeft = card.position === 'left'
          return (
            <motion.div
              key={`${scene.id}-${card.id}`}
              className={cn(
                'absolute hidden overflow-hidden rounded-[24px] border border-white/10 opacity-45 shadow-[0_30px_60px_rgba(0,0,0,0.45)] sm:block',
                isLeft
                  ? 'top-[18%] left-[6%] h-[220px] w-[150px] lg:left-[10%]'
                  : 'right-[6%] bottom-[16%] h-[240px] w-[160px] lg:right-[10%]'
              )}
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 0.45 }
                  : {
                      opacity: 0.45,
                      y: isLeft ? [0, -14, 0] : [0, -10, 0],
                    }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0.4 }
                  : {
                      opacity: { duration: 0.5 },
                      y: {
                        duration: isLeft ? 6.2 : 5.4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.2,
                      },
                    }
              }
            >
              <Image
                src={card.imageSrc}
                alt=""
                fill
                sizes="160px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/25" />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
