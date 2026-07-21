import { cn } from '@/lib/utils'
import { DEFAULT_MASK_VIDEO } from './constants'

interface VideoMaskProps {
  src?: string
  className?: string
  text?: string
}

export function TextOverlayVideoMask({
  src = DEFAULT_MASK_VIDEO,
  className,
  text = 'LINK ME',
}: VideoMaskProps) {
  return (
    <div className={cn('relative flex h-[400px] w-full items-center justify-center bg-black', className)}>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          WebkitMaskImage: `url("data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 120'><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Arial Black, sans-serif' font-size='72' font-weight='900' fill='white'>${text}</text></svg>`
          )}")`,
          maskImage: `url("data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 120'><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Arial Black, sans-serif' font-size='72' font-weight='900' fill='white'>${text}</text></svg>`
          )}")`,
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
      <p className="pointer-events-none relative z-10 text-6xl font-black tracking-wider text-white/10">
        {text}
      </p>
    </div>
  )
}
