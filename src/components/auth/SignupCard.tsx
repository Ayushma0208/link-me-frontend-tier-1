'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { Crown, Heart } from 'lucide-react'

import { EmailButton } from '@/components/auth/EmailButton'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SignupRole = 'user' | 'creator'

interface SignupCardProps {
  className?: string
}

export function SignupCard({ className }: SignupCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefersReducedMotion = useReducedMotion()
  const initialRole =
    searchParams.get('role') === 'creator' ? 'creator' : 'user'
  const [role, setRole] = useState<SignupRole>(initialRole)
  const [authMethod, setAuthMethod] = useState<'google' | 'email' | null>(null)

  function handleContinue() {
    const params = new URLSearchParams({ role })
    if (authMethod) params.set('method', authMethod)
    const username = searchParams.get('username')
    if (username) params.set('username', username)
    const from = searchParams.get('from')
    if (from) params.set('from', from)
    router.push(`/register?${params.toString()}`)
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'relative w-full max-w-[520px] overflow-hidden rounded-[32px]',
        'border border-white/12 bg-white/[0.08] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.55)]',
        'backdrop-blur-2xl backdrop-saturate-150 sm:p-8',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />

      <div className="relative">
        <div className="flex flex-col items-center text-center">
          <Logo markSize="lg" />
          <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.035em] text-white sm:text-[1.75rem]">
            Create your account
          </h1>
          <p className="mt-2 text-[15px] text-white/55">
            Choose how you want to use Linkme.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1.5">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[13px] font-semibold transition',
              role === 'user'
                ? 'bg-sky-500/25 text-sky-100 ring-1 ring-sky-400/40'
                : 'text-white/50 hover:text-white/80'
            )}
          >
            <Heart className="size-4" />
            Fan
          </button>
          <button
            type="button"
            onClick={() => setRole('creator')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[13px] font-semibold transition',
              role === 'creator'
                ? 'bg-fuchsia-500/25 text-fuchsia-100 ring-1 ring-fuchsia-400/40'
                : 'text-white/50 hover:text-white/80'
            )}
          >
            <Crown className="size-4" />
            Creator
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <GoogleButton
            onClick={() => setAuthMethod('google')}
            className={
              authMethod === 'google'
                ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-black'
                : undefined
            }
          />

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-white/10" aria-hidden />
            <span className="text-[11px] font-medium tracking-[0.16em] text-white/35 uppercase">
              OR
            </span>
            <span className="h-px flex-1 bg-white/10" aria-hidden />
          </div>

          <EmailButton
            onClick={() => setAuthMethod('email')}
            className={
              authMethod === 'email'
                ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-black'
                : undefined
            }
          />
        </div>

        <Button
          type="button"
          onClick={handleContinue}
          className={cn(
            'mt-8 h-12 w-full rounded-full text-[15px] font-semibold',
            role === 'creator'
              ? 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white hover:opacity-95'
              : 'bg-white text-black hover:bg-neutral-100'
          )}
        >
          Continue as {role === 'creator' ? 'Creator' : 'Fan'}
        </Button>

        <p className="mt-5 text-center text-[13px] text-white/45">
          Already have an account?{' '}
          <Link
            href={role === 'creator' ? '/login?role=creator' : '/login?role=user'}
            className="font-medium text-white underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
