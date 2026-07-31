'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export type LoginAccent = 'user' | 'creator' | 'neutral'

interface ForgotPasswordLinkProps {
  accent?: LoginAccent
  href?: string
  className?: string
}

const textByAccent = {
  user: 'text-sky-300 hover:text-sky-200',
  creator: 'text-fuchsia-300 hover:text-pink-200',
  neutral: 'text-white/70 hover:text-white',
} as const

export function ForgotPasswordLink({
  accent = 'neutral',
  href,
  className,
}: ForgotPasswordLinkProps) {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const prefersReducedMotion = useReducedMotion()
  const role = searchParams.get('role')
  const resolvedHref =
    href ??
    (role === 'user' || role === 'creator'
      ? `/forgot-password?role=${role}`
      : '/forgot-password')

  return (
    <motion.div whileHover={prefersReducedMotion ? undefined : { x: 1 }}>
      <Link
        href={resolvedHref}
        className={cn(
          'text-[13px] font-medium underline-offset-4 transition-colors hover:underline',
          textByAccent[accent],
          className
        )}
      >
        {t('forgotPassword')}
      </Link>
    </motion.div>
  )
}
