'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { HomePlaceholders } from '@/components/dashboard/DashboardLayout'
import { useAuthStore } from '@/stores/auth'

export default function UserHomePage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  useEffect(() => {
    if (loading || !user) return
    // Creators landing on the fan home should return to Creator Studio.
    if (user.role === 'creator') {
      router.replace('/influencer')
    }
  }, [loading, user, router])

  if (!loading && user?.role === 'creator') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-white/45">
        Opening creator dashboard…
      </div>
    )
  }

  return <HomePlaceholders />
}
