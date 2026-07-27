'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

function RecoveryAcceptInner() {
  const router = useRouter()
  const params = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const offerId = params.get('offerId')
  const subscriptionId = params.get('subscriptionId')

  const [status, setStatus] = useState<'idle' | 'working' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (loading) return
    if (!user) {
      const q = new URLSearchParams()
      if (offerId) q.set('offerId', offerId)
      if (subscriptionId) q.set('subscriptionId', subscriptionId)
      router.replace(`/login?next=${encodeURIComponent(`/recovery/accept?${q}`)}`)
      return
    }

    if (!offerId && !subscriptionId) {
      setStatus('error')
      setMessage('Missing offer link.')
      return
    }

    let cancelled = false
    async function run() {
      setStatus('working')
      try {
        if (offerId) {
          await api(`/subscriptions/me/recovery-offers/${offerId}/accept`, {
            method: 'POST',
          })
        } else {
          const offers = await api<
            Array<{ id: string; subscriptionId: string; status: string }>
          >('/subscriptions/me/recovery-offers')
          const match = (offers ?? []).find(
            (o) => o.subscriptionId === subscriptionId
          )
          if (!match) throw new Error('Offer not found or already used')
          await api(`/subscriptions/me/recovery-offers/${match.id}/accept`, {
            method: 'POST',
          })
        }
        if (!cancelled) {
          setStatus('ok')
          setMessage('Offer accepted. Your next renew gets the discount.')
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setMessage(
            err instanceof ApiError || err instanceof Error
              ? err.message
              : 'Could not accept offer'
          )
        }
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [loading, user, offerId, subscriptionId, router])

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center px-4 py-12">
      <div className="w-full rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">
          Recovery
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Come-back offer</h1>
        <p className="mt-3 text-[14px] text-white/55">
          {status === 'working' || status === 'idle'
            ? 'Applying your discount…'
            : message}
        </p>
        {status === 'ok' || status === 'error' ? (
          <Link
            href="/user/subscriptions"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-semibold text-black"
          >
            View subscriptions
          </Link>
        ) : null}
      </div>
    </main>
  )
}

export default function RecoveryAcceptPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center text-white/50">
          Loading…
        </main>
      }
    >
      <RecoveryAcceptInner />
    </Suspense>
  )
}
