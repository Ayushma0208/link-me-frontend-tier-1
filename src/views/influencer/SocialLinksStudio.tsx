'use client'

import { useMemo, useState, type ComponentType } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import {
  FaInstagram,
  FaLinkedin,
  FaSnapchat,
  FaTiktok,
  FaTwitch,
  FaYoutube,
} from 'react-icons/fa6'
import { FaFacebook, FaGlobe, FaXTwitter } from 'react-icons/fa6'
import { ExternalLink, Loader2, Plus, Trash2 } from 'lucide-react'

import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import { api, ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

type SocialPlatform =
  | 'INSTAGRAM'
  | 'YOUTUBE'
  | 'TIKTOK'
  | 'X'
  | 'FACEBOOK'
  | 'LINKEDIN'
  | 'TWITCH'
  | 'SNAPCHAT'
  | 'WEBSITE'
  | 'OTHER'

type SocialLink = {
  id: string
  platform: SocialPlatform
  label: string | null
  url: string
  sortOrder: number
  isVisible: boolean
}

const PLATFORMS: SocialPlatform[] = [
  'INSTAGRAM',
  'TIKTOK',
  'YOUTUBE',
  'X',
  'TWITCH',
  'FACEBOOK',
  'LINKEDIN',
  'SNAPCHAT',
  'WEBSITE',
  'OTHER',
]

const PLATFORM_ICON: Record<string, ComponentType<{ className?: string }>> = {
  INSTAGRAM: FaInstagram,
  TIKTOK: FaTiktok,
  YOUTUBE: FaYoutube,
  X: FaXTwitter,
  TWITCH: FaTwitch,
  FACEBOOK: FaFacebook,
  LINKEDIN: FaLinkedin,
  SNAPCHAT: FaSnapchat,
  WEBSITE: FaGlobe,
  OTHER: ExternalLink,
}

function platformLabel(platform: string) {
  if (platform === 'X') return 'X (Twitter)'
  return platform.charAt(0) + platform.slice(1).toLowerCase()
}

function unwrapLinks(
  response: SocialLink[] | { items?: SocialLink[]; links?: SocialLink[] }
) {
  if (Array.isArray(response)) return response
  return response.items ?? response.links ?? []
}

export function SocialLinksStudio() {
  const prefersReducedMotion = useReducedMotion()
  const queryClient = useQueryClient()
  const [platform, setPlatform] = useState<SocialPlatform>('INSTAGRAM')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const linksQuery = useQuery({
    queryKey: ['creator-social-links'],
    queryFn: async () =>
      unwrapLinks(
        await api<SocialLink[] | { items?: SocialLink[] }>(
          '/creators/me/social-links'
        )
      ),
  })

  const links = useMemo(() => linksQuery.data ?? [], [linksQuery.data])

  const createLink = useMutation({
    mutationFn: () =>
      api('/creators/me/social-links', {
        method: 'POST',
        body: JSON.stringify({ platform, url: url.trim() }),
      }),
    onSuccess: () => {
      setUrl('')
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['creator-social-links'] })
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Could not add link')
    },
  })

  const updateLink = useMutation({
    mutationFn: (payload: { id: string; url: string }) =>
      api(`/creators/me/social-links/${payload.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ url: payload.url }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['creator-social-links'] })
    },
  })

  const deleteLink = useMutation({
    mutationFn: (id: string) =>
      api(`/creators/me/social-links/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['creator-social-links'] })
    },
  })

  return (
    <div>
      <StudioPageHeader
        title="Social Links"
        description="Connect Instagram, TikTok, YouTube and more — shown on your public page."
      />

      <StudioGlassCard className="mb-6 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[180px_1fr_auto]">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-[13px] text-white outline-none"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p} className="bg-[#111]">
                {platformLabel(p)}
              </option>
            ))}
          </select>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 text-[13px] text-white outline-none focus:border-fuchsia-400/35"
          />
          <button
            type="button"
            disabled={!url.trim() || createLink.isPending}
            onClick={() => createLink.mutate()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-fuchsia-500 px-4 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {createLink.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Add link
          </button>
        </div>
        {error ? <p className="mt-3 text-xs text-red-300">{error}</p> : null}
      </StudioGlassCard>

      {linksQuery.isLoading ? (
        <p className="text-sm text-white/45">Loading links…</p>
      ) : links.length === 0 ? (
        <StudioGlassCard className="p-8 text-center text-sm text-white/45">
          No social links yet. Add your first profile URL above.
        </StudioGlassCard>
      ) : (
        <div className="grid gap-4">
          {links.map((link, index) => {
            const Icon = PLATFORM_ICON[link.platform] ?? ExternalLink
            return (
              <motion.div
                key={link.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <StudioGlassCard className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-[13px] font-semibold text-white">
                        {platformLabel(link.platform)}
                      </p>
                      <input
                        defaultValue={link.url}
                        onBlur={(e) => {
                          const next = e.target.value.trim()
                          if (next && next !== link.url) {
                            updateLink.mutate({ id: link.id, url: next })
                          }
                        }}
                        className={cn(
                          'h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5',
                          'text-[13px] text-white outline-none focus:border-fuchsia-400/35'
                        )}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteLink.mutate(link.id)}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 px-3 text-xs text-white/60 hover:text-red-300"
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </button>
                  </div>
                </StudioGlassCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
