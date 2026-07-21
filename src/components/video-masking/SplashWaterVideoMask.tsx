import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { DEFAULT_MASK_VIDEO } from './constants'

interface VideoMaskProps {
  src?: string
  className?: string
}

export function SplashWaterVideoMask({
  src = DEFAULT_MASK_VIDEO,
  className,
}: VideoMaskProps) {
  const maskRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mask = maskRef.current
    if (!mask) return

    let frame: number
    let progress = 0

    const animate = () => {
      progress += 0.003
      const size = 80 + Math.sin(progress) * 20
      mask.style.webkitMaskSize = `${size}%`
      mask.style.maskSize = `${size}%`
      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      ref={maskRef}
      className={cn('relative aspect-square w-full max-w-md overflow-hidden', className)}
      style={{
        WebkitMaskImage: 'url(/splash-water.svg)',
        maskImage: 'url(/splash-water.svg)',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: '80%',
        maskSize: '80%',
      }}
    >
      <video autoPlay muted loop playsInline className="h-full w-full object-cover">
        <source src={src} type="video/mp4" />
      </video>
    </div>
  )
}
