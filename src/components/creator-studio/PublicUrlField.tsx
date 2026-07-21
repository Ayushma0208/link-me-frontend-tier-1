'use client'

import { Check, Copy, Globe2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  PUBLIC_URL_HOST,
  publicProfileUrl,
  sanitizePublicUsername,
  validatePublicUsername,
} from '@/lib/profile-appearance'
import { cn } from '@/lib/utils'

interface PublicUrlFieldProps {
  value: string
  currentUsername?: string
  onChange: (value: string) => void
  className?: string
}

export function PublicUrlField({
  value,
  currentUsername,
  onChange,
  className,
}: PublicUrlFieldProps) {
  const [copied, setCopied] = useState(false)
  const validation = validatePublicUsername(value, currentUsername ?? value)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(`https://${publicProfileUrl(value)}`)
      setCopied(true)
    } catch {
      // ignore
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Globe2 className="size-4 text-fuchsia-300" />
        <h2 className="text-[15px] font-bold text-white">Public URL</h2>
      </div>
      <p className="text-[13px] text-white/45">
        Your page lives at a clean path — pick something memorable.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-2xl border border-white/12 bg-white/[0.05] focus-within:border-fuchsia-400/40">
          <span className="shrink-0 border-r border-white/10 bg-white/[0.04] px-3.5 text-[13px] font-medium text-white/40">
            {PUBLIC_URL_HOST}/
          </span>
          <input
            value={value}
            onChange={(e) => onChange(sanitizePublicUsername(e.target.value))}
            placeholder="richforever"
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-3.5 text-[15px] font-semibold tracking-tight text-white outline-none placeholder:text-white/25"
          />
        </div>
        <button
          type="button"
          onClick={copyUrl}
          disabled={!validation.ok}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-4 text-[13px] font-semibold text-white/70 transition-colors hover:text-white disabled:opacity-40"
        >
          {copied ? <Check className="size-4 text-emerald-300" /> : <Copy className="size-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span
          className={cn(
            'rounded-full border px-2.5 py-1 font-semibold',
            validation.ok
              ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-400/25 bg-rose-500/10 text-rose-200'
          )}
        >
          {validation.message}
        </span>
        <span className="text-white/35">
          Examples: richforever · kyliefit · johndoe
        </span>
      </div>
    </div>
  )
}
