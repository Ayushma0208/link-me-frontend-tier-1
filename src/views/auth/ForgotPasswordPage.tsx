'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { ForgotPasswordCard } from '@/components/auth/ForgotPasswordCard'
import { SignupBackdrop } from '@/components/auth/SignupBackdrop'

export function ForgotPasswordPage() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.main
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-svh items-center justify-center overflow-hidden bg-black px-4 py-12 text-white sm:px-6"
    >
      <SignupBackdrop />
      <div className="relative z-20 w-full max-w-[520px]">
        <ForgotPasswordCard />
      </div>
    </motion.main>
  )
}
