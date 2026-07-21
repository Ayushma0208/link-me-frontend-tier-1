import { api } from '@/lib/api'
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
  accessType: 'FREE' | 'PAID'
  price: number | null
  emojiPrice: number | null
  currency: string
  status: 'SCHEDULED' | 'LIVE' | 'ENDED'
  scheduledAt: string | null
  startedAt: string | null
  endedAt: string | null
  createdAt: string
  creator?: LiveCreator
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

export type JoinResult =
  | { status: 'GRANTED'; live: LiveDto; agora: AgoraCreds }
  | { status: 'PAYMENT_REQUIRED'; live: LiveDto; price: number; currency: string }

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

export function getLive(id: string) {
  return api<{ live: LiveDto; isSubscriber: boolean; hasAccess: boolean }>(
    `/lives/${id}`
  )
}

export function joinLive(id: string) {
  return api<JoinResult>(`/lives/${id}/join`, { method: 'POST' })
}

export function payLiveWithWallet(id: string) {
  return api<{ status: 'GRANTED'; live: LiveDto; agora: AgoraCreds }>(
    `/lives/${id}/pay/wallet`,
    { method: 'POST' }
  )
}

/** Pay for a paid live via Razorpay (or the dev stub checkout), then grant access. */
export async function payLiveWithRazorpay(id: string): Promise<JoinResult> {
  const init = await api<{
    alreadyPaid?: boolean
    payment?: { id: string; amount: number; currency: string }
    razorpay?: {
      keyId: string
      orderId: string
      amountPaise: number
      currency: string
    }
  }>(`/lives/${id}/pay/razorpay/initiate`, { method: 'POST' })

  if (init.alreadyPaid || !init.razorpay || !init.payment) {
    return joinLive(id)
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
    }),
  })
}

// --- Admin ---
export interface StartLiveInput {
  title: string
  description?: string | null
  accessType: 'FREE' | 'PAID'
  price?: number
  emojiPrice: number
}

export function startLive(creatorId: string, input: StartLiveInput) {
  return api<{ live: LiveDto; agora: AgoraCreds; notified: number }>(
    `/admin/creators/${creatorId}/live`,
    { method: 'POST', body: JSON.stringify(input) }
  )
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
  return api<{ live: LiveDto; agora: AgoraCreds; notified: number }>(
    `/admin/live/${liveId}/start`,
    { method: 'POST' }
  )
}

export function endLive(liveId: string) {
  return api<{ live: LiveDto }>(`/admin/live/${liveId}/end`, { method: 'POST' })
}

export function listCreatorLives(creatorId: string) {
  return api<LiveDto[]>(`/admin/creators/${creatorId}/live`)
}
