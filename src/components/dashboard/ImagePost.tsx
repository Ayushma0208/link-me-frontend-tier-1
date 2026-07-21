'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { SafeImage } from '@/components/media/SafeImage'
import { cn } from '@/lib/utils'

export interface ImagePostProps {
  urls: string[]
  alt: string
  className?: string
}

export function ImagePost({ urls, alt, className }: ImagePostProps) {
  const prefersReducedMotion = useReducedMotion()
  const slides = urls.length > 0 ? urls : []
  const [index, setIndex] = useState(0)

  if (slides.length === 0) return null

  const go = (dir: -1 | 1) => {
    setIndex((current) => {
      const next = current + dir
      if (next < 0) return slides.length - 1
      if (next >= slides.length) return 0
      return next
    })
  }

  return (
    <div className={cn('relative aspect-[4/5] bg-black sm:aspect-[5/6]', className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slides[index]}
          initial={prefersReducedMotion ? false : { opacity: 0.4 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0.4 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0"
        >
          <SafeImage
            src={slides[index]!}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 560px"
            priority={index === 0}
          />
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => go(-1)}
            className="absolute top-1/2 left-2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md hover:bg-black/60"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => go(1)}
            className="absolute top-1/2 right-2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md hover:bg-black/60"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {slides.map((url, i) => (
              <button
                key={url + i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'size-1.5 rounded-full transition-colors',
                  i === index ? 'bg-white' : 'bg-white/35'
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
