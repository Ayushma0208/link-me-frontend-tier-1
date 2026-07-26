export type VipEntryVisualKey = 'crown_burst' | 'sports_car' | 'gold_jet'

export type VipEntryEffect = {
  id: string
  label: string
  price: number
  soundUrl: string
  visualKey: VipEntryVisualKey
}

export const DEFAULT_ENTRY_EFFECT_ID = 'king-default'

export const VIP_ENTRY_EFFECTS: readonly VipEntryEffect[] = [
  {
    id: DEFAULT_ENTRY_EFFECT_ID,
    label: 'Crown Sweep',
    price: 0,
    soundUrl: '/vip-entry/king-default.wav',
    visualKey: 'crown_burst',
  },
  {
    id: 'sports-car',
    label: 'Sports Car',
    price: 5_000,
    soundUrl: '/vip-entry/sports-car.wav',
    visualKey: 'sports_car',
  },
  {
    id: 'gold-jet',
    label: 'Gold Jet',
    price: 10_000,
    soundUrl: '/vip-entry/gold-jet.wav',
    visualKey: 'gold_jet',
  },
] as const

export function getVipEntryEffect(
  id: string | null | undefined
): VipEntryEffect {
  return (
    VIP_ENTRY_EFFECTS.find((e) => e.id === id) ?? VIP_ENTRY_EFFECTS[0]!
  )
}
