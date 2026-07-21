'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

import { AboutSection } from '@/components/creator-profile/AboutSection'
import { CollabModal } from '@/components/creator-profile/CollabModal'
import {
  CreatorHeader,
  type ProfileViewerMode,
} from '@/components/creator-profile/CreatorHeader'
import {
  CreatorActionPaySheet,
  type CreatorPayAction,
} from '@/components/creator-profile/CreatorActionPaySheet'
import { EventsSection } from '@/components/creator-profile/EventsSection'
import { CalComBookingCard } from '@/components/creator-profile/CalComBookingCard'
import { ChatPlanPicker } from '@/components/chat/ChatPlanPicker'
import type { ChatPlan, ChatSession } from '@/lib/chat-plans'

const CallRoom = dynamic(
  () => import('@/components/calls/CallRoom').then((m) => m.CallRoom),
  { ssr: false }
)
import { GuestUnlockPrompt } from '@/components/creator-profile/GuestUnlockPrompt'
import { MediaGallery } from '@/components/creator-profile/MediaGallery'
import { PostsGrid } from '@/components/creator-profile/PostsGrid'
import { ProfileChatPanel } from '@/components/creator-profile/ProfileChatPanel'
import { StoreSection } from '@/components/creator-profile/StoreSection'
import { CaseStudiesSection } from '@/components/creator-profile/CaseStudiesSection'
import { StoryHighlights } from '@/components/creator-profile/StoryHighlights'
import { SubscriptionModal } from '@/components/creator-profile/SubscriptionModal'
import { StoryViewer } from '@/components/dashboard/StoryViewer'
import { Logo } from '@/components/layout/Logo'
import {
  buildCustomPublicCreator,
  getPublicCreator,
  PUBLIC_PROFILE_RESERVED,
  type PublicHighlight,
  type PublicPost,
  type PublicCreator,
  type PublicEvent,
} from '@/data/public-creator'
import type { StoryCreator } from '@/data/stories'
import { api } from '@/lib/api'
import { listCreatorPosts, type CreatorPostApi } from '@/lib/public-creators'
import {
  fetchMembershipForCreator,
  fetchWalletAvailableBalance,
  topUpWallet,
} from '@/lib/razorpay-checkout'
import {
  defaultAppearance,
  fontFamilyFor,
  themeSurface,
  withAlpha,
  type ProfileAppearance,
} from '@/lib/profile-appearance'
import { useAuthStore } from '@/stores/auth'
import { useCreatorPageStore } from '@/stores/creator-page'
import { useFollowStore } from '@/stores/follows'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'posts', label: 'Posts' },
  { id: 'media', label: 'Media' },
  { id: 'store', label: 'Store' },
  { id: 'cases', label: 'Case Studies' },
  { id: 'about', label: 'About' },
] as const

type TabId = (typeof TABS)[number]['id']

function mapApiPostToPublic(post: CreatorPostApi): PublicPost {
  const media = post.media[0]
  const fallback = 'https://picsum.photos/id/1015/600/750'
  // Locked exclusive media never returns a clear URL — use blur preview only.
  const preview =
    media?.url ||
    media?.blurredKey ||
    media?.thumbnailKey ||
    fallback
  return {
    id: post.id,
    title: post.title || 'Post',
    caption: post.caption || '',
    mediaUrl: preview,
    thumbnailUrl: preview,
    type:
      post.type === 'VIDEO' || post.type === 'REEL' ? 'video' : 'image',
    locked: post.locked,
    unlockReason: post.unlockReason,
    price: post.price ? Number(post.price) : 0,
    likes: post.likeCount,
  }
}

function resolveViewerMode(
  username: string,
  user: { username: string; role: string } | null,
  subscribed: boolean
): ProfileViewerMode {
  if (!user) return 'guest'
  const handle = username.toLowerCase()
  const authHandle = user.username.replace(/^@/, '').toLowerCase()
  if (
    (user.role === 'creator' || user.role === 'admin') &&
    authHandle === handle
  ) {
    return 'owner'
  }
  if (subscribed) return 'subscriber'
  return 'fan'
}

export function PublicCreatorProfile() {
  const params = useParams<{ username: string }>()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const authLoading = useAuthStore((s) => s.loading)

  const raw = String(params.username ?? '')
  const username = decodeURIComponent(raw).replace(/^@/, '')

  const catalogCreator = useMemo(() => getPublicCreator(username), [username])
  const isReserved = PUBLIC_PROFILE_RESERVED.has(username.toLowerCase())

  const [apiCreator, setApiCreator] = useState<PublicCreator | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const savedAppearance = useCreatorPageStore((s) => s.appearance)

  useEffect(() => {
    let cancelled = false
    setProfileLoading(true)
    ;(async () => {
      try {
        const data = await api<{
          profile: {
            id: string
            bio: string
            category: string | null
            location: string | null
            coverImageUrl: string | null
            bookingUrl: string | null
            followerCount: number
            subscriberCount: number
            postCount: number
            user: {
              id: string
              username: string
              displayName: string
              avatarUrl: string | null
              isVerified: boolean
            }
            pricing: {
              imagePrice: string | null
              chatPricePerMessage: string | null
              voiceCallPrice: string | null
              videoCallPrice: string | null
              chatPlans?: ChatPlan[]
            }
            coffee: { enabled: boolean }
            plans: Array<{
              id: string
              price: string
              isActive: boolean
              isFeatured: boolean
            }>
          }
        }>(`/creators/${encodeURIComponent(username.toLowerCase())}`)
        if (cancelled) return
        const p = data.profile
        const plan =
          p.plans.find((x) => x.isFeatured && x.isActive) ||
          p.plans.find((x) => x.isActive)
        const mapped = buildCustomPublicCreator(p.user.username, {
          name: p.user.displayName,
          avatar: p.user.avatarUrl || undefined,
          bio: p.bio,
          coverImage: p.coverImageUrl || undefined,
          location: p.location || '',
          category: p.category || 'Creator',
        })
        const apiPosts = await listCreatorPosts(p.user.username)
        let liveStories: PublicCreator['stories'] = []
        let liveHighlights: PublicHighlight[] = []
        let liveEvents: PublicEvent[] = []
        try {
          const storyRes = await api<{
            items: Array<{
              id: string
              mediaType: string
              mediaUrl: string | null
              thumbnailUrl?: string | null
            }>
          }>(`/creators/${encodeURIComponent(p.user.username)}/stories`)
          liveStories = (storyRes.items ?? [])
            .map((s) => {
              const url = s.mediaUrl || s.thumbnailUrl
              if (!url) return null
              return {
                id: s.id,
                mediaUrl: url,
                type:
                  s.mediaType === 'VIDEO' || s.mediaType === 'video'
                    ? ('video' as const)
                    : ('image' as const),
                durationMs:
                  s.mediaType === 'VIDEO' || s.mediaType === 'video'
                    ? 8000
                    : 5000,
              }
            })
            .filter(Boolean) as PublicCreator['stories']
        } catch {
          liveStories = []
        }
        try {
          const highlightRes = await api<{
            items: Array<{
              id: string
              title: string
              coverUrl: string | null
              stories: Array<{
                id: string
                mediaType: string
                mediaUrl: string | null
                thumbnailUrl?: string | null
              }>
            }>
          }>(`/creators/${encodeURIComponent(p.user.username)}/highlights`)
          liveHighlights = (highlightRes.items ?? [])
            .map((h) => {
              const slides = (h.stories ?? [])
                .map((s) => {
                  const url = s.mediaUrl || s.thumbnailUrl
                  if (!url) return null
                  return {
                    id: s.id,
                    mediaUrl: url,
                    type:
                      s.mediaType === 'VIDEO' || s.mediaType === 'video'
                        ? ('video' as const)
                        : ('image' as const),
                    durationMs:
                      s.mediaType === 'VIDEO' || s.mediaType === 'video'
                        ? 8000
                        : 5000,
                  }
                })
                .filter(Boolean) as PublicHighlight['stories']
              if (!slides.length) return null
              return {
                id: h.id,
                title: h.title,
                coverUrl: h.coverUrl || slides[0]!.mediaUrl,
                stories: slides,
                premium: false,
              }
            })
            .filter(Boolean) as PublicHighlight[]
        } catch {
          liveHighlights = []
        }
        try {
          const eventRes = await api<{
            items: Array<{
              id: string
              title: string
              location: string
              startsAt: string
              ticketUrl?: string
              kind?: 'TICKET' | 'LIVE'
              liveId?: string
              liveStatus?: 'SCHEDULED' | 'LIVE' | 'ENDED'
              accessType?: 'FREE' | 'PAID'
              price?: number | null
            }>
          }>(`/creators/${encodeURIComponent(p.user.username)}/events`)
          liveEvents = (eventRes.items ?? []).map((e) => ({
            id: e.id,
            title: e.title,
            location: e.location,
            startsAt: e.startsAt,
            ticketUrl: e.ticketUrl,
            kind: e.kind ?? 'TICKET',
            liveId: e.liveId,
            liveStatus: e.liveStatus,
            accessType: e.accessType,
            price: e.price,
          }))
        } catch {
          liveEvents = []
        }
        if (cancelled) return
        setApiCreator({
          ...mapped,
          id: p.user.id,
          creatorProfileId: p.id,
          planId: plan?.id ?? null,
          verified: p.user.isVerified,
          bookingUrl: p.bookingUrl || null,
          stats: {
            followers: p.followerCount,
            following: 0,
            subscribers: p.subscriberCount,
            posts: p.postCount ?? apiPosts.length,
          },
          monthlyPrice: plan ? Number(plan.price) || 299 : 299,
          postPrice: p.pricing?.imagePrice
            ? Number(p.pricing.imagePrice) || 49
            : 49,
          chatPrice: p.pricing?.chatPricePerMessage
            ? Number(p.pricing.chatPricePerMessage) || 49
            : 49,
          voiceCallPrice: p.pricing?.voiceCallPrice
            ? Number(p.pricing.voiceCallPrice) || 99
            : 99,
          videoCallPrice: p.pricing?.videoCallPrice
            ? Number(p.pricing.videoCallPrice) || 149
            : 149,
          stories: liveStories,
          highlights: liveHighlights,
          events: liveEvents,
          posts: apiPosts.map(mapApiPostToPublic),
        })
        const plans = (p.pricing?.chatPlans ?? []).filter((x) => x.isActive)
        setChatPlans(plans)
        setSelectedPlanId(plans[0]?.id ?? null)
      } catch (err) {
        console.error('Failed to load creator profile', err)
        if (!cancelled) setApiCreator(null)
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [username])

  const ownsPage = useMemo(() => {
    if (!user) return false
    const handle = username.toLowerCase()
    const authHandle = (user.username || '').replace(/^@/, '').toLowerCase()
    // Only the signed-in creator who owns this handle — not localStorage "claimed" URLs
    // from the studio (those must not treat admin AI creators as your page).
    return (
      (user.role === 'creator' || user.role === 'admin') &&
      Boolean(authHandle) &&
      authHandle === handle
    )
  }, [user, username])

  const creator = useMemo(() => {
    if (apiCreator) {
      if (ownsPage) {
        return {
          ...apiCreator,
          name: user?.name || apiCreator.name,
          avatar: user?.avatar || apiCreator.avatar,
          coverImage: savedAppearance.coverImage || apiCreator.coverImage,
        }
      }
      return apiCreator
    }
    if (ownsPage) {
      return buildCustomPublicCreator(username.toLowerCase(), {
        name: user?.name || undefined,
        avatar: user?.avatar || undefined,
        coverImage: savedAppearance.coverImage,
      })
    }
    // Demo catalog only when no API profile exists
    return catalogCreator
  }, [
    apiCreator,
    catalogCreator,
    ownsPage,
    savedAppearance.coverImage,
    user?.avatar,
    user?.name,
    username,
  ])

  const [tab, setTab] = useState<TabId>('posts')
  const following = useFollowStore((s) =>
    creator
      ? Boolean(s.byHandle[creator.handle.replace(/^@/, '').toLowerCase()])
      : false
  )
  const toggleFollow = useFollowStore((s) => s.toggle)
  const [subscribed, setSubscribed] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [activePost, setActivePost] = useState<PublicPost | null>(null)
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])
  const [storyOpen, setStoryOpen] = useState(false)
  const [storySeen, setStorySeen] = useState(false)
  const [highlightViewer, setHighlightViewer] = useState<StoryCreator[] | null>(
    null
  )
  const [payAction, setPayAction] = useState<CreatorPayAction | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatConversationId, setChatConversationId] = useState<string | null>(
    null
  )
  const [chatPlans, setChatPlans] = useState<ChatPlan[]>([])
  const [planPickerOpen, setPlanPickerOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const [planBusy, setPlanBusy] = useState(false)
  const [planError, setPlanError] = useState<string | null>(null)
  const [activeCallId, setActiveCallId] = useState<string | null>(null)
  const [collabOpen, setCollabOpen] = useState(false)
  const callStartLockRef = useRef(false)

  const mode = resolveViewerMode(username, user, subscribed)
  const contentUnlocked = mode === 'owner' || mode === 'subscriber'
  const premiumStories = contentUnlocked

  const appearance: ProfileAppearance = useMemo(() => {
    if (ownsPage) return savedAppearance
    return {
      ...defaultAppearance,
      coverImage: creator?.coverImage ?? defaultAppearance.coverImage,
    }
  }, [creator?.coverImage, ownsPage, savedAppearance])

  const surface = themeSurface(appearance.theme)
  const isLight = appearance.theme === 'light'

  const storyCreators: StoryCreator[] = useMemo(() => {
    if (!creator?.stories.length) return []
    return [
      {
        id: creator.id,
        name: creator.name,
        handle: creator.handle,
        avatar: creator.avatar,
        verified: creator.verified,
        seen: storySeen,
        stories: creator.stories,
      },
    ]
  }, [creator, storySeen])

  useEffect(() => {
    if (isReserved) router.replace('/')
  }, [isReserved, router])

  useEffect(() => {
    if (mode === 'owner') setSubscribed(true)
  }, [mode])

  useEffect(() => {
    let cancelled = false
    if (!user || !apiCreator?.creatorProfileId) return
    ;(async () => {
      const entitled = await fetchMembershipForCreator({
        creatorProfileId: apiCreator.creatorProfileId,
        planId: apiCreator.planId,
      })
      if (cancelled || !entitled) return
      setSubscribed(true)
      // Refetch posts so member media URLs unlock after entitlement is known.
      try {
        const apiPosts = await listCreatorPosts(username)
        if (cancelled) return
        setApiCreator((prev) =>
          prev
            ? { ...prev, posts: apiPosts.map(mapApiPostToPublic) }
            : prev
        )
      } catch {
        // keep existing posts
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, apiCreator?.creatorProfileId, apiCreator?.planId, username])

  if (isReserved) return null

  if (profileLoading && !creator) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-black text-white/50">
        Loading profile…
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-black px-6 text-center text-white">
        <Logo markSize="lg" />
        <h1 className="mt-8 text-2xl font-bold">Creator not found</h1>
        <p className="mt-2 max-w-sm text-white/45">
          No public profile exists for @{username}.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
        >
          Back home
        </Link>
      </div>
    )
  }

  const profile = creator

  const posts = profile.posts.map((post) => {
    if (unlockedIds.includes(post.id)) {
      return { ...post, locked: false }
    }
    const isPpv =
      post.unlockReason === 'ppv' ||
      (Boolean(post.price) &&
        post.price > 0 &&
        post.unlockReason !== 'subscription' &&
        post.unlockReason !== 'free' &&
        post.unlockReason !== 'public')
    // Trust API lock for PPV. Member posts: unlock for subscribers only when media exists.
    if (isPpv) return post
    if (contentUnlocked && post.locked && post.mediaUrl) {
      return { ...post, locked: false }
    }
    if (contentUnlocked && !post.locked) {
      return post
    }
    return post
  })

  function openUnlockFlow(post?: PublicPost | null) {
    if (mode === 'guest') {
      const from = encodeURIComponent(`/@${profile.handle}`)
      router.push(`/signup?role=user&from=${from}`)
      return
    }
    if (mode === 'owner') return
    // Subscribe CTA without a post → attach first locked post so “see only this post” shows.
    const fallbackLocked =
      post ??
      posts.find((p) => p.locked) ??
      profile.posts.find(
        (p) =>
          p.unlockReason === 'ppv' ||
          p.unlockReason === 'subscription' ||
          (Boolean(p.price) && p.price > 0)
      ) ??
      null
    setActivePost(fallbackLocked)
    setModalOpen(true)
  }

  function openCoffee() {
    router.push(`/${profile.handle}/coffee`)
  }

  const chatPrice = creator.chatPrice ?? 49
  const voiceCallPrice = creator.voiceCallPrice ?? 99
  const videoCallPrice = creator.videoCallPrice ?? 149
  const voiceCallMinimumBalance = voiceCallPrice * 2
  const videoCallMinimumBalance = videoCallPrice * 2

  async function loadChatPlans() {
    const res = await api<{ plans: ChatPlan[] }>(`/chat/plans/${profile.id}`)
    const plans = (res.plans ?? []).filter((p) => p.isActive)
    setChatPlans(plans)
    if (!selectedPlanId || !plans.some((p) => p.id === selectedPlanId)) {
      setSelectedPlanId(plans[0]?.id ?? null)
    }
    return plans
  }

  function requiredBalanceForPlan(plan: ChatPlan) {
    if (plan.mode === 'FIXED_DURATION') {
      return Number(plan.packagePrice ?? 0) || 0
    }
    if (plan.mode === 'PER_MINUTE') {
      return (Number(plan.pricePerMinute ?? 0) || 0) * 2
    }
    const prices = [
      Number(plan.textPrice ?? 0) || 0,
      Number(plan.imagePrice ?? 0) || 0,
      Number(plan.audioPrice ?? 0) || 0,
    ].filter((n) => n > 0)
    return prices.length ? Math.min(...prices) : chatPrice
  }

  async function purchaseSelectedPlan(plan: ChatPlan) {
    const res = await api<{
      conversationId: string
      session: ChatSession
    }>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({
        creatorUserId: profile.id,
        planId: plan.id,
        mode: plan.mode,
        conversationId: chatConversationId ?? undefined,
      }),
    })
    setChatConversationId(res.conversationId)
    setChatSession(res.session)
    setChatOpen(true)
    setPlanPickerOpen(false)
  }

  function openMessage() {
    if (mode === 'guest') {
      router.push(
        `/login?from=${encodeURIComponent(`/@${profile.handle}`)}`
      )
      return
    }
    void (async () => {
      try {
        setPlanError(null)
        // Always refresh from API so newly seeded package / per-minute plans appear.
        const plans = await loadChatPlans()
        if (!plans.length) {
          setPayAction('message')
          return
        }
        setPlanPickerOpen(true)
      } catch {
        setPayAction('message')
      }
    })()
  }

  async function confirmPlanSelection() {
    const plan = chatPlans.find((p) => p.id === selectedPlanId)
    if (!plan) {
      setPlanError('Select a chat plan to continue')
      return
    }
    setPlanBusy(true)
    setPlanError(null)
    try {
      const needed = requiredBalanceForPlan(plan)
      const balance = await fetchWalletAvailableBalance()
      setWalletBalance(balance)
      if (balance < needed) {
        setPlanPickerOpen(false)
        setPayAction('message')
        return
      }
      await purchaseSelectedPlan(plan)
    } catch (e) {
      setPlanError(e instanceof Error ? e.message : 'Could not start chat plan')
    } finally {
      setPlanBusy(false)
    }
  }

  async function startCall(type: 'AUDIO' | 'VIDEO') {
    if (callStartLockRef.current) return
    callStartLockRef.current = true
    const username = profile.handle.replace(/^@/, '').toLowerCase()
    try {
      // Never stack dials — one live session per profile tab.
      if (activeCallId) {
        try {
          await api(`/calls/sessions/${activeCallId}/cancel`, {
            method: 'POST',
          })
        } catch {
          try {
            await api(`/calls/sessions/${activeCallId}/end`, {
              method: 'POST',
            })
          } catch {
            // create() also cancels leftover RINGING sessions
          }
        }
        setActiveCallId(null)
      }
      const res = await api<{ call: { id: string } }>('/calls/sessions', {
        method: 'POST',
        body: JSON.stringify({
          creatorUsername: username,
          type,
        }),
      })
      const callId = res.call?.id
      if (!callId) throw new Error('Could not start call')
      setActiveCallId(callId)
    } finally {
      callStartLockRef.current = false
    }
  }

  function openCall(action: 'voice-call' | 'video-call') {
    if (mode === 'guest') {
      router.push(
        `/login?from=${encodeURIComponent(`/@${profile.handle}`)}`
      )
      return
    }
    // Already dialing / in a call — don't spawn a second session.
    if (activeCallId || callStartLockRef.current) return
    void (async () => {
      try {
        const balance = await fetchWalletAvailableBalance()
        setWalletBalance(balance)
        const minimum =
          action === 'voice-call'
            ? voiceCallMinimumBalance
            : videoCallMinimumBalance
        if (balance < minimum) {
          setPayAction(action)
          return
        }
        await startCall(action === 'voice-call' ? 'AUDIO' : 'VIDEO')
      } catch {
        setPayAction(action)
      }
    })()
  }

  async function confirmPayAction() {
    const selectedPlan =
      chatPlans.find((p) => p.id === selectedPlanId) ?? chatPlans[0] ?? null
    const selectedCallMinimum =
      payAction === 'voice-call'
        ? voiceCallMinimumBalance
        : videoCallMinimumBalance
    const isCall =
      payAction === 'voice-call' || payAction === 'video-call'
    const chatMinimum = selectedPlan
      ? requiredBalanceForPlan(selectedPlan)
      : chatPrice
    const needed =
      isCall
        ? Math.max(selectedCallMinimum, 100)
        : Math.max(chatMinimum * (selectedPlan?.mode === 'PER_ITEM' ? 5 : 1), 100)

    const balance = await fetchWalletAvailableBalance()
    setWalletBalance(balance)

    if (
      balance <
      (isCall ? selectedCallMinimum : chatMinimum)
    ) {
      await topUpWallet(needed)
      const next = await fetchWalletAvailableBalance()
      setWalletBalance(next)
    }

    if (payAction === 'message') {
      if (selectedPlan) {
        await purchaseSelectedPlan(selectedPlan)
      } else {
        setPlanPickerOpen(true)
      }
      setPayAction(null)
      return
    }

    if (isCall) {
      await startCall(payAction === 'voice-call' ? 'AUDIO' : 'VIDEO')
      setPayAction(null)
    }
  }

  function openHighlight(highlight: PublicHighlight) {
    setHighlightViewer([
      {
        id: highlight.id,
        name: profile.name,
        handle: profile.handle,
        avatar: profile.avatar,
        verified: profile.verified,
        seen: true,
        stories: highlight.stories,
      },
    ])
  }

  async function shareProfile() {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/@${profile.handle}`
        : `/@${profile.handle}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: profile.name,
          text: profile.bio,
          url,
        })
        return
      }
      await navigator.clipboard.writeText(url)
    } catch {
      // ignore
    }
  }

  const postsSubtitle =
    mode === 'owner'
      ? 'Managing your public posts'
      : mode === 'subscriber'
        ? 'Member posts unlocked · pay-per-view exclusives stay locked until you buy'
        : mode === 'guest'
          ? 'First 2 free · sign up to unlock more'
          : 'First 2 free · unlock or subscribe for the rest'

  return (
    <div
      className={cn('min-h-svh', surface.page)}
      style={{
        fontFamily: fontFamilyFor(appearance.font),
        ...(appearance.theme === 'gradient'
          ? {
              backgroundImage: `radial-gradient(ellipse at top, ${withAlpha(appearance.accent, 0.28)}, transparent 50%), linear-gradient(180deg, #0a0612 0%, #120818 45%, #06040a 100%)`,
            }
          : undefined),
      }}
    >
      <header
        className={cn(
          'sticky top-0 z-40 border-b backdrop-blur-xl',
          surface.header
        )}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Logo markSize="sm" />
          </Link>
          <div className="flex items-center gap-2">
            {authLoading ? null : user ? (
              <>
                <Link
                  href={
                    user.role === 'creator'
                      ? '/influencer'
                      : user.role === 'admin'
                        ? '/admin'
                        : '/user'
                  }
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[13px] font-medium',
                    isLight
                      ? 'text-zinc-500 hover:text-zinc-900'
                      : 'text-white/60 hover:text-white'
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href={
                    user.role === 'creator'
                      ? '/influencer/settings'
                      : '/user/profile'
                  }
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-[13px] font-semibold',
                    isLight ? 'bg-zinc-900 text-white' : 'bg-white text-black'
                  )}
                >
                  {user.name.split(' ')[0]}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`/login?from=${encodeURIComponent(`/@${creator.handle}`)}`}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[13px] font-medium',
                    isLight
                      ? 'text-zinc-500 hover:text-zinc-900'
                      : 'text-white/60 hover:text-white'
                  )}
                >
                  Log in
                </Link>
                <Link
                  href={`/signup?from=${encodeURIComponent(`/@${creator.handle}`)}`}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-[13px] font-semibold',
                    isLight ? 'bg-zinc-900 text-white' : 'bg-white text-black'
                  )}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <CreatorHeader
        creator={creator}
        mode={mode}
        following={following}
        subscribed={subscribed || mode === 'subscriber'}
        appearance={appearance}
        hasLiveStories={creator.stories.length > 0}
        storiesSeen={storySeen}
        onOpenStories={() => setStoryOpen(true)}
        onFollow={() => {
          if (mode === 'guest') {
            router.push(
              `/signup?role=user&from=${encodeURIComponent(`/@${creator.handle}`)}`
            )
            return
          }
          toggleFollow({
            id: creator.id,
            handle: creator.handle,
            name: creator.name,
            avatar: creator.avatar,
            category: creator.category,
            href: `/@${creator.handle}`,
          })
        }}
        onSubscribe={() => openUnlockFlow(null)}
        onShare={shareProfile}
        onCoffee={mode === 'owner' ? undefined : openCoffee}
        onCollab={mode === 'owner' ? undefined : () => setCollabOpen(true)}
        onMessage={mode === 'owner' ? undefined : openMessage}
        onVoiceCall={
          mode === 'owner' ? undefined : () => openCall('voice-call')
        }
        onVideoCall={
          mode === 'owner' ? undefined : () => openCall('video-call')
        }
      />

      <div className="mx-auto max-w-[935px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <StoryHighlights
          highlights={creator.highlights}
          premiumUnlocked={premiumStories}
          onSelect={(highlight) => openHighlight(highlight)}
          onLockedClick={() => openUnlockFlow(null)}
        />

        {creator.events.length > 0 ? (
          <EventsSection events={creator.events} />
        ) : null}

        {creator.bookingUrl ? (
          <CalComBookingCard
            creatorName={creator.name}
            bookingUrl={creator.bookingUrl}
            appearance={appearance}
          />
        ) : null}

        {mode === 'guest' ? (
          <GuestUnlockPrompt
            creatorHandle={creator.handle}
            creatorName={creator.name}
          />
        ) : null}

        {mode === 'subscriber' ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[22px] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-100"
          >
            You’re subscribed — member-only posts are unlocked. Pay-per-view
            exclusives still need a one-time unlock.
          </motion.div>
        ) : null}

        <div
          className={cn(
            'flex gap-1 overflow-x-auto rounded-full border p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            isLight
              ? 'border-black/8 bg-white/70'
              : 'border-white/10 bg-white/[0.03]'
          )}
          role="tablist"
          aria-label="Creator sections"
        >
          {TABS.map((item) => {
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={cn(
                  'relative shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors sm:px-5',
                  active
                    ? isLight
                      ? 'text-white'
                      : 'text-black'
                    : isLight
                      ? 'text-zinc-500 hover:text-zinc-900'
                      : 'text-white/50 hover:text-white'
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="public-creator-tab"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: isLight ? appearance.accent : '#fff',
                    }}
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <span className="relative z-10">{item.label}</span>
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'posts' ? (
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2
                      className={cn(
                        'text-xl font-bold tracking-tight',
                        isLight ? 'text-zinc-900' : 'text-white'
                      )}
                    >
                      Exclusive posts
                    </h2>
                    <p
                      className={cn(
                        'mt-1 text-[13px]',
                        isLight ? 'text-zinc-500' : 'text-white/40'
                      )}
                    >
                      {postsSubtitle}
                    </p>
                  </div>
                </div>
                <PostsGrid
                  posts={posts}
                  freeCount={2}
                  subscribed={contentUnlocked}
                  monthlyPrice={creator.monthlyPrice}
                  onUnlock={(post) => openUnlockFlow(post)}
                  onSubscribe={() => openUnlockFlow(null)}
                />
              </div>
            ) : null}

            {tab === 'media' ? (
              <MediaGallery
                posts={posts}
                onLockedClick={(post) => openUnlockFlow(post)}
              />
            ) : null}
            {tab === 'store' ? (
              <StoreSection
                items={
                  creator.store.length
                    ? creator.store
                    : [
                        {
                          id: 'store-empty-1',
                          title: 'Coming soon',
                          description: 'Merch and digital drops land here.',
                          price: creator.monthlyPrice,
                          imageUrl: creator.coverImage,
                          badge: 'Soon',
                        },
                      ]
                }
              />
            ) : null}
            {tab === 'cases' ? (
              <CaseStudiesSection items={creator.caseStudies ?? []} />
            ) : null}
            {tab === 'about' ? <AboutSection creator={creator} /> : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer
        className={cn(
          'border-t py-10 text-center text-[13px]',
          isLight
            ? 'border-black/8 text-zinc-400'
            : 'border-white/8 text-white/35'
        )}
      >
        <Link href="/" className="inline-flex justify-center">
          <Logo markSize="sm" />
        </Link>
        <p className="mt-3">Create your page on Linkme</p>
        <p className="mt-1 text-[12px] opacity-70">
          Share /@{creator.handle} on Instagram, TikTok & YouTube
        </p>
      </footer>

      {mode === 'fan' || mode === 'subscriber' ? (
        <SubscriptionModal
          open={modalOpen}
          creator={creator}
          alreadySubscribed={subscribed || mode === 'subscriber'}
          target={{ post: activePost, mode: activePost ? 'post' : 'subscribe' }}
          onClose={() => setModalOpen(false)}
          onBuyPost={(postId) => {
            setUnlockedIds((ids) =>
              ids.includes(postId) ? ids : [...ids, postId]
            )
            setModalOpen(false)
            setActivePost(null)
            void listCreatorPosts(username).then((apiPosts) => {
              setApiCreator((prev) =>
                prev
                  ? { ...prev, posts: apiPosts.map(mapApiPostToPublic) }
                  : prev
              )
            })
          }}
          onSubscribe={() => {
            setSubscribed(true)
            setModalOpen(false)
            setActivePost(null)
            void listCreatorPosts(username).then((apiPosts) => {
              setApiCreator((prev) =>
                prev
                  ? { ...prev, posts: apiPosts.map(mapApiPostToPublic) }
                  : prev
              )
            })
          }}
        />
      ) : null}

      <ChatPlanPicker
        open={planPickerOpen}
        creatorName={creator.name}
        plans={chatPlans}
        selectedId={selectedPlanId}
        busy={planBusy}
        error={planError}
        onSelect={(plan) => setSelectedPlanId(plan.id)}
        onConfirm={() => void confirmPlanSelection()}
        onClose={() => setPlanPickerOpen(false)}
      />

      <CreatorActionPaySheet
        open={Boolean(payAction)}
        action={payAction}
        creatorName={creator.name}
        price={
          payAction === 'voice-call'
            ? voiceCallPrice
            : payAction === 'video-call'
              ? videoCallPrice
              : chatPlans.find((p) => p.id === selectedPlanId)
                ? requiredBalanceForPlan(
                    chatPlans.find((p) => p.id === selectedPlanId)!
                  )
                : chatPrice
        }
        minimumBalance={
          payAction === 'voice-call'
            ? voiceCallMinimumBalance
            : payAction === 'video-call'
              ? videoCallMinimumBalance
              : chatPlans.find((p) => p.id === selectedPlanId)
                ? requiredBalanceForPlan(
                    chatPlans.find((p) => p.id === selectedPlanId)!
                  )
                : chatPrice
        }
        walletBalance={walletBalance}
        onClose={() => setPayAction(null)}
        onConfirm={confirmPayAction}
        onGoToWallet={() => {
          setPayAction(null)
          router.push('/user/wallet')
        }}
      />

      <StoryViewer
        creators={storyCreators}
        open={storyOpen && storyCreators.length > 0}
        onClose={() => setStoryOpen(false)}
        onMarkSeen={() => setStorySeen(true)}
      />

      <StoryViewer
        creators={highlightViewer ?? []}
        open={!!highlightViewer?.length}
        onClose={() => setHighlightViewer(null)}
      />

      <ProfileChatPanel
        open={chatOpen}
        conversationId={chatConversationId}
        creatorName={creator.name}
        creatorHandle={creator.handle}
        creatorAvatar={creator.avatar}
        pricePerMessage={chatPrice}
        initialSession={chatSession}
        onSessionChange={setChatSession}
        onClose={() => setChatOpen(false)}
      />

      {mode !== 'owner' ? (
        <CollabModal
          open={collabOpen}
          creatorName={creator.name}
          creatorHandle={creator.handle}
          onClose={() => setCollabOpen(false)}
        />
      ) : null}

      {activeCallId ? (
        <CallRoom
          callId={activeCallId}
          role="caller"
          onEnd={() => setActiveCallId(null)}
          onAdoptSession={(sessionId) => {
            if (sessionId && sessionId !== activeCallId) {
              setActiveCallId(sessionId)
            }
          }}
        />
      ) : null}
    </div>
  )
}
