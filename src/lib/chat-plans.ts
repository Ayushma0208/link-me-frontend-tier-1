export type ChatPlanMode = 'FIXED_DURATION' | 'PER_MINUTE' | 'PER_ITEM'

export type ChatPlan = {
  id: string
  creatorProfileId?: string
  mode: ChatPlanMode
  packagePrice: string | null
  durationMinutes: number | null
  pricePerMinute: string | null
  textPrice: string | null
  imagePrice: string | null
  audioPrice: string | null
  currency: string
  includesText: boolean
  includesImage: boolean
  includesAudio: boolean
  isActive: boolean
}

export type ChatSession = {
  id: string
  conversationId: string
  fanUserId: string
  creatorUserId: string
  planId: string | null
  mode: ChatPlanMode
  status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'EXPIRED'
  packagePrice: string | null
  durationMinutes: number | null
  pricePerMinute: string | null
  textPrice: string | null
  imagePrice: string | null
  audioPrice: string | null
  currency: string
  includesText: boolean
  includesImage: boolean
  includesAudio: boolean
  startedAt: string | null
  expiresAt: string | null
  endedAt: string | null
  minutesCharged: number
  holdMinutes: number
  totalAmount: string
  remainingSeconds: number | null
  estimatedCostPerMinute: string | null
  createdAt: string
  updatedAt: string
}

export type ChatPlanDraft = {
  mode: ChatPlanMode
  packagePrice: string
  durationMinutes: string
  pricePerMinute: string
  textPrice: string
  imagePrice: string
  audioPrice: string
  isActive: boolean
}

export function emptyChatPlanDrafts(legacyMessagePrice = 49): ChatPlanDraft[] {
  return [
    {
      mode: 'FIXED_DURATION',
      packagePrice: '200',
      durationMinutes: '15',
      pricePerMinute: '',
      textPrice: '',
      imagePrice: '',
      audioPrice: '',
      isActive: true,
    },
    {
      mode: 'PER_MINUTE',
      packagePrice: '',
      durationMinutes: '',
      pricePerMinute: '20',
      textPrice: '',
      imagePrice: '',
      audioPrice: '',
      isActive: true,
    },
    {
      mode: 'PER_ITEM',
      packagePrice: '',
      durationMinutes: '',
      pricePerMinute: '',
      textPrice: String(legacyMessagePrice),
      imagePrice: String(legacyMessagePrice),
      audioPrice: String(legacyMessagePrice),
      isActive: true,
    },
  ]
}

export function draftsFromPlans(
  plans: ChatPlan[] | undefined,
  legacyMessagePrice = 49
): ChatPlanDraft[] {
  const base = emptyChatPlanDrafts(legacyMessagePrice)
  if (!plans?.length) return base
  return base.map((draft) => {
    const plan = plans.find((p) => p.mode === draft.mode)
    if (!plan) return draft
    return {
      mode: draft.mode,
      packagePrice: plan.packagePrice ?? '',
      durationMinutes:
        plan.durationMinutes != null ? String(plan.durationMinutes) : '',
      pricePerMinute: plan.pricePerMinute ?? '',
      textPrice: plan.textPrice ?? '',
      imagePrice: plan.imagePrice ?? '',
      audioPrice: plan.audioPrice ?? '',
      isActive: plan.isActive,
    }
  })
}

export function draftsToPayload(drafts: ChatPlanDraft[]) {
  return {
    plans: drafts.map((d) => {
      if (d.mode === 'FIXED_DURATION') {
        return {
          mode: d.mode,
          packagePrice: Number(d.packagePrice) || 0,
          durationMinutes: Number(d.durationMinutes) || 0,
          isActive: d.isActive,
          includesText: true,
          includesImage: true,
          includesAudio: true,
        }
      }
      if (d.mode === 'PER_MINUTE') {
        return {
          mode: d.mode,
          pricePerMinute: Number(d.pricePerMinute) || 0,
          isActive: d.isActive,
          includesText: true,
          includesImage: true,
          includesAudio: true,
        }
      }
      return {
        mode: d.mode,
        textPrice: Number(d.textPrice) || 0,
        imagePrice: Number(d.imagePrice) || 0,
        audioPrice: Number(d.audioPrice) || 0,
        isActive: d.isActive,
      }
    }),
  }
}

export function planModeLabel(mode: ChatPlanMode) {
  switch (mode) {
    case 'FIXED_DURATION':
      return 'Time package'
    case 'PER_MINUTE':
      return 'Per minute'
    case 'PER_ITEM':
      return 'Per message'
  }
}

export function planSummary(plan: ChatPlan) {
  if (plan.mode === 'FIXED_DURATION') {
    return `${plan.durationMinutes ?? 0} min · ₹${Number(plan.packagePrice ?? 0)} · text, images & voice included`
  }
  if (plan.mode === 'PER_MINUTE') {
    return `₹${Number(plan.pricePerMinute ?? 0)}/min · text, images & voice included`
  }
  return `Text ₹${Number(plan.textPrice ?? 0)} · Image ₹${Number(plan.imagePrice ?? 0)} · Voice ₹${Number(plan.audioPrice ?? 0)}`
}

export function itemPriceFromSession(
  session: ChatSession | null | undefined,
  type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO'
) {
  if (!session || session.mode !== 'PER_ITEM') return 0
  if (type === 'IMAGE' || type === 'VIDEO') {
    return Number(session.imagePrice ?? 0) || 0
  }
  if (type === 'AUDIO') return Number(session.audioPrice ?? 0) || 0
  return Number(session.textPrice ?? 0) || 0
}
