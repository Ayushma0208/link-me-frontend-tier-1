'use client'

import { Suspense } from 'react'

import { RegisterExperience } from '@/components/auth/RegisterExperience'

function RegisterFallback() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-black">
      <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterExperience />
    </Suspense>
  )
}
