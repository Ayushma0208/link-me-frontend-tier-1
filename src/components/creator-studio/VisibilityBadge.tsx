import type { ContentVisibility, PostMediaType } from '@/data/creator-studio'
import { cn } from '@/lib/utils'

const visibilityStyles: Record<ContentVisibility, string> = {
  public: 'border-emerald-400/25 bg-emerald-500/15 text-emerald-200',
  subscribers: 'border-fuchsia-400/25 bg-fuchsia-500/15 text-fuchsia-200',
  ppv: 'border-amber-400/25 bg-amber-500/15 text-amber-200',
}

const visibilityLabels: Record<ContentVisibility, string> = {
  public: 'Public',
  subscribers: 'Subscribers',
  ppv: 'Pay Per View',
}

const typeLabels: Record<PostMediaType, string> = {
  image: 'Image',
  video: 'Video',
  reel: 'Reel',
  carousel: 'Carousel',
}

export function VisibilityBadge({
  visibility,
  className,
}: {
  visibility: ContentVisibility
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
        visibilityStyles[visibility],
        className
      )}
    >
      {visibilityLabels[visibility]}
    </span>
  )
}

export function MediaTypeBadge({
  type,
  className,
}: {
  type: PostMediaType
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-white/15 bg-black/50 px-2.5 py-0.5',
        'text-[10px] font-semibold tracking-wide text-white/80 uppercase backdrop-blur-md',
        className
      )}
    >
      {typeLabels[type]}
    </span>
  )
}
