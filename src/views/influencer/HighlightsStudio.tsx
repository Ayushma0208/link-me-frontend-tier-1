'use client'

import { useState } from 'react'

import {
  HighlightCard,
  NewHighlightButton,
} from '@/components/creator-studio/HighlightCard'
import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import { studioHighlights, studioStories } from '@/data/creator-studio'

export function HighlightsStudio() {
  const [title, setTitle] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  function toggleStory(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div>
      <StudioPageHeader
        title="Highlights"
        description="Pin lasting story collections on your public profile — travel, looks, BTS, and more."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NewHighlightButton
          onClick={() => {
            document.getElementById('new-highlight')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }}
        />
        {studioHighlights.map((highlight, index) => (
          <HighlightCard
            key={highlight.id}
            highlight={highlight}
            delay={index * 0.05}
          />
        ))}
      </div>

      <StudioGlassCard id="new-highlight" glow="creator" className="p-5 sm:p-6">
        <h2 className="text-lg font-bold text-white">Create highlight</h2>
        <p className="mt-1 text-[13px] text-white/45">
          Name the collection and pick stories to include.
        </p>

        <label className="mt-5 block max-w-md">
          <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
            Title
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer 26"
            className="mt-2 h-11 w-full rounded-2xl border border-white/12 bg-white/[0.05] px-3.5 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400/40"
          />
        </label>

        <p className="mt-6 mb-3 text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
          Select stories
        </p>
        <div className="flex flex-wrap gap-3">
          {studioStories.map((story) => {
            const active = selected.includes(story.id)
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => toggleStory(story.id)}
                className={`relative size-20 overflow-hidden rounded-2xl border-2 transition-colors ${
                  active
                    ? 'border-fuchsia-400 shadow-[0_0_24px_rgba(217,70,239,0.35)]'
                    : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundImage: `url(${story.mediaUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                aria-pressed={active}
              />
            )
          })}
        </div>

        <button
          type="button"
          disabled={!title || selected.length === 0}
          className="mt-6 h-12 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-6 text-[14px] font-semibold text-white disabled:opacity-40"
        >
          Save highlight
        </button>
      </StudioGlassCard>
    </div>
  )
}
