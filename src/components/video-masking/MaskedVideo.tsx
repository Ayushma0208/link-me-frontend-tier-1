import type { VideoMaskStyle } from '@/types'
import { CreativeVideoMask } from './CreativeVideoMask'
import { SplashWaterVideoMask } from './SplashWaterVideoMask'
import { TextOverlayVideoMask } from './TextOverlayVideoMask'
import { HexagonVideoMask } from './HexagonVideoMask'
import { HexagonTwoVideoMask } from './HexagonTwoVideoMask'

interface MaskedVideoProps {
  style: VideoMaskStyle
  src?: string
  className?: string
  text?: string
}

export function MaskedVideo({ style, src, className, text }: MaskedVideoProps) {
  switch (style) {
    case 'creative':
      return <CreativeVideoMask src={src} className={className} />
    case 'splash-water':
      return <SplashWaterVideoMask src={src} className={className} />
    case 'text-overlay':
      return <TextOverlayVideoMask src={src} className={className} text={text} />
    case 'hexagon':
      return <HexagonVideoMask src={src} className={className} />
    case 'hexagon-two':
      return <HexagonTwoVideoMask src={src} className={className} />
    default:
      return <HexagonVideoMask src={src} className={className} />
  }
}

export const VIDEO_MASK_OPTIONS: { value: VideoMaskStyle; label: string }[] = [
  { value: 'creative', label: 'Creative' },
  { value: 'splash-water', label: 'Splash Water' },
  { value: 'text-overlay', label: 'Text Overlay' },
  { value: 'hexagon', label: 'Hexagon' },
  { value: 'hexagon-two', label: 'Hexagon Two' },
]
