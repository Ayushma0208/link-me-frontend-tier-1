'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { InfluencerLayout } from '@/layouts/InfluencerLayout'

export default function InfluencerRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute roles={['creator']}>
      <InfluencerLayout>{children}</InfluencerLayout>
    </ProtectedRoute>
  )
}
