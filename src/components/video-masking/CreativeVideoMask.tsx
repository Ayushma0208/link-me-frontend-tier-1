import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DEFAULT_MASK_VIDEO } from './constants'

interface VideoMaskProps {
  src?: string
  className?: string
  maskSrc?: string
}

export function CreativeVideoMask({
  src = DEFAULT_MASK_VIDEO,
  className,
  maskSrc = '/creative-mask.svg',
}: VideoMaskProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const maskSize = useTransform(scrollYProgress, [0, 0.5, 1], ['60%', '120%', '200%'])

  return (
    <div ref={containerRef} className={cn('relative h-[500px] overflow-hidden', className)}>
      <motion.div
        className="sticky top-0 flex h-[500px] items-center justify-center"
        style={{
          WebkitMaskImage: `url(${maskSrc})`,
          maskImage: `url(${maskSrc})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: maskSize,
          maskSize,
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        >
          <source src={src} type="video/mp4" />
        </video>
      </motion.div>
    </div>
  )
}
