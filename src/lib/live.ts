import { api } from '@/lib/api'
import type { DeviceClass } from '@/lib/device-class'
import {
  openRazorpayCheckout,
  type RazorpayCheckoutDto,
} from '@/lib/razorpay-checkout'

export interface LiveCreator {
  id: string
  username: string
  name: string
  avatarUrl: string | null
}

export interface LiveDto {
  id: string
  title: string
  description: string | null
  accessType: 'FREE' | 'PAID' | 'PER_MINUTE'
  price: number | null
  /** ₹/min when accessType = PER_MINUTE. */
  pricePerMinute?: number | null
  emojiPrice: number | null
  currency: string
  status: 'SCHEDULED' | 'PRACTICE' | 'LIVE' | 'ENDED'
  /** Temporary A/V pause with BRB screen — session stays LIVE. */
  isPaused?: boolean
  /** Private warm-up — host only, not visible to viewers. */
  isPractice?: boolean
  /** Host-controlled Agora audience latency for the session. */
  latencyMode?: 'ULTRA_LOW' | 'NORMAL'
  /** Invite-only private live — hidden from discovery. */
  inviteEnabled?: boolean
  /** Private invite join price (INR). Null = use live FREE/PAID price. */
  invitePrice?: number | null
  /** Present after end when host raided another live. */
  raid?: {
    targetLiveId: string
    target: {
      id: string
      title: string
      status?: string
      creator?: LiveCreator
    } | null
  } | null
  brbMessage?: string | null
  brbImageUrl?: string | null
  pausedAt?: string | null
  /** Subscriber opted in for 1h / 15m premiere reminders. */
  notifyMe?: boolean
  scheduledAt: string | null
  startedAt: string | null
  endedAt: string | null
  createdAt: string
  creator?: LiveCreator
}

export type LiveLatencyMode = 'ULTRA_LOW' | 'NORMAL'

export type StreamQualityTier = 'HIGH' | 'LOW'

export interface StreamEncoderProfile {
  width: number
  height: number
  bitrate: number
  frameRate: number
}

/** Dual-stream policy from join/host grant — drives Agora encoder + remote stream pick. */
export interface StreamQualityPolicy {
  dualStream: true
  high: StreamEncoderProfile
  low: StreamEncoderProfile
  recommended: StreamQualityTier
}

export const DEFAULT_STREAM_QUALITY: StreamQualityPolicy = {
  dualStream: true,
  high: { width: 1920, height: 1080, bitrate: 2500, frameRate: 30 },
  low: { width: 426, height: 240, bitrate: 300, frameRate: 15 },
  recommended: 'HIGH',
}

export interface PauseLiveInput {
  message?: string
  imageUrl?: string | null
}

export interface AgoraCreds {
  appId: string
  channel: string
  token: string
  /** Numeric Agora UID — must match the server-issued token. */
  uid: number | string
  role: 'host' | 'audience'
  mock?: boolean
}

export type AgoraGrant = {
  live: LiveDto
  agora: AgoraCreds
  streamQuality?: StreamQualityPolicy
  notified?: number
}

export type JoinResult =
  | {
      status: 'GRANTED'
      live: LiveDto
      agora: AgoraCreds
      streamQuality?: StreamQualityPolicy
      billing?: {
        mode: 'PER_MINUTE'
        pricePerMinute: number
        heldMinutes: number
        currency: string
      }
    }
  | { status: 'PAYMENT_REQUIRED'; live: LiveDto; price: number; currency: string }
  | {
      status: 'INSUFFICIENT_BALANCE'
      live: LiveDto
      pricePerMinute: number
      requiredAmount: number
      currency: string
    }
  | {
      status: 'HOST_REDIRECT'
      live: LiveDto
      studioPath: string
    }

/** Agora is running in stub/dev mode (no real broadcast credentials). */
export function isMockAgora(creds: AgoraCreds): boolean {
  if (creds.mock === true) return true
  return (
    !creds.appId ||
    creds.appId === 'agora_app_stub' ||
    creds.token.startsWith('dev_token_') ||
    creds.token.startsWith('agora_stub_')
  )
}

export function listActiveLives() {
  return api<LiveDto[]>('/lives/active')
}

export function listUpcomingLives() {
  return api<LiveDto[]>('/lives/upcoming')
}

export function getLive(id: string, inviteToken?: string | null) {
  const q =
    inviteToken && inviteToken.trim()
      ? `?invite=${encodeURIComponent(inviteToken.trim())}`
      : ''
  return api<{
    live: LiveDto
    isSubscriber: boolean
    hasAccess: boolean
    hasInviteAccess?: boolean
    inviteRequired?: boolean
    joinPrice?: number
    isHost?: boolean
    notifyMe: boolean
  }>(`/lives/${id}${q}`)
}

export function notifyMeLive(id: string) {
  return api<{ live: LiveDto; notifyMe: boolean }>(`/lives/${id}/notify-me`, {
    method: 'POST',
  })
}

export function unnotifyMeLive(id: string) {
  return api<{ live: LiveDto; notifyMe: boolean }>(`/lives/${id}/notify-me`, {
    method: 'DELETE',
  })
}

export function joinLive(
  id: string,
  deviceClass?: DeviceClass,
  inviteToken?: string | null
) {
  const body: Record<string, string> = {}
  if (deviceClass) body.deviceClass = deviceClass
  if (inviteToken?.trim()) body.inviteToken = inviteToken.trim()
  return api<JoinResult>(`/lives/${id}/join`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function leaveLive(id: string) {
  return api<{ ok: true }>(`/lives/${id}/leave`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function payLiveWithWallet(
  id: string,
  deviceClass?: DeviceClass,
  inviteToken?: string | null
) {
  const body: Record<string, string> = {}
  if (deviceClass) body.deviceClass = deviceClass
  if (inviteToken?.trim()) body.inviteToken = inviteToken.trim()
  return api<{
    status: 'GRANTED'
    live: LiveDto
    agora: AgoraCreds
    streamQuality?: StreamQualityPolicy
  }>(`/lives/${id}/pay/wallet`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/** Pay for a paid live via Razorpay (or the dev stub checkout), then grant access. */
export async function payLiveWithRazorpay(
  id: string,
  deviceClass?: DeviceClass,
  inviteToken?: string | null
): Promise<JoinResult> {
  const invite = inviteToken?.trim() || undefined
  const init = await api<{
    alreadyPaid?: boolean
    payment?: { id: string; amount: number; currency: string }
    razorpay?: {
      keyId: string
      orderId: string
      amountPaise: number
      currency: string
    }
  }>(`/lives/${id}/pay/razorpay/initiate`, {
    method: 'POST',
    body: JSON.stringify(invite ? { inviteToken: invite } : {}),
  })

  if (init.alreadyPaid || !init.razorpay || !init.payment) {
    return joinLive(id, deviceClass, invite)
  }

  const checkout: RazorpayCheckoutDto = {
    keyId: init.razorpay.keyId,
    orderId: init.razorpay.orderId,
    amountPaise: init.razorpay.amountPaise,
    currency: init.razorpay.currency || 'INR',
    paymentId: init.payment.id,
  }

  const response = await openRazorpayCheckout({
    checkout,
    description: 'Live access',
  })

  return api<JoinResult>(`/lives/${id}/pay/razorpay/confirm`, {
    method: 'POST',
    body: JSON.stringify({
      paymentId: init.payment.id,
      providerOrderId: response.razorpay_order_id,
      providerPaymentId: response.razorpay_payment_id,
      providerSignature: response.razorpay_signature,
      ...(deviceClass ? { deviceClass } : {}),
      ...(invite ? { inviteToken: invite } : {}),
    }),
  })
}

// --- Admin ---
export interface StartLiveInput {
  title: string
  description?: string | null
  accessType: 'FREE' | 'PAID' | 'PER_MINUTE'
  price?: number
  pricePerMinute?: number
  emojiPrice: number
}

export function startLive(creatorId: string, input: StartLiveInput) {
  return api<AgoraGrant>(`/admin/creators/${creatorId}/live`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function startPractice(creatorId: string, input: StartLiveInput) {
  return api<AgoraGrant>(`/admin/creators/${creatorId}/live/practice`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function goPublicAdminLive(liveId: string) {
  return api<AgoraGrant>(`/admin/live/${liveId}/go-public`, { method: 'POST' })
}

export function startPracticeMine(input: StartLiveInput) {
  return api<AgoraGrant>('/creators/me/live/practice', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function goPublicLive(liveId: string) {
  return api<AgoraGrant>(`/creators/me/live/${liveId}/go-public`, {
    method: 'POST',
  })
}

/** Enable or rotate private invite link; returns raw token once. */
export function enableLiveInvite(
  liveId: string,
  invitePrice?: number | null
) {
  return api<{ live: LiveDto; inviteToken: string }>(
    `/creators/me/live/${liveId}/invite`,
    {
      method: 'POST',
      body: JSON.stringify(
        invitePrice !== undefined ? { invitePrice } : {}
      ),
    }
  )
}

export function disableLiveInvite(liveId: string) {
  return api<{ live: LiveDto }>(`/creators/me/live/${liveId}/invite`, {
    method: 'DELETE',
  })
}

export function enableAdminLiveInvite(
  liveId: string,
  invitePrice?: number | null
) {
  return api<{ live: LiveDto; inviteToken: string }>(
    `/admin/live/${liveId}/invite`,
    {
      method: 'POST',
      body: JSON.stringify(
        invitePrice !== undefined ? { invitePrice } : {}
      ),
    }
  )
}

export function disableAdminLiveInvite(liveId: string) {
  return api<{ live: LiveDto }>(`/admin/live/${liveId}/invite`, {
    method: 'DELETE',
  })
}

/** Build shareable private live URL for the current origin. */
export function buildLiveInviteUrl(liveId: string, inviteToken: string) {
  if (typeof window === 'undefined') {
    return `/live/${liveId}?invite=${encodeURIComponent(inviteToken)}`
  }
  return `${window.location.origin}/live/${liveId}?invite=${encodeURIComponent(inviteToken)}`
}

/** Scheduled premiere → private warm-up on the same session. */
export function enterPracticeMine(liveId: string) {
  return api<AgoraGrant>(`/creators/me/live/${liveId}/practice`, {
    method: 'POST',
  })
}

export function enterPracticeAdmin(liveId: string) {
  return api<AgoraGrant>(`/admin/live/${liveId}/practice`, { method: 'POST' })
}

export interface ScheduleLiveInput extends StartLiveInput {
  scheduledAt: string
}

export function scheduleLive(creatorId: string, input: ScheduleLiveInput) {
  return api<{ live: LiveDto; notified: number }>(
    `/admin/creators/${creatorId}/live/schedule`,
    { method: 'POST', body: JSON.stringify(input) }
  )
}

export function startScheduledLive(liveId: string) {
  return api<AgoraGrant>(`/admin/live/${liveId}/start`, { method: 'POST' })
}

export function endLive(
  liveId: string,
  opts?: { raidTargetLiveId?: string }
) {
  return api<{ live: LiveDto }>(`/admin/live/${liveId}/end`, {
    method: 'POST',
    body: JSON.stringify(opts ?? {}),
  })
}

export function endLiveMine(
  liveId: string,
  opts?: { raidTargetLiveId?: string }
) {
  return api<{ live: LiveDto }>(`/creators/me/live/${liveId}/end`, {
    method: 'POST',
    body: JSON.stringify(opts ?? {}),
  })
}

export function listRaidTargetsMine() {
  return api<LiveDto[]>('/creators/me/live/raid-targets')
}

export function listRaidTargetsForLive(liveId: string) {
  return api<LiveDto[]>(`/admin/live/${liveId}/raid-targets`)
}

export function listCreatorLives(creatorId: string) {
  return api<LiveDto[]>(`/admin/creators/${creatorId}/live`)
}

export function pauseCreatorLive(liveId: string, input: PauseLiveInput = {}) {
  return api<{ live: LiveDto }>(`/creators/me/live/${liveId}/pause`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function resumeCreatorLive(liveId: string) {
  return api<{ live: LiveDto }>(`/creators/me/live/${liveId}/resume`, {
    method: 'POST',
  })
}

export function pauseAdminLive(liveId: string, input: PauseLiveInput = {}) {
  return api<{ live: LiveDto }>(`/admin/live/${liveId}/pause`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function resumeAdminLive(liveId: string) {
  return api<{ live: LiveDto }>(`/admin/live/${liveId}/resume`, {
    method: 'POST',
  })
}

export function setLatencyModeMine(liveId: string, mode: LiveLatencyMode) {
  return api<{ live: LiveDto }>(`/creators/me/live/${liveId}/latency`, {
    method: 'POST',
    body: JSON.stringify({ mode }),
  })
}

export function setLatencyModeAdmin(liveId: string, mode: LiveLatencyMode) {
  return api<{ live: LiveDto }>(`/admin/live/${liveId}/latency`, {
    method: 'POST',
    body: JSON.stringify({ mode }),
  })
}
