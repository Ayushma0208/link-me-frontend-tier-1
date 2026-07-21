import { api, ApiError } from '@/lib/api'
import { getTokens } from '@/lib/api'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void
      on: (event: string, handler: (response: unknown) => void) => void
    }
  }
}

export interface RazorpayCheckoutDto {
  keyId: string
  orderId: string
  amountPaise: number
  currency: string
  paymentId: string
}

export interface CheckoutResult {
  payment: { id: string; amount: string; currency: string }
  razorpay: RazorpayCheckoutDto
}

export interface RazorpaySuccessPayload {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

function isStubCheckout(checkout: RazorpayCheckoutDto) {
  return (
    !checkout.keyId ||
    checkout.keyId === 'mock_key' ||
    checkout.keyId === 'rzp_test_placeholder' ||
    checkout.orderId.startsWith('order_stub_')
  )
}

export function requireAuthForPayment() {
  if (!getTokens()?.accessToken) {
    throw new ApiError('Please log in to continue payment', 401)
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Razorpay requires a browser'))
      return
    }
    if (window.Razorpay) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}

function formatPaise(amountPaise: number, currency: string) {
  const amount = (amountPaise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return currency === 'INR' ? `₹${amount}` : `${currency} ${amount}`
}

/**
 * Visible checkout when Razorpay keys are not configured (local/dev stub orders).
 * Real keys → opens the official Razorpay Checkout modal.
 */
function openStubCheckoutSheet(params: {
  checkout: RazorpayCheckoutDto
  description: string
  name?: string
}): Promise<RazorpaySuccessPayload> {
  const { checkout, description, name = 'LinkMe' } = params

  return new Promise((resolve, reject) => {
    const existing = document.getElementById('linkme-rzp-stub-root')
    existing?.remove()

    const root = document.createElement('div')
    root.id = 'linkme-rzp-stub-root'
    root.setAttribute('role', 'dialog')
    root.setAttribute('aria-modal', 'true')
    root.style.cssText =
      'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);font-family:system-ui,-apple-system,sans-serif;'

    const card = document.createElement('div')
    card.style.cssText =
      'width:100%;max-width:400px;border-radius:24px;border:1px solid rgba(255,255,255,.12);background:#141416;color:#fff;padding:24px;box-shadow:0 30px 80px rgba(0,0,0,.55);'

    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div>
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.4);">${name}</p>
          <h2 style="margin:6px 0 0;font-size:20px;font-weight:700;">Razorpay Checkout</h2>
        </div>
        <span style="font-size:11px;font-weight:600;padding:4px 8px;border-radius:999px;border:1px solid rgba(251,191,36,.35);color:#fbbf24;background:rgba(251,191,36,.08);">TEST</span>
      </div>
      <p style="margin:14px 0 0;font-size:14px;color:rgba(255,255,255,.55);line-height:1.45;">${description}</p>
      <div style="margin-top:18px;border-radius:16px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);padding:14px 16px;">
        <p style="margin:0;font-size:12px;color:rgba(255,255,255,.4);">Amount</p>
        <p style="margin:6px 0 0;font-size:28px;font-weight:800;">${formatPaise(checkout.amountPaise, checkout.currency || 'INR')}</p>
      </div>
      <p style="margin:14px 0 0;font-size:12px;color:rgba(255,255,255,.35);line-height:1.4;">
        Add <code style="color:#fb7185;">RAZORPAY_KEY_ID</code> + <code style="color:#fb7185;">RAZORPAY_KEY_SECRET</code> in <code style="color:#fb7185;">backend/api/.env</code> to open the live Razorpay modal.
      </p>
      <div style="margin-top:18px;display:grid;gap:10px;">
        <button type="button" data-action="pay" style="height:48px;border:0;border-radius:999px;background:linear-gradient(135deg,#ff4d9a,#ff7a59);color:#fff;font-size:14px;font-weight:700;cursor:pointer;">
          Pay ${formatPaise(checkout.amountPaise, checkout.currency || 'INR')}
        </button>
        <button type="button" data-action="cancel" style="height:44px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:transparent;color:rgba(255,255,255,.75);font-size:14px;font-weight:600;cursor:pointer;">
          Cancel
        </button>
      </div>
    `

    const cleanup = () => root.remove()

    card.querySelector('[data-action="pay"]')?.addEventListener('click', () => {
      cleanup()
      resolve({
        razorpay_order_id: checkout.orderId,
        razorpay_payment_id: `pay_stub_${Date.now()}`,
        razorpay_signature: 'stub_signature',
      })
    })
    card.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      cleanup()
      reject(new Error('Payment cancelled'))
    })
    root.addEventListener('click', (e) => {
      if (e.target === root) {
        cleanup()
        reject(new Error('Payment cancelled'))
      }
    })

    root.appendChild(card)
    document.body.appendChild(root)
  })
}

/** Open Razorpay checkout (live keys) or a visible test checkout sheet (stub). */
export async function openRazorpayCheckout(params: {
  checkout: RazorpayCheckoutDto
  description: string
  name?: string
  prefill?: { name?: string; email?: string }
}): Promise<RazorpaySuccessPayload> {
  const { checkout, description, name = 'LinkMe', prefill } = params

  if (isStubCheckout(checkout)) {
    return openStubCheckoutSheet({ checkout, description, name })
  }

  await loadRazorpayScript()

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: checkout.keyId,
      amount: checkout.amountPaise,
      currency: checkout.currency || 'INR',
      name,
      description,
      order_id: checkout.orderId,
      prefill: prefill ?? {},
      theme: { color: '#ff4d9a' },
      handler: (response: RazorpaySuccessPayload) => {
        resolve(response)
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    })
    rzp.on('payment.failed', (response: unknown) => {
      const msg =
        typeof response === 'object' &&
        response &&
        'error' in response &&
        typeof (response as { error?: { description?: string } }).error
          ?.description === 'string'
          ? (response as { error: { description: string } }).error.description
          : 'Payment failed'
      reject(new Error(msg))
    })
    rzp.open()
  })
}

export async function confirmPayment(
  checkout: RazorpayCheckoutDto,
  response: RazorpaySuccessPayload
) {
  return api('/payments/confirm', {
    method: 'POST',
    body: JSON.stringify({
      paymentId: checkout.paymentId,
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
    }),
  })
}

async function runCheckout(
  createOrder: () => Promise<CheckoutResult>,
  description: string
) {
  requireAuthForPayment()
  const result = await createOrder()
  if (!result?.razorpay) {
    throw new ApiError('Payment order missing Razorpay checkout details', 500)
  }
  const response = await openRazorpayCheckout({
    checkout: result.razorpay,
    description,
  })
  await confirmPayment(result.razorpay, response)
  return result
}

/** One-time exclusive (PPV) unlock for a single post. */
export async function payForExclusivePost(postId: string) {
  if (!isUuid(postId)) {
    throw new ApiError(
      'This demo post cannot be purchased. Open a live AI creator profile.',
      400
    )
  }
  return runCheckout(
    () =>
      api<CheckoutResult>('/payments/ppv', {
        method: 'POST',
        body: JSON.stringify({ postId }),
      }),
    'Exclusive post unlock'
  )
}

/** Monthly subscription — creates membership then opens Razorpay. */
export async function payForSubscription(planId: string) {
  if (!isUuid(planId)) {
    throw new ApiError('No subscription plan available for this creator', 400)
  }

  requireAuthForPayment()

  const created = await api<{
    alreadySubscribed?: boolean
    subscription: { id: string; status?: string }
    payment: { id: string } | null
  }>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({ planId }),
  })

  if (created.alreadySubscribed) {
    return { alreadySubscribed: true as const, subscription: created.subscription }
  }

  return runCheckout(
    () =>
      api<CheckoutResult>('/payments/subscriptions/checkout', {
        method: 'POST',
        body: JSON.stringify({ subscriptionId: created.subscription.id }),
      }),
    'Monthly subscription'
  )
}

/** Buy me a coffee tip. */
export async function payForCoffee(input: {
  creatorUsername: string
  amount: number
  message?: string
  isAnonymous?: boolean
  donorDisplayName?: string
}) {
  return runCheckout(
    () =>
      api<CheckoutResult>('/payments/coffee', {
        method: 'POST',
        body: JSON.stringify({
          creatorUsername: input.creatorUsername.replace(/^@/, '').toLowerCase(),
          amount: input.amount,
          message: input.message || undefined,
          isAnonymous: Boolean(input.isAnonymous),
          donorDisplayName: input.isAnonymous
            ? undefined
            : input.donorDisplayName || undefined,
        }),
      }),
    'Buy me a coffee'
  )
}

/** Add funds to the user wallet via Razorpay (or stub checkout in test mode). */
export async function topUpWallet(amount: number) {
  requireAuthForPayment()
  if (!Number.isFinite(amount) || amount < 50) {
    throw new ApiError('Minimum top-up is ₹50', 400)
  }

  const result = await api<{
    payment: { id: string }
    razorpay: Omit<RazorpayCheckoutDto, 'paymentId'> & { paymentId?: string }
  }>('/wallet/topup/initiate', {
    method: 'POST',
    body: JSON.stringify({ amount, currency: 'INR' }),
  })

  if (!result?.payment?.id || !result.razorpay) {
    throw new ApiError('Wallet top-up order failed', 500)
  }

  const checkout: RazorpayCheckoutDto = {
    keyId: result.razorpay.keyId,
    orderId: result.razorpay.orderId,
    amountPaise: result.razorpay.amountPaise,
    currency: result.razorpay.currency || 'INR',
    paymentId: result.payment.id,
  }

  const response = await openRazorpayCheckout({
    checkout,
    description: 'Wallet top-up',
  })

  return api('/wallet/topup/confirm', {
    method: 'POST',
    body: JSON.stringify({
      paymentId: result.payment.id,
      providerPaymentId: response.razorpay_payment_id,
      providerOrderId: response.razorpay_order_id,
      providerSignature: response.razorpay_signature,
    }),
  })
}

/** Fetch current available wallet balance (rupees). */
export async function fetchWalletAvailableBalance(): Promise<number> {
  const res = await api<{ wallet: { availableBalance: string } }>('/wallet')
  const n = Number(res.wallet?.availableBalance ?? 0)
  return Number.isFinite(n) ? n : 0
}

/** One-time unlock to message a creator. */
export async function payForChatUnlock(input: {
  creatorProfileId?: string
  creatorUsername?: string
}) {
  requireAuthForPayment()
  const result = await api<
    CheckoutResult & {
      alreadyUnlocked?: boolean
      razorpay: RazorpayCheckoutDto | null
    }
  >('/payments/chat-unlock', {
    method: 'POST',
    body: JSON.stringify({
      ...(input.creatorProfileId
        ? { creatorProfileId: input.creatorProfileId }
        : {}),
      ...(input.creatorUsername
        ? {
            creatorUsername: input.creatorUsername
              .replace(/^@/, '')
              .toLowerCase(),
          }
        : {}),
    }),
  })

  if (result.alreadyUnlocked || !result.razorpay) {
    return result
  }

  const response = await openRazorpayCheckout({
    checkout: result.razorpay,
    description: 'Message unlock',
  })
  await confirmPayment(result.razorpay, response)
  return result
}

/** Pay admin voice-call rate (per session minute) before requesting a call. */
export async function payForCallUnlock(input: {
  creatorProfileId?: string
  creatorUsername?: string
  minutes?: number
}) {
  return runCheckout(
    () =>
      api<CheckoutResult>('/payments/call-unlock', {
        method: 'POST',
        body: JSON.stringify({
          ...(input.creatorProfileId
            ? { creatorProfileId: input.creatorProfileId }
            : {}),
          ...(input.creatorUsername
            ? {
                creatorUsername: input.creatorUsername
                  .replace(/^@/, '')
                  .toLowerCase(),
              }
            : {}),
          minutes: input.minutes ?? 1,
        }),
      }),
    'Voice call'
  )
}

export async function fetchCreatorPlanId(
  username: string
): Promise<string | null> {
  try {
    const data = await api<{
      items: Array<{
        id: string
        isFeatured: boolean
        isActive: boolean
        price: string
      }>
    }>(
      `/subscriptions/plans/creator/${encodeURIComponent(
        username.replace(/^@/, '').toLowerCase()
      )}`
    )
    const items = data.items ?? []
    const plan =
      items.find((p) => p.isFeatured && p.isActive) ||
      items.find((p) => p.isActive) ||
      items[0]
    return plan?.id ?? null
  } catch {
    return null
  }
}

/** Whether the signed-in fan already has an active membership for this creator. */
export async function fetchMembershipForCreator(input: {
  creatorProfileId?: string | null
  planId?: string | null
}): Promise<boolean> {
  try {
    const list = await api<
      Array<{
        status: string
        entitled?: boolean
        plan?: { id?: string; creatorProfileId?: string }
      }>
    >('/subscriptions/me?limit=100')
    const items = Array.isArray(list) ? list : []
    return items.some((sub) => {
      const entitled =
        sub.entitled === true ||
        ['ACTIVE', 'TRIALING', 'PAST_DUE', 'PAUSED'].includes(sub.status)
      if (!entitled) return false
      if (input.planId && sub.plan?.id === input.planId) return true
      if (
        input.creatorProfileId &&
        sub.plan?.creatorProfileId === input.creatorProfileId
      ) {
        return true
      }
      return false
    })
  } catch {
    return false
  }
}

export { isUuid }
