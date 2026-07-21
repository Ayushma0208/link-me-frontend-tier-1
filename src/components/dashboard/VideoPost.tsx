'use client'

import { useRef, useState } from 'react'
import { Clapperboard, Pause, Play, Volume2, VolumeX } from 'lucide-react'

import { SafeImage } from '@/components/media/SafeImage'
import { imageSrcForDisplay } from '@/lib/media-url'
import { cn } from '@/lib/utils'

export interface VideoPostProps {
  videoUrl: string
  posterUrl: string
  alt: string
  reel?: boolean
  className?: string
}

export function VideoPost({
  videoUrl,
  posterUrl,
  alt,
  reel = false,
  className,
}: VideoPostProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [started, setStarted] = useState(false)

  async function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (!started) setStarted(true)
    if (video.paused) {
      await video.play()
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  const poster = imageSrcForDisplay(posterUrl)

  return (
    <div
      className={cn(
        'group relative bg-black',
        reel ? 'aspect-[9/14] sm:aspect-[4/5]' : 'aspect-[4/5] sm:aspect-[5/6]',
        className
      )}
    >
      {!started ? (
        <SafeImage
          src={poster}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 560px"
        />
      ) : null}

      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        muted={muted}
        playsInline
        loop
        className={cn(
          'absolute inset-0 size-full object-cover',
          !started && 'opacity-0'
        )}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 to-transparent" />

      {reel ? (
        <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur-md">
          <Clapperboard className="size-3" />
          Reel
        </span>
      ) : (
        <span className="absolute top-3 left-3 z-10 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur-md">
          Video
        </span>
      )}

      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
        className="absolute inset-0 z-[5] flex items-center justify-center"
      >
        <span
          className={cn(
            'flex size-14 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition',
            'opacity-100 group-hover:scale-105',
            playing && 'opacity-0 group-hover:opacity-100'
          )}
        >
          {playing ? (
            <Pause className="size-5 fill-white" />
          ) : (
            <Play className="size-5 fill-white" />
          )}
        </span>
      </button>

      <button
        type="button"
        aria-label={muted ? 'Unmute' : 'Mute'}
        onClick={(e) => {
          e.stopPropagation()
          setMuted((v) => !v)
        }}
        className="absolute right-3 bottom-3 z-10 flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
    </div>
  )
}
