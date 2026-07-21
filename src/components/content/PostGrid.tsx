import { Lock } from 'lucide-react'
import type { PostDto } from '@link-me/shared'
import { Button } from '@/components/ui/button'
import { ProtectedMedia } from './ProtectedMedia'
import { formatCurrency } from '@/lib/utils'

interface PostGridProps {
  posts: PostDto[]
  onUnlock?: (postId: string) => void
  viewerId?: string
}

export function PostGrid({ posts, onUnlock, viewerId }: PostGridProps) {
  if (!posts.length) {
    return <p className="text-center text-sm text-muted">No posts yet</p>
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface-overlay"
        >
          {post.locked ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center blur-xl scale-110"
                style={{
                  backgroundImage: post.blurredThumbnailUrl
                    ? `url(${post.blurredThumbnailUrl})`
                    : undefined,
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4">
                <Lock className="mb-2 h-8 w-8 text-white/80" />
                <p className="text-center text-sm font-medium">{post.title}</p>
                {post.price && (
                  <p className="mt-1 text-xs text-muted">
                    {formatCurrency(post.price, 'INR')}/mo
                  </p>
                )}
                {onUnlock && (
                  <Button size="sm" className="mt-3" onClick={() => onUnlock(post.id)}>
                    Unlock
                  </Button>
                )}
              </div>
            </>
          ) : (
            <ProtectedMedia userId={viewerId} className="h-full w-full">
              {post.type === 'image' ? (
                <img
                  src={post.mediaUrl ?? post.thumbnailUrl ?? ''}
                  alt={post.title}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <video
                  src={post.mediaUrl ?? undefined}
                  poster={post.thumbnailUrl ?? undefined}
                  controls
                  className="h-full w-full object-cover"
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
            </ProtectedMedia>
          )}
        </div>
      ))}
    </div>
  )
}
