'use client'

import { Suspense } from 'react'

import { SignupBackdrop } from '@/components/auth/SignupBackdrop'
import { SignupCard } from '@/components/auth/SignupCard'

function SignupFallback() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-black px-4 py-12">
      <SignupBackdrop />
      <div className="relative z-20 h-80 w-full max-w-[520px] animate-pulse rounded-[32px] bg-white/5" />
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-black px-4 py-12 text-white sm:px-6">
        <SignupBackdrop />
        <div className="relative z-20 w-full max-w-[520px]">
          <SignupCard />
        </div>
      </main>
    </Suspense>
  )
}
