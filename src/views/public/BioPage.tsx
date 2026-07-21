'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BadgeCheck,
  Music,
  Video,
  Share2,
  Coffee,
  MessageCircle,
  Phone,
  Link2,
} from 'lucide-react'
import type { CreatorProfileDto } from '@link-me/shared'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { MaskedVideo } from '@/components/video-masking'
import { formatCurrency, formatFollowers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/Badge'
import { PostGrid } from '@/components/content/PostGrid'
import { StoryViewer } from '@/components/content/StoryViewer'

const CallRoom = dynamic(
  () => import('@/components/calls/CallRoom').then((m) => m.CallRoom),
  { ssr: false }
)

const RESERVED = new Set(['login', 'register', 'admin', 'influencer', 'user', 'api'])

const socialIcons: Record<string, typeof Share2> = {
  instagram: Share2,
  youtube: Video,
  twitter: Share2,
  spotify: Music,
  'apple-music': Music,
  tidal: Music,
  default: Link2,
}

export function BioPage() {
  const params = useParams()
  const username = params.username as string | undefined
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [storyIndex, setStoryIndex] = useState<number | null>(null)
  const [callId, setCallId] = useState<string | null>(null)
  const [coffeeQty, setCoffeeQty] = useState(1)
  const [showCoffee, setShowCoffee] = useState(false)
  const isReserved = !username || RESERVED.has(username)

  useEffect(() => {
    if (username && RESERVED.has(username)) {
      router.replace('/')
    }
  }, [username, router])

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['creator', username, user?.id],
    queryFn: () =>
      api<CreatorProfileDto>(
        `/creators/${username}${user ? `?viewerId=${user.id}` : ''}`,
      ),
    enabled: !isReserved,
  })

  const subscribePlan = useMutation({
    mutationFn: (planId: string) =>
      api('/subscriptions/plan', { method: 'POST', body: JSON.stringify({ planId }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['creator', username] }),
  })

  const subscribePost = useMutation({
    mutationFn: (postId: string) =>
      api('/subscriptions/post', { method: 'POST', body: JSON.stringify({ postId }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['creator', username] }),
  })

  const startChat = useMutation({
    mutationFn: () =>
      api('/chat/conversations', {
        method: 'POST',
        body: JSON.stringify({ creatorId: profile!.id }),
      }),
    onSuccess: () => {
      window.location.href = '/user/messages'
    },
  })

  const requestCall = useMutation({
    mutationFn: () =>
      api<{ id: string }>('/calls/request', {
        method: 'POST',
        body: JSON.stringify({ creatorId: profile!.id }),
      }),
    onSuccess: (data) => setCallId(data.id),
  })

  const sendCoffee = useMutation({
    mutationFn: () =>
      api('/tips/coffee', {
        method: 'POST',
        body: JSON.stringify({
          creatorId: profile!.id,
          quantity: coffeeQty,
          useWallet: true,
        }),
      }),
    onSuccess: () => {
      setShowCoffee(false)
      useAuthStore.getState().fetchMe()
    },
  })

  if (isReserved) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading profile...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Creator not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface via-surface-raised to-surface">
      {storyIndex !== null && (
        <StoryViewer
          stories={profile.stories}
          initialIndex={storyIndex}
          onClose={() => setStoryIndex(null)}
          viewerId={user?.id}
        />
      )}
      {callId ? (
        <CallRoom
          callId={callId}
          role="caller"
          onEnd={() => setCallId(null)}
        />
      ) : null}

      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-8 flex justify-center">
          <MaskedVideo
            style={profile.videoMaskStyle}
            text={profile.name.split(' ')[0].toUpperCase()}
            className="max-w-[280px]"
          />
        </div>

        <div className="mb-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            {profile.verified && (
              <BadgeCheck className="h-6 w-6 fill-brand-500 text-white" />
            )}
          </div>
          <p className="text-muted">@{profile.username}</p>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/80">
            {profile.bio}
          </p>
          <p className="mt-4 text-sm font-semibold text-brand-400">
            {formatFollowers(profile.followers)} Total Followers
          </p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {profile.socialLinks.map((link) => {
            const Icon = socialIcons[link.icon] ?? socialIcons.default
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-overlay transition-colors hover:border-brand-500/50"
                title={link.platform}
              >
                <Icon className="h-4 w-4" />
              </a>
            )
          })}
        </div>

        {profile.stories.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
              Stories
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {profile.stories.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStoryIndex(i)}
                  className="flex shrink-0 flex-col items-center gap-2"
                >
                  <div className="h-16 w-16 rounded-full border-2 border-brand-500 bg-gradient-to-br from-brand-600/30 to-purple-600/30 p-0.5">
                    <div className="h-full w-full rounded-full bg-surface-overlay" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {profile.highlights.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
              Highlights
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {profile.highlights.map((h) => (
                <div key={h.id} className="flex shrink-0 flex-col items-center gap-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-500 bg-surface-overlay">
                    <span className="text-xs font-medium">{h.title[0]}</span>
                  </div>
                  <span className="text-xs text-muted">{h.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 space-y-3">
          <ActionButton
            icon={MessageCircle}
            label="Chat"
            badge={formatCurrency(profile.chatPricePerMessage) + '/msg'}
            onClick={() => user ? startChat.mutate() : (window.location.href = '/login')}
          />
          <ActionButton
            icon={Phone}
            label="Video Call"
            badge={formatCurrency(profile.callPricePerMinute) + '/min'}
            onClick={() => user ? requestCall.mutate() : (window.location.href = '/login')}
          />
          <ActionButton
            icon={Coffee}
            label="Buy Me a Coffee"
            badge={formatCurrency(profile.coffeeUnitPrice) + '/each'}
            onClick={() => setShowCoffee(true)}
          />
        </div>

        {showCoffee && (
          <div className="mb-8 rounded-2xl border border-border bg-surface-overlay p-4">
            <p className="mb-3 font-medium">How many coffees?</p>
            <div className="mb-3 flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={100}
                value={coffeeQty}
                onChange={(e) => setCoffeeQty(Number(e.target.value))}
                className="w-20 rounded-xl border border-border bg-surface px-3 py-2"
              />
              <span className="text-muted">
                = {formatCurrency(profile.coffeeUnitPrice * coffeeQty)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => user ? sendCoffee.mutate() : (window.location.href = '/login')}
              >
                Send Tip
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowCoffee(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Posts
          </h2>
          <PostGrid
            posts={profile.posts}
            viewerId={user?.id}
            onUnlock={(postId) =>
              user ? subscribePost.mutate(postId) : (window.location.href = '/login')
            }
          />
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Subscription Plans
          </h2>
          <div className="space-y-3">
            {profile.subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl border border-border bg-surface-overlay p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted">
                      {formatCurrency(plan.price)}/{plan.duration}
                    </p>
                  </div>
                  <Badge variant="brand">{plan.type}</Badge>
                </div>
                <Button
                  className="mt-3 w-full"
                  size="sm"
                  onClick={() =>
                    user ? subscribePlan.mutate(plan.id) : (window.location.href = '/login')
                  }
                >
                  Subscribe
                </Button>
              </div>
            ))}
          </div>
        </div>

        <footer className="text-center text-xs text-muted">
          <p>Privacy Policy | Terms | Report</p>
          <p className="mt-2">Powered by LinkMe</p>
        </footer>
      </div>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  badge,
  onClick,
}: {
  icon: typeof MessageCircle
  label: string
  badge?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl border border-border bg-surface-overlay px-5 py-4 text-left transition-colors hover:border-brand-500/50 hover:bg-brand-600/5"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-brand-400" />
        <span className="font-medium">{label}</span>
      </div>
      {badge && <span className="text-xs text-muted">{badge}</span>}
    </button>
  )
}
