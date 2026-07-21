export type PlatformId =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'spotify'
  | 'twitch'
  | 'discord'
  | 'patreon'
  | 'x'
  | 'linkedin'
  | 'facebook'
  | 'snapchat'

export interface PlatformLogo {
  id: PlatformId
  name: string
}

/** Full set of platform logos for the TrustedBy marquees. */
export const platformLogos: PlatformLogo[] = [
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'spotify', name: 'Spotify' },
  { id: 'twitch', name: 'Twitch' },
  { id: 'discord', name: 'Discord' },
  { id: 'patreon', name: 'Patreon' },
  { id: 'x', name: 'X' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'snapchat', name: 'Snapchat' },
]

/** Second row order — rotated so tracks feel distinct. */
export const platformLogosRow2: PlatformLogo[] = [
  { id: 'snapchat', name: 'Snapchat' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'x', name: 'X' },
  { id: 'patreon', name: 'Patreon' },
  { id: 'discord', name: 'Discord' },
  { id: 'twitch', name: 'Twitch' },
  { id: 'spotify', name: 'Spotify' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'instagram', name: 'Instagram' },
]
