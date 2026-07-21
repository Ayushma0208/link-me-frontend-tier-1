'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'

import { EmailLoginForm } from '@/components/auth/EmailLoginForm'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { RegisterGlassCard } from '@/components/auth/RegisterGlassCard'
import { Logo } from '@/components/layout/Logo'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

export type LoginRole = 'creator' | 'user' | null

function parseRole(value: string | null): LoginRole {
  if (value === 'user') return 'user'
  if (value === 'creator') return 'creator'
  return null
}

function roleToAccent(role: LoginRole) {
  if (role === 'creator') return 'creator' as const
  if (role === 'user') return 'user' as const
  return 'neutral' as const
}

const copyByRole = {
  creator: {
    badge: '👑 Creator Login',
    badgeClass:
      'bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent',
    heading: 'Welcome back, Creator',
    subtitle: 'Manage your audience, subscriptions and earnings.',
    createHref: (from: string | null) => {
      const params = new URLSearchParams({ role: 'creator' })
      if (from) params.set('from', from)
      return `/register?${params.toString()}`
    },
    linkClass: 'text-fuchsia-300 hover:text-pink-200',
  },
  user: {
    badge: '❤️ User Login',
    badgeClass:
      'bg-gradient-to-r from-sky-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent',
    heading: 'Welcome back',
    subtitle: 'Discover new creators and continue watching.',
    createHref: (from: string | null) => {
      const params = new URLSearchParams({ role: 'user' })
      if (from) params.set('from', from)
      return `/register?${params.toString()}`
    },
    linkClass: 'text-sky-300 hover:text-cyan-200',
  },
  neutral: {
    badge: null as string | null,
    badgeClass: '',
    heading: 'Welcome Back',
    subtitle: 'Continue where you left off.',
    createHref: (from: string | null) => {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      const qs = params.toString()
      return qs ? `/signup?${qs}` : '/signup'
    },
    linkClass: 'text-white hover:text-white',
  },
} as const

interface LoginCardProps {
  className?: string
}

export function LoginCard({ className }: LoginCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefersReducedMotion = useReducedMotion()
  const login = useAuthStore((s) => s.login)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)

  const role = parseRole(searchParams.get('role'))
  const from = searchParams.get('from')
  const accent = roleToAccent(role)
  const copy = copyByRole[role ?? 'neutral']

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleEmailLogin(values: {
    email: string
    password: string
    remember: boolean
  }) {
    setError('')
    setLoading(true)
    try {
      if (values.remember) {
        try {
          localStorage.setItem('linkme:remember', '1')
        } catch {
          // ignore
        }
      } else {
        try {
          localStorage.removeItem('linkme:remember')
        } catch {
          // ignore
        }
      }

      await login(values.email, values.password)
      const user = useAuthStore.getState().user
      const dest =
        user?.role === 'admin'
          ? '/admin'
          : user?.role === 'creator'
            ? from || '/influencer'
            : from || '/user'
      router.push(dest)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle(role === 'creator' ? 'creator' : 'user')
      const user = useAuthStore.getState().user
      const dest =
        user?.role === 'admin'
          ? '/admin'
          : user?.role === 'creator'
            ? from || '/influencer'
            : from || '/user'
      router.push(dest)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    } finally {
      setGoogleLoading(false)
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

          {copy.badge ? (
            <p
              className={cn(
                'mt-4 text-[11px] font-semibold tracking-[0.18em] uppercase',
                copy.badgeClass
              )}
            >
              {copy.badge}
            </p>
          ) : null}

          <h1
            className={cn(
              'font-extrabold tracking-[-0.04em] text-white',
              copy.badge ? 'mt-2' : 'mt-5',
              'text-[1.65rem] sm:text-[1.85rem]'
            )}
          >
            {copy.heading}
          </h1>
          <p className="mt-2 max-w-[36ch] text-[14px] leading-relaxed text-white/55 sm:text-[15px]">
            {copy.subtitle}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <GoogleLoginButton
            accent={accent}
            loading={googleLoading}
            disabled={loading}
            onClick={handleGoogleLogin}
          />

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-white/10" aria-hidden />
            <span className="text-[11px] font-medium tracking-[0.16em] text-white/35 uppercase">
              OR
            </span>
            <span className="h-px flex-1 bg-white/10" aria-hidden />
          </div>
        </div>

        <EmailLoginForm
          accent={accent}
          loading={loading}
          error={error}
          onSubmit={handleEmailLogin}
          className="mt-1"
        />

        <p className="mt-6 text-center text-[13px] text-white/45">
          Don&apos;t have an account?{' '}
          <motion.span className="inline-block" whileHover={{ y: -1 }}>
            <Link
              href={copy.createHref(from)}
              className={cn(
                'font-semibold underline-offset-4 transition-colors hover:underline',
                copy.linkClass
              )}
            >
              Create Account
            </Link>
          </motion.span>
        </p>
      </RegisterGlassCard>
    </motion.div>
  )
}
