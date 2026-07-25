'use client'

import { Suspense } from 'react'
import { CreatorNotificationsStudio } from '@/views/influencer/CreatorNotificationsStudio'

export default function InfluencerNotificationsPage() {
  return (
    <Suspense
      fallback={
        <p className="px-6 py-10 text-[13px] text-white/40">Loading…</p>
      }
    >
      <CreatorNotificationsStudio />
    </Suspense>
  )
}
