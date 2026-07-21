import { cn } from '@/lib/utils'
import { DEFAULT_MASK_VIDEO } from './constants'

interface VideoMaskProps {
  src?: string
  className?: string
}

export function HexagonVideoMask({
  src = DEFAULT_MASK_VIDEO,
  className,
}: VideoMaskProps) {
  return (
    <div
      className={cn('relative mx-auto aspect-[200/230] w-full max-w-xs', className)}
      style={{
        WebkitMaskImage: 'url(/hexagon.svg)',
        maskImage: 'url(/hexagon.svg)',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    >
      <video autoPlay muted loop playsInline className="h-full w-full object-cover">
        <source src={src} type="video/mp4" />
      </video>
    </div>
  )
}
