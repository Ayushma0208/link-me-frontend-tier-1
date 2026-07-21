'use client'

import { useMemo, useRef } from 'react'
import { AtSign, Hash } from 'lucide-react'

import { cn } from '@/lib/utils'

const SUGGESTED_TAGS = [
  'exclusive',
  'behindthescenes',
  'reels',
  'creator',
  'linkme',
  'fashion',
  'travel',
]

const SUGGESTED_MENTIONS = [
  'sofia.r',
  'jblake',
  'lenaortiz',
  'linkme',
  'noahpark',
]

export interface CaptionEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CaptionEditor({
  value,
  onChange,
  className,
}: CaptionEditorProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null)

  const { hashtags, mentions } = useMemo(() => {
    const tags = Array.from(value.matchAll(/#([\w]+)/g)).map((m) => m[1]!)
    const people = Array.from(value.matchAll(/@([\w.]+)/g)).map((m) => m[1]!)
    return {
      hashtags: Array.from(new Set(tags)),
      mentions: Array.from(new Set(people)),
    }
  }, [value])

  function insertToken(token: string) {
    const el = ref.current
    const next = value.trim().length ? `${value.trimEnd()} ${token} ` : `${token} `
    onChange(next)
    requestAnimationFrame(() => {
      el?.focus()
      const pos = next.length
      el?.setSelectionRange(pos, pos)
    })
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
          Caption
        </p>
        <span className="text-[11px] tabular-nums text-white/30">
          {value.length}/2200
        </span>
      </div>

      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 2200))}
        rows={5}
        placeholder="Write a caption… use #hashtags and @mentions"
        className="w-full resize-none rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[14px] leading-relaxed text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400/35"
      />

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
          <Hash className="size-3.5" />
          Hashtags
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TAGS.map((tag) => {
            const active = hashtags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => insertToken(`#${tag}`)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[12px] font-medium transition',
                  active
                    ? 'border-fuchsia-400/35 bg-fuchsia-500/15 text-fuchsia-100'
                    : 'border-white/10 bg-white/[0.03] text-white/55 hover:text-white'
                )}
              >
                #{tag}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
          <AtSign className="size-3.5" />
          Mentions
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_MENTIONS.map((handle) => {
            const active = mentions.includes(handle)
            return (
              <button
                key={handle}
                type="button"
                onClick={() => insertToken(`@${handle}`)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[12px] font-medium transition',
                  active
                    ? 'border-sky-400/35 bg-sky-500/15 text-sky-100'
                    : 'border-white/10 bg-white/[0.03] text-white/55 hover:text-white'
                )}
              >
                @{handle}
              </button>
            )
          })}
        </div>
      </div>

      {(hashtags.length > 0 || mentions.length > 0) ? (
        <p className="text-[12px] text-white/35">
          Detected:{' '}
          {hashtags.map((t) => `#${t}`).join(' ')}
          {hashtags.length && mentions.length ? ' · ' : ''}
          {mentions.map((m) => `@${m}`).join(' ')}
        </p>
      ) : null}
    </div>
  )
}
