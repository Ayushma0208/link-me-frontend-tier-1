'use client'

import { Suspense } from 'react'

import { UserExplore } from '@/views/user/Explore'

function ExploreFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse space-y-6 py-4">
      <div className="h-8 w-48 rounded-full bg-white/10" />
      <div className="h-12 w-full rounded-2xl bg-white/5" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-[22px] bg-white/5" />
        ))}
      </div>
    </div>
  )
}

export default function UserExplorePage() {
  return (
    <Suspense fallback={<ExploreFallback />}>
      <UserExplore />
    </Suspense>
  )
}
