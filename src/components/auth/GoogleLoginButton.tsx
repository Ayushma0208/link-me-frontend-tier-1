'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { GoogleButton } from '@/components/auth/GoogleButton'
import { cn } from '@/lib/utils'

export type LoginAccent = 'user' | 'creator' | 'neutral'

interface GoogleLoginButtonProps {
  accent?: LoginAccent
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

const ringByAccent = {
  user: 'ring-sky-400/40',
  creator: 'ring-fuchsia-400/45',
  neutral: 'ring-white/30',
} as const

export function GoogleLoginButton({
  accent = 'neutral',
  loading = false,
  disabled,
  onClick,
  className,
}: GoogleLoginButtonProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={prefersReducedMotion || loading || disabled ? undefined : { y: -2 }}
      whileTap={prefersReducedMotion || loading || disabled ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.2 }}
    >
      <GoogleButton
        onClick={onClick}
        loading={loading}
        disabled={disabled}
        className={cn(
          'h-[52px] text-[15px]',
          loading && `ring-2 ${ringByAccent[accent]} ring-offset-2 ring-offset-black`,
          className
        )}
      />
    </motion.div>
  )
}
