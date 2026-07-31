'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { RegisterGlassCard } from '@/components/auth/RegisterGlassCard'
import { SharedInput, type SharedInputAccent } from '@/components/auth/SharedInput'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { Logo } from '@/components/layout/Logo'
import { ApiError, api } from '@/lib/api'
import { cn } from '@/lib/utils'

type Step = 'email' | 'reset' | 'done'

function parseAccent(role: string | null): SharedInputAccent {
  if (role === 'creator') return 'creator'
  if (role === 'user') return 'user'
  return 'neutral'
}

const buttonByAccent = {
  user: {
    bg: 'bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600',
    shadow:
      'shadow-[0_12px_40px_rgba(56,189,248,0.35)] hover:shadow-[0_16px_48px_rgba(34,211,238,0.45)]',
  },
  creator: {
    bg: 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
    shadow:
      'shadow-[0_12px_40px_rgba(217,70,239,0.4)] hover:shadow-[0_16px_48px_rgba(236,72,153,0.45)]',
  },
  neutral: {
    bg: 'bg-gradient-to-r from-white via-white to-neutral-200',
    shadow:
      'shadow-[0_12px_40px_rgba(255,255,255,0.18)] hover:shadow-[0_16px_48px_rgba(255,255,255,0.28)]',
  },
} as const

function passwordError(
  password: string,
  t: (key: 'passwordMinLength' | 'passwordNeedLetter' | 'passwordNeedNumber') => string
): string | null {
  if (password.length < 8) return t('passwordMinLength')
  if (!/[A-Za-z]/.test(password)) return t('passwordNeedLetter')
  if (!/[0-9]/.test(password)) return t('passwordNeedNumber')
  return null
}

export function ForgotPasswordCard({ className }: { className?: string }) {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const prefersReducedMotion = useReducedMotion()

  const role = searchParams.get('role')
  const accent = parseAccent(role)
  const styles = buttonByAccent[accent]
  const loginHref =
    role === 'user' || role === 'creator' ? `/login?role=${role}` : '/login'

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      const data = await api<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      })
      setInfo(data.message || t('codeSent'))
      setStep('reset')
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : t('requestFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')

    const pwdErr = passwordError(newPassword, t)
    if (pwdErr) {
      setError(pwdErr)
      return
    }
    if (newPassword !== confirmPassword) {
      setError(t('passwordsMustMatch'))
      return
    }
    if (code.trim().length !== 6) {
      setError(t('otpInvalid'))
      return
    }

    setLoading(true)
    try {
      await api<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          newPassword,
        }),
      })
      setStep('done')
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : t('requestFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn('w-full max-w-[520px]', className)}
    >
      <RegisterGlassCard accent={accent}>
        <div className="flex flex-col items-center text-center">
          <Logo markSize="lg" />
          <h1 className="mt-5 text-[1.65rem] font-extrabold tracking-[-0.04em] text-white sm:text-[1.85rem]">
            {t('forgotPasswordTitle')}
          </h1>
          <p className="mt-2 max-w-[36ch] text-[14px] leading-relaxed text-white/55 sm:text-[15px]">
            {step === 'done' ? t('passwordResetSuccess') : t('forgotPasswordSubtitle')}
          </p>
        </div>

        {error ? (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-200"
          >
            {error}
          </motion.p>
        ) : null}

        {info && step !== 'done' ? (
          <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-[13px] text-white/70">
            {info}
          </p>
        ) : null}

        {step === 'email' ? (
          <form onSubmit={sendCode} className="mt-6 space-y-4">
            <SharedInput
              label={t('email')}
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
            <SubmitButton
              accent={accent}
              styles={styles}
              loading={loading}
              loadingLabel={t('sendingCode')}
              label={t('sendCode')}
              prefersReducedMotion={!!prefersReducedMotion}
            />
          </form>
        ) : null}

        {step === 'reset' ? (
          <form onSubmit={submitReset} className="mt-6 space-y-4">
            <SharedInput
              label={t('otpCode')}
              accent={accent}
              type="text"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              delay={0.08}
              required
            />
            <SharedInput
              label={t('newPassword')}
              accent={accent}
              type="password"
              name="newPassword"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              delay={0.12}
              required
            />
            <SharedInput
              label={t('confirmPassword')}
              accent={accent}
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              delay={0.16}
              required
            />
            <SubmitButton
              accent={accent}
              styles={styles}
              loading={loading}
              loadingLabel={t('resettingPassword')}
              label={t('resetPassword')}
              prefersReducedMotion={!!prefersReducedMotion}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => sendCode()}
              className="w-full text-center text-[13px] font-medium text-white/50 transition-colors hover:text-white/80 disabled:opacity-50"
            >
              {t('resendCode')}
            </button>
          </form>
        ) : null}

        {step === 'done' ? (
          <div className="mt-8">
            <Link
              href={loginHref}
              className={cn(
                'flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold transition-shadow duration-200',
                styles.bg,
                styles.shadow,
                accent === 'neutral' ? 'text-black' : 'text-white'
              )}
            >
              {t('backToSignIn')}
            </Link>
          </div>
        ) : (
          <p className="mt-6 text-center text-[13px] text-white/45">
            <Link
              href={loginHref}
              className="font-semibold text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              {t('backToSignIn')}
            </Link>
          </p>
        )}

        <div className="mt-4 flex justify-center">
          <LanguageSwitcher compact />
        </div>
      </RegisterGlassCard>
    </motion.div>
  )
}

function SubmitButton({
  accent,
  styles,
  loading,
  loadingLabel,
  label,
  prefersReducedMotion,
}: {
  accent: SharedInputAccent
  styles: (typeof buttonByAccent)[SharedInputAccent]
  loading: boolean
  loadingLabel: string
  label: string
  prefersReducedMotion: boolean
}) {
  return (
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
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </motion.button>
  )
}
