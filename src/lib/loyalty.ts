import { api } from '@/lib/api'
import type { VipEntryVisualKey } from '@/lib/vip-entry-effects'

export type LoyaltyEntryEffect = {
  id: string
  label: string
  price: number
  soundUrl: string
  visualKey: VipEntryVisualKey | string
  owned: boolean
  equipped: boolean
}

export type LoyaltyStatus = {
  level: 'KING' | null
  active: boolean
  expiresAt: string | null
  daysLeft: number | null
  progressSpend: number
  maintainSpend: number
  coinsToUnlock: number
  coinsToMaintain: number
  unlockTarget: number
  maintainTarget: number
  equippedEntryEffectId: string
  unlockedEffectIds: string[]
  effects: LoyaltyEntryEffect[]
}

export async function fetchLoyaltyStatus(): Promise<LoyaltyStatus> {
  const res = await api<{ status: LoyaltyStatus }>('/loyalty/me')
  return res.status
}

export async function purchaseEntryEffect(
  effectId: string
): Promise<LoyaltyStatus> {
  const res = await api<{ status: LoyaltyStatus }>(
    `/loyalty/entry-effects/${encodeURIComponent(effectId)}/purchase`,
    { method: 'POST' }
  )
  return res.status
}

export async function equipEntryEffect(
  effectId: string
): Promise<LoyaltyStatus> {
  const res = await api<{ status: LoyaltyStatus }>(
    `/loyalty/entry-effects/${encodeURIComponent(effectId)}/equip`,
    { method: 'POST' }
  )
  return res.status
}
