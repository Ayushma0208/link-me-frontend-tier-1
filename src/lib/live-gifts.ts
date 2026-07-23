export interface LiveGiftDef {
  id: string
  label: string
  emoji: string
  price: number
}

/** Mirrors backend live gift catalog (ids + prices must match). */
export const LIVE_GIFTS: readonly LiveGiftDef[] = [
  { id: 'rose', label: 'Rose', emoji: '🌹', price: 10 },
  { id: 'heart', label: 'Heart', emoji: '💝', price: 49 },
  { id: 'crown', label: 'Crown', emoji: '👑', price: 199 },
  { id: 'rocket', label: 'Rocket', emoji: '🚀', price: 499 },
  { id: 'diamond', label: 'Diamond', emoji: '💎', price: 999 },
] as const

const byId = new Map(LIVE_GIFTS.map((g) => [g.id, g]))

export function getLiveGift(giftId: string): LiveGiftDef | undefined {
  return byId.get(giftId.trim())
}
