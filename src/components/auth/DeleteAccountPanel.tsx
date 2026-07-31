'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { SharedInput, type SharedInputAccent } from '@/components/auth/SharedInput'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

export function DeleteAccountPanel({
  accent,
  className,
}: {
  accent: Extract<SharedInputAccent, 'user' | 'creator'>
  className?: string
}) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logoutAll = useAuthStore((s) => s.logoutAll)
  const hasPassword = user?.hasPassword !== false

  const [confirm, setConfirm] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (confirm !== 'DELETE') {
      setError('Type DELETE to confirm')
      return
    }
    setLoading(true)
    try {
      await api('/auth/me/deactivate', {
        method: 'POST',
        body: JSON.stringify({
          confirm: 'DELETE',
          ...(hasPassword ? { currentPassword } : {}),
        }),
      })
      logoutAll()
      router.replace(accent === 'creator' ? '/login?role=creator' : '/login?role=user')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete account')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-5', className)}>
      <p className="text-[13px] leading-relaxed text-white/45">
        This deactivates your account and signs you out on every device. Type{' '}
        <span className="font-semibold text-white">DELETE</span> to confirm.
      </p>

      <SharedInput
        label='Type "DELETE"'
        accent={accent}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="off"
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

      <button
        type="submit"
        disabled={loading || confirm !== 'DELETE'}
        className={cn(
          'flex h-12 w-full items-center justify-center rounded-full',
          'border border-red-400/30 bg-red-500/15 text-[15px] font-semibold text-red-100',
          'transition hover:bg-red-500/25 disabled:opacity-50'
        )}
      >
        {loading ? 'Deleting…' : 'Delete account'}
      </button>
    </form>
  )
}
