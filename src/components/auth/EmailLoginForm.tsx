'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { ForgotPasswordLink } from '@/components/auth/ForgotPasswordLink'
import { RememberMeCheckbox } from '@/components/auth/RememberMeCheckbox'
import { SharedInput, type SharedInputAccent } from '@/components/auth/SharedInput'
import { cn } from '@/lib/utils'

export type LoginAccent = SharedInputAccent

interface EmailLoginFormProps {
  accent?: LoginAccent
  loading?: boolean
  error?: string
  onSubmit: (values: {
    email: string
    password: string
    remember: boolean
  }) => void | Promise<void>
  className?: string
}

const buttonByAccent = {
  user: {
    bg: 'bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600',
    shadow: 'shadow-[0_12px_40px_rgba(56,189,248,0.35)] hover:shadow-[0_16px_48px_rgba(34,211,238,0.45)]',
  },
  creator: {
    bg: 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
    shadow: 'shadow-[0_12px_40px_rgba(217,70,239,0.4)] hover:shadow-[0_16px_48px_rgba(236,72,153,0.45)]',
  },
  neutral: {
    bg: 'bg-gradient-to-r from-white via-white to-neutral-200',
    shadow: 'shadow-[0_12px_40px_rgba(255,255,255,0.18)] hover:shadow-[0_16px_48px_rgba(255,255,255,0.28)]',
  },
} as const

export function EmailLoginForm({
  accent = 'neutral',
  loading = false,
  error,
  onSubmit,
  className,
}: EmailLoginFormProps) {
  const prefersReducedMotion = useReducedMotion()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const styles = buttonByAccent[accent]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({ email: email.trim(), password, remember })
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {error ? (
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-200"
        >
          {error}
        </motion.p>
      ) : null}

      <SharedInput
        label="Email"
        accent={accent}
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        delay={0.08}
        required
      />

      <SharedInput
        label="Password"
        accent={accent}
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        delay={0.14}
        required
      />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between gap-3 pt-0.5"
      >
        <RememberMeCheckbox
          checked={remember}
          onCheckedChange={setRemember}
          accent={accent}
        />
        <ForgotPasswordLink accent={accent} />
      </motion.div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={prefersReducedMotion || loading ? undefined : { y: -2 }}
        whileTap={prefersReducedMotion || loading ? undefined : { scale: 0.985 }}
        className={cn(
          'mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full',
          'text-[15px] font-semibold transition-shadow duration-200',
          styles.bg,
          styles.shadow,
          accent === 'neutral' ? 'text-black' : 'text-white',
          'disabled:pointer-events-none disabled:opacity-55'
        )}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Continuing…
          </>
        ) : (
          'Continue'
        )}
      </motion.button>
    </form>
  )
}
