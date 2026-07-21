import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { DEFAULT_MASK_VIDEO } from './constants'

interface VideoMaskProps {
  src?: string
  className?: string
}

export function HexagonTwoVideoMask({
  src = DEFAULT_MASK_VIDEO,
  className,
}: VideoMaskProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let frame: number
    let angle = 0

    const animate = () => {
      angle += 0.5
      el.style.transform = `rotate(${angle}deg)`
      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className={cn('relative flex items-center justify-center p-8', className)}>
      <div
        ref={containerRef}
        className="relative aspect-square w-full max-w-sm"
        style={{
          WebkitMaskImage: 'url(/hexagon.svg)',
          maskImage: 'url(/hexagon.svg)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: '85%',
          maskSize: '85%',
        }}
      >
        <video autoPlay muted loop playsInline className="h-full w-full object-cover">
          <source src={src} type="video/mp4" />
        </video>
      </div>
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          WebkitMaskImage: 'url(/hexagon.svg)',
          maskImage: 'url(/hexagon.svg)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: '60%',
          maskSize: '60%',
          opacity: 0.4,
        }}
      >
        <video autoPlay muted loop playsInline className="h-full w-full object-cover">
          <source src={src} type="video/mp4" />
        </video>
      </div>
    </div>
  )
}
