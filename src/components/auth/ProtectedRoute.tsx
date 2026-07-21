'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@link-me/shared'

export const roleHome: Record<UserRole, string> = {
  admin: '/admin',
  creator: '/influencer',
  user: '/user',
}

export function ProtectedRoute({
  roles,
  children,
}: {
  roles?: UserRole[]
  children: React.ReactNode
}) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`)
      return
    }

    if (roles && !roles.includes(user.role)) {
      router.replace(roleHome[user.role])
    }
  }, [loading, user, roles, router, pathname])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  if (roles && !roles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
