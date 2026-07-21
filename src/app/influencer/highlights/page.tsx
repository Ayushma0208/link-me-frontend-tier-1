'use client'

import { Suspense } from 'react'

import { StoriesHighlightsStudio } from '@/views/influencer/StoriesHighlightsStudio'

export default function HighlightsPage() {
  return (
    <Suspense fallback={<div className="text-white/40">Loading…</div>}>
      <StoriesHighlightsStudio />
    </Suspense>
  )
}
