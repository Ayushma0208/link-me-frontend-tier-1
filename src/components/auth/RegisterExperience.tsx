'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { CreatorRegisterWizard } from '@/components/auth/CreatorRegisterWizard'
import { UserRegisterCard } from '@/components/auth/UserRegisterCard'
import { SignupBackdrop } from '@/components/auth/SignupBackdrop'

export function RegisterExperience() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') === 'creator' ? 'creator' : 'user'
  const initialUsername =
    searchParams.get('username')?.toLowerCase().replace(/[^a-z0-9_]/g, '') ?? ''

  const switchRole = useCallback(
    (next: 'creator' | 'user') => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('role', next)
      router.replace(`/register?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-black px-4 py-12 text-white sm:px-6">
      <SignupBackdrop />
      <div className="relative z-20 flex w-full max-w-[540px] flex-col items-center">
        {role === 'creator' ? (
          <CreatorRegisterWizard
            initialUsername={initialUsername}
            onSwitchRole={() => switchRole('user')}
          />
        ) : (
          <UserRegisterCard
            initialUsername={initialUsername || undefined}
            onSwitchRole={() => switchRole('creator')}
          />
        )}
      </div>
    </main>
  )
}
