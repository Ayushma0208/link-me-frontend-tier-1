'use client'

import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { IncomingCallHost } from '@/components/calls/IncomingCallHost'
import { NotificationsBootstrap } from '@/components/notifications/NotificationsBootstrap'
import { LiveToastHost } from '@/components/notifications/LiveToastHost'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  },
})

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuthStore((s) => s.fetchMe)

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        <NotificationsBootstrap />
        <LiveToastHost />
        <IncomingCallHost />
        {children}
      </AuthBootstrap>
    </QueryClientProvider>
  )
}
