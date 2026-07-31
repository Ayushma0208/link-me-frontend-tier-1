'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MonitorSmartphone } from 'lucide-react'

import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

type SessionRow = {
  sessionId: string
  deviceId: string | null
  platform: string
  lastActiveAt: string
  expiresAt: string
  ipAddress: string | null
  userAgent: string | null
  isCurrent: boolean
}

function browserLabel(userAgent: string | null, platform: string): string {
  if (!userAgent) return platform || 'Unknown device'
  const ua = userAgent
  const browser =
    /Edg\//.test(ua)
      ? 'Edge'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Browser'
  const os =
    /iPhone|iPad/.test(ua)
      ? 'iOS'
      : /Android/.test(ua)
        ? 'Android'
        : /Mac OS X/.test(ua)
          ? 'macOS'
          : /Windows/.test(ua)
            ? 'Windows'
            : /Linux/.test(ua)
              ? 'Linux'
              : platform
  return `${browser} on ${os}`
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ActiveSessionsPanel({
  className,
  loginHref = '/login',
}: {
  className?: string
  loginHref?: string
}) {
  const router = useRouter()
  const revokeAllDevices = useAuthStore((s) => s.revokeAllDevices)
  const logoutAll = useAuthStore((s) => s.logoutAll)
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [revokingAll, setRevokingAll] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await api<{ sessions: SessionRow[] }>('/auth/sessions')
      setSessions(data.sessions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load sessions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function revokeOne(session: SessionRow) {
    setBusyId(session.sessionId)
    setError('')
    try {
      await api(`/auth/sessions/${session.sessionId}`, { method: 'DELETE' })
      if (session.isCurrent) {
        logoutAll()
        router.replace(loginHref)
        return
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not revoke session')
    } finally {
      setBusyId(null)
    }
  }

  async function revokeAll() {
    setRevokingAll(true)
    setError('')
    try {
      await revokeAllDevices()
      router.replace(loginHref)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log out devices')
      setRevokingAll(false)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {loading ? (
        <div className="flex items-center gap-2 text-[13px] text-white/45">
          <Loader2 className="size-4 animate-spin" />
          Loading devices…
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-[13px] text-white/40">No active sessions.</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((session) => (
            <li
              key={session.sessionId}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3"
            >
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                <MonitorSmartphone className="size-4 text-white/55" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-[14px] font-medium text-white">
                    {browserLabel(session.userAgent, session.platform)}
                  </p>
                  {session.isCurrent ? (
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-200 uppercase">
                      This device
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[12px] text-white/40">
                  Last active {formatRelative(session.lastActiveAt)}
                  {session.ipAddress ? ` · ${session.ipAddress}` : ''}
                </p>
              </div>
              <button
                type="button"
                disabled={busyId === session.sessionId || revokingAll}
                onClick={() => void revokeOne(session)}
                className="shrink-0 text-[12px] font-medium text-red-300 hover:text-red-200 disabled:opacity-50"
              >
                {busyId === session.sessionId ? '…' : 'Revoke'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <p className="rounded-2xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={revokingAll || loading || sessions.length === 0}
        onClick={() => void revokeAll()}
        className={cn(
          'flex h-11 w-full items-center justify-center rounded-full',
          'border border-red-400/25 bg-red-500/10 text-[14px] font-semibold text-red-200',
          'transition hover:bg-red-500/15 disabled:opacity-50'
        )}
      >
        {revokingAll ? 'Logging out…' : 'Log out all devices'}
      </button>
    </div>
  )
}
