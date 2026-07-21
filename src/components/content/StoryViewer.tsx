import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { StoryDto } from '@link-me/shared'
import { ProtectedMedia } from './ProtectedMedia'

interface StoryViewerProps {
  stories: StoryDto[]
  initialIndex?: number
  onClose: () => void
  viewerId?: string
}

export function StoryViewer({ stories, initialIndex = 0, onClose, viewerId }: StoryViewerProps) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (index < stories.length - 1) setIndex((i) => i + 1)
      else onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [index, stories.length, onClose])

  const story = stories[index]
  if (!story) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2"
      >
        <X className="h-6 w-6" />
      </button>

      {index > 0 && (
        <button
          type="button"
          onClick={() => setIndex((i) => i - 1)}
          className="absolute left-4 z-10 rounded-full bg-white/10 p-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {index < stories.length - 1 && (
        <button
          type="button"
          onClick={() => setIndex((i) => i + 1)}
          className="absolute right-16 z-10 rounded-full bg-white/10 p-2"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      <div className="h-full max-h-[90vh] w-full max-w-lg">
        <ProtectedMedia userId={viewerId} className="h-full w-full">
          {story.type === 'image' ? (
            <img
              src={story.mediaUrl}
              alt="Story"
              className="h-full w-full object-contain"
              draggable={false}
            />
          ) : (
            <video
              src={story.mediaUrl}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-contain"
              controlsList="nodownload"
            />
          )}
        </ProtectedMedia>
      </div>

      <div className="absolute left-4 right-4 top-4 flex gap-1">
        {stories.map((s, i) => (
          <div
            key={s.id}
            className={`h-1 flex-1 rounded-full ${i <= index ? 'bg-white' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  )
}
