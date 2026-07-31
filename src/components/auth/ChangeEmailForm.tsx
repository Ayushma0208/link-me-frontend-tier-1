'use client'

import { useState } from 'react'
import Link from 'next/link'

import { SharedInput, type SharedInputAccent } from '@/components/auth/SharedInput'
import { api } from '@/lib/api'
import {
  mapBackendUser,
  type BackendPublicUser,
} from '@/lib/auth-map'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

type Step = 'email' | 'code'

export function ChangeEmailForm({
  accent,
  className,
  showHeader = true,
}: {
  accent: Extract<SharedInputAccent, 'user' | 'creator'>
  className?: string
  showHeader?: boolean
}) {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const hasPassword = user?.hasPassword !== false

  const [step, setStep] = useState<Step>('email')
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      const data = await api<{ message: string }>('/auth/me/email/request', {
        method: 'POST',
        body: JSON.stringify({
          newEmail: newEmail.trim(),
          ...(hasPassword ? { currentPassword } : {}),
        }),
      })
      setInfo(data.message)
      setStep('code')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send code')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code')
      return
    }
    setLoading(true)
    try {
      const data = await api<{ user: BackendPublicUser }>('/auth/me/email/confirm', {
        method: 'POST',
        body: JSON.stringify({ newEmail: newEmail.trim(), code }),
      })
      setUser(mapBackendUser(data.user))
      setCurrentPassword('')
      setCode('')
      setNewEmail('')
      setStep('email')
      setInfo('Email updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('space-y-5', className)}>
      {showHeader ? (
        <div>
          <h2 className="text-[16px] font-bold text-white">Email</h2>
          <p className="mt-1 text-[13px] text-white/40">
            Current: {user?.email ?? '—'}
          </p>
        </div>
      ) : (
        <p className="text-[13px] text-white/40">Current: {user?.email ?? '—'}</p>
      )}

      {step === 'email' ? (
        <form onSubmit={handleRequest} className="space-y-5">
          <SharedInput
            label="New email"
            accent={accent}
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            autoComplete="email"
            required
          />
          {hasPassword ? (
            <SharedInput
              label="Current password"
              accent={accent}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-200">
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-3.5 py-2.5 text-[13px] text-emerald-200">
              {info}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'flex h-12 w-full items-center justify-center rounded-full',
              'border border-white/15 bg-white/[0.06] text-[15px] font-semibold text-white',
              'transition hover:bg-white/[0.1] disabled:opacity-50'
            )}
          >
            {loading ? 'Sending…' : 'Send verification code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleConfirm} className="space-y-5">
          <p className="text-[13px] text-white/45">
            Enter the code sent to <span className="text-white">{newEmail}</span>.
          </p>
          <SharedInput
            label="Verification code"
            accent={accent}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />

          {error ? (
            <p className="rounded-2xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-200">
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-3.5 py-2.5 text-[13px] text-emerald-200">
              {info}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'flex h-12 w-full items-center justify-center rounded-full',
              'border border-white/15 bg-white/[0.06] text-[15px] font-semibold text-white',
              'transition hover:bg-white/[0.1] disabled:opacity-50'
            )}
          >
            {loading ? 'Updating…' : 'Confirm new email'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setStep('email')
              setCode('')
              setError('')
              setInfo('')
            }}
            className="w-full text-center text-[13px] text-white/45 hover:text-white"
          >
            Use a different email
          </button>
        </form>
      )}

      {!hasPassword ? (
        <p className="text-[12px] text-white/35">
          Google accounts can change email without a password.{' '}
          <Link href="/forgot-password" className="text-white/60 underline hover:text-white">
            Set a password
          </Link>{' '}
          anytime.
        </p>
      ) : null}
    </div>
  )
}
