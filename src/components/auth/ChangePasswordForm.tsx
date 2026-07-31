'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { SharedInput, type SharedInputAccent } from '@/components/auth/SharedInput'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

function newPasswordError(password: string): string | null {
  if (password.length < 8) return 'Use at least 8 characters'
  if (!/[A-Za-z]/.test(password)) return 'Include at least one letter'
  if (!/[0-9]/.test(password)) return 'Include at least one number'
  return null
}

export function ChangePasswordForm({
  accent,
  className,
  showHeader = true,
}: {
  accent: Extract<SharedInputAccent, 'user' | 'creator'>
  className?: string
  showHeader?: boolean
}) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logoutAll = useAuthStore((s) => s.logoutAll)
  const hasPassword = user?.hasPassword !== false

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const forgotHref =
    accent === 'creator' ? '/forgot-password?role=creator' : '/forgot-password?role=user'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    const strengthError = newPasswordError(newPassword)
    if (strengthError) {
      setError(strengthError)
      return
    }

    setSaving(true)
    try {
      await api('/auth/me/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      logoutAll()
      router.replace(accent === 'creator' ? '/login?role=creator' : '/login?role=user')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password')
      setSaving(false)
    }
  }

  if (!hasPassword) {
    return (
      <div className={cn('space-y-3', className)}>
        {showHeader ? (
          <div>
            <h2 className="text-[16px] font-bold text-white">Password</h2>
            <p className="mt-1 text-[13px] text-white/40">
              You signed in with Google and do not have a password yet.
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-white/40">
            You signed in with Google and do not have a password yet.
          </p>
        )}
        <Link
          href={forgotHref}
          className={cn(
            'flex h-12 w-full items-center justify-center rounded-full',
            'border border-white/15 bg-white/[0.06] text-[15px] font-semibold text-white',
            'transition hover:bg-white/[0.1]'
          )}
        >
          Set a password
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-5', className)}>
      {showHeader ? (
        <div>
          <h2 className="text-[16px] font-bold text-white">Password</h2>
          <p className="mt-1 text-[13px] text-white/40">
            Use at least 8 characters with a letter and a number. Changing your
            password signs you out everywhere.
          </p>
        </div>
      ) : null}

      <SharedInput
        label="Current password"
        accent={accent}
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        autoComplete="current-password"
        required
      />
      <SharedInput
        label="New password"
        accent={accent}
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        autoComplete="new-password"
        required
      />
      <SharedInput
        label="Confirm new password"
        accent={accent}
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
        required
      />

      {error ? (
        <p className="rounded-2xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className={cn(
          'flex h-12 w-full items-center justify-center rounded-full',
          'border border-white/15 bg-white/[0.06] text-[15px] font-semibold text-white',
          'transition hover:bg-white/[0.1] disabled:opacity-50'
        )}
      >
        {saving ? 'Updating…' : 'Update password'}
      </button>
    </form>
  )
}
