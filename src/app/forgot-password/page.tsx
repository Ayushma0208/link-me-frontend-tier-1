'use client'

import { Suspense } from 'react'

import { SignupBackdrop } from '@/components/auth/SignupBackdrop'
import { ForgotPasswordPage } from '@/views/auth/ForgotPasswordPage'

function ForgotPasswordFallback() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-black px-4 py-12">
      <SignupBackdrop />
      <div className="relative z-20 h-[34rem] w-full max-w-[520px] animate-pulse rounded-[32px] bg-white/5" />
    </main>
  )
}

export default function ForgotPassword() {
  return (
    <Suspense fallback={<ForgotPasswordFallback />}>
      <ForgotPasswordPage />
    </Suspense>
  )
}
