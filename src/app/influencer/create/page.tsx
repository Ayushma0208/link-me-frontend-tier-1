'use client'

import { Suspense } from 'react'

import { CreateStudio } from '@/views/influencer/CreateStudio'

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="text-white/40">Loading…</div>}>
      <CreateStudio />
    </Suspense>
  )
}
