'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute roles={['user', 'creator']}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}
