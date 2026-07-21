'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/layouts/AdminLayout'

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={['admin']}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}
