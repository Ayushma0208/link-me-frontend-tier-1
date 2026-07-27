'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Check, LogOut, Plus, Users } from 'lucide-react'

import {
  canAddAccount,
  listSavedAccounts,
  type SavedAccount,
} from '@/lib/accounts'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

type AccountSwitcherProps = {
  className?: string
  loginRole?: 'user' | 'creator'
}

export function AccountSwitcher({
  className,
  loginRole = 'user',
}: AccountSwitcherProps) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const switchAccount = useAuthStore((s) => s.switchAccount)
  const logoutAll = useAuthStore((s) => s.logoutAll)
  const signOutCurrent = useAuthStore((s) => s.signOutCurrent)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const accounts = useMemo(() => listSavedAccounts(), [user, open])

  async function onSwitch(account: SavedAccount) {
    if (account.userId === user?.id) {
      setOpen(false)
      return
    }
    setBusy(true)
    setError('')
    try {
      await switchAccount(account.userId)
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not switch account')
    } finally {
      setBusy(false)
    }
  }

  function onAdd() {
    setOpen(false)
    router.push(`/login?role=${loginRole}&addAccount=1`)
  }

  async function onLogout() {
    setOpen(false)
    const promoted = await signOutCurrent()
    if (!promoted) router.replace(`/login?role=${loginRole}`)
    else router.refresh()
  }

  function onLogoutAll() {
    logoutAll()
    setOpen(false)
    router.replace(`/login?role=${loginRole}`)
  }

  if (!user) return null

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-[13px] text-white/80 transition hover:bg-white/[0.07]"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Users className="size-4 text-white/50" />
        <span className="max-w-[9rem] truncate font-medium">
          @{user.username}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[280px] rounded-2xl border border-white/12 bg-[#12121a] p-2 shadow-2xl">
          <p className="px-2 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
            Accounts
          </p>
          <ul className="max-h-64 space-y-0.5 overflow-y-auto">
            {accounts.map((account) => {
              const active = account.userId === user.id
              return (
                <li key={account.userId}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onSwitch(account)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition',
                      active ? 'bg-white/10' : 'hover:bg-white/[0.06]'
                    )}
                  >
                    <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
                      {account.avatar ? (
                        <Image
                          src={account.avatar}
                          alt=""
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center text-xs font-bold text-white/70">
                          {(account.name || account.username).slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-white">
                        {account.name}
                      </span>
                      <span className="block truncate text-[11px] text-white/45">
                        @{account.username}
                      </span>
                    </span>
                    {active ? <Check className="size-4 text-emerald-300" /> : null}
                  </button>
                </li>
              )
            })}
          </ul>

          {error ? (
            <p className="px-2 py-1 text-[12px] text-red-300/90">{error}</p>
          ) : null}

          <div className="mt-1 space-y-0.5 border-t border-white/8 pt-1">
            {canAddAccount() ? (
              <button
                type="button"
                onClick={onAdd}
                className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-[13px] text-white/80 hover:bg-white/[0.06]"
              >
                <Plus className="size-4" />
                Add account
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void onLogout()}
              className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-[13px] text-white/80 hover:bg-white/[0.06]"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
            {accounts.length > 1 ? (
              <button
                type="button"
                onClick={onLogoutAll}
                className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-[13px] text-red-300/80 hover:bg-white/[0.06]"
              >
                Sign out all
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
