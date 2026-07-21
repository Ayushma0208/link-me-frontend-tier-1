'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'

import { EmailButton } from '@/components/auth/EmailButton'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { RegisterBenefits } from '@/components/auth/RegisterBenefits'
import { RegisterGlassCard } from '@/components/auth/RegisterGlassCard'
import { SharedInput } from '@/components/auth/SharedInput'
import { Logo } from '@/components/layout/Logo'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

const CREATOR_BENEFITS = [
  'Sell subscriptions',
  'Premium posts',
  'Analytics Dashboard',
  'Digital products',
  'Social links',
]

interface CreatorRegisterCardProps {
  initialUsername?: string
  onSwitchRole: () => void
  className?: string
}

export function CreatorRegisterCard({
  initialUsername = '',
  onSwitchRole,
  className,
}: CreatorRegisterCardProps) {
  const router = useRouter()
  const register = useAuthStore((s) => s.register)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)
  const prefersReducedMotion = useReducedMotion()
  const [name, setName] = useState('')
  const [username, setUsername] = useState(initialUsername)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMethod, setAuthMethod] = useState<'google' | 'email' | null>('email')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogleSignup() {
    setError('')
    setAuthMethod('google')
    setGoogleLoading(true)
    try {
      await loginWithGoogle('creator')
      router.push('/influencer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-up failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        password,
        role: 'creator',
      })
      router.push('/influencer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegisterGlassCard accent="creator" className={className}>
      <div className="flex flex-col items-center text-center">
        <Logo markSize="lg" />
        <p className="mt-4 text-[11px] font-semibold tracking-[0.18em] text-transparent uppercase bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text">
          Creator
        </p>
        <h1 className="mt-2 text-[1.65rem] font-extrabold tracking-[-0.04em] text-white sm:text-[1.85rem]">
          Start earning from your audience
        </h1>
        <p className="mt-2 max-w-[36ch] text-[14px] leading-relaxed text-white/55 sm:text-[15px]">
          Create your page, grow your audience and monetize your content.
        </p>
      </div>

      <div className="mt-7 space-y-3">
        <motion.div
          whileHover={prefersReducedMotion ? undefined : { y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <GoogleButton
            onClick={handleGoogleSignup}
            loading={googleLoading}
            disabled={loading}
            className={cn(
              authMethod === 'google' &&
                'ring-2 ring-fuchsia-400/45 ring-offset-2 ring-offset-black'
            )}
          />
        </motion.div>

        <div className="flex items-center gap-3 py-0.5">
          <span className="h-px flex-1 bg-white/10" aria-hidden />
          <span className="text-[11px] font-medium tracking-[0.16em] text-white/35 uppercase">
            OR
          </span>
          <span className="h-px flex-1 bg-white/10" aria-hidden />
        </div>

        <motion.div
          whileHover={prefersReducedMotion ? undefined : { y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <EmailButton
            onClick={() => setAuthMethod('email')}
            className={cn(
              'border-fuchsia-400/25 hover:border-pink-300/40',
              authMethod === 'email' &&
                'ring-2 ring-fuchsia-400/45 ring-offset-2 ring-offset-black'
            )}
          />
        </motion.div>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {error ? (
          <p className="rounded-2xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-200">
            {error}
          </p>
        ) : null}

        <SharedInput
          label="Name"
          accent="creator"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          delay={0.05}
          required
        />
        <SharedInput
          label="Username"
          accent="creator"
          name="username"
          autoComplete="username"
          placeholder="yourhandle"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
          }
          delay={0.1}
          required
        />
        <SharedInput
          label="Email"
          accent="creator"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          delay={0.15}
          required
        />
        <SharedInput
          label="Password"
          accent="creator"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          delay={0.2}
          required
        />

        <div className="pt-2">
          <p className="mb-3 text-[12px] font-medium tracking-[0.12em] text-white/40 uppercase">
            What you get
          </p>
          <RegisterBenefits items={CREATOR_BENEFITS} accent="creator" />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={prefersReducedMotion || loading ? undefined : { y: -2 }}
          whileTap={prefersReducedMotion || loading ? undefined : { scale: 0.985 }}
          className={cn(
            'mt-2 flex h-12 w-full items-center justify-center rounded-full',
            'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
            'text-[15px] font-semibold text-white',
            'shadow-[0_12px_40px_rgba(217,70,239,0.4)]',
            'transition-shadow duration-200 hover:shadow-[0_16px_48px_rgba(236,72,153,0.45)]',
            'disabled:pointer-events-none disabled:opacity-55'
          )}
        >
          {loading ? 'Creating…' : 'Create Creator Account'}
        </motion.button>
      </form>

      <div className="mt-6 space-y-3 text-center text-[13px] text-white/45">
        <p>
          Just here to follow?{' '}
          <button
            type="button"
            onClick={onSwitchRole}
            className="font-medium text-fuchsia-300 underline-offset-4 hover:underline"
          >
            Register as User
          </button>
        </p>
        <p>
          Already have an account?{' '}
          <Link
            href="/login?role=creator"
            className="font-medium text-white underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </RegisterGlassCard>
  )
}
