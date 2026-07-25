'use client'

import { use } from 'react'
import { LiveInsightsStudio } from '@/views/influencer/LiveInsightsStudio'

export default function LiveInsightsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <LiveInsightsStudio liveId={id} />
}
