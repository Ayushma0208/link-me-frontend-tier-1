import type { IconType } from 'react-icons'
import { FaLinkedin, FaSlack } from 'react-icons/fa6'
import {
  SiApplemusic,
  SiBehance,
  SiCalendly,
  SiDiscord,
  SiDribbble,
  SiFacebook,
  SiFigma,
  SiGithub,
  SiGitlab,
  SiGmail,
  SiInstagram,
  SiKick,
  SiMedium,
  SiNotion,
  SiPatreon,
  SiPaypal,
  SiPinterest,
  SiReddit,
  SiSnapchat,
  SiSoundcloud,
  SiSpotify,
  SiStripe,
  SiSubstack,
  SiTelegram,
  SiThreads,
  SiTiktok,
  SiTwitch,
  SiWhatsapp,
  SiX,
  SiYoutube,
  SiZoom,
} from 'react-icons/si'

export interface AppItem {
  id: string
  name: string
  icon: IconType
  /** Official brand hex */
  color: string
}

export const apps: AppItem[] = [
  { id: 'instagram', name: 'Instagram', icon: SiInstagram, color: '#E4405F' },
  { id: 'tiktok', name: 'TikTok', icon: SiTiktok, color: '#FFFFFF' },
  { id: 'youtube', name: 'YouTube', icon: SiYoutube, color: '#FF0000' },
  { id: 'facebook', name: 'Facebook', icon: SiFacebook, color: '#1877F2' },
  { id: 'x', name: 'X', icon: SiX, color: '#FFFFFF' },
  { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, color: '#0A66C2' },
  { id: 'pinterest', name: 'Pinterest', icon: SiPinterest, color: '#E60023' },
  { id: 'whatsapp', name: 'WhatsApp', icon: SiWhatsapp, color: '#25D366' },
  { id: 'discord', name: 'Discord', icon: SiDiscord, color: '#5865F2' },
  { id: 'spotify', name: 'Spotify', icon: SiSpotify, color: '#1DB954' },
  { id: 'apple-music', name: 'Apple Music', icon: SiApplemusic, color: '#FA243C' },
  { id: 'soundcloud', name: 'SoundCloud', icon: SiSoundcloud, color: '#FF3300' },
  { id: 'telegram', name: 'Telegram', icon: SiTelegram, color: '#26A5E4' },
  { id: 'snapchat', name: 'Snapchat', icon: SiSnapchat, color: '#FFFC00' },
  { id: 'github', name: 'GitHub', icon: SiGithub, color: '#FFFFFF' },
  { id: 'slack', name: 'Slack', icon: FaSlack, color: '#611F69' },
  { id: 'reddit', name: 'Reddit', icon: SiReddit, color: '#FF4500' },
  { id: 'patreon', name: 'Patreon', icon: SiPatreon, color: '#FF424D' },
  { id: 'twitch', name: 'Twitch', icon: SiTwitch, color: '#9146FF' },
  { id: 'medium', name: 'Medium', icon: SiMedium, color: '#FFFFFF' },
  { id: 'behance', name: 'Behance', icon: SiBehance, color: '#1769FF' },
  { id: 'dribbble', name: 'Dribbble', icon: SiDribbble, color: '#EA4C89' },
  { id: 'figma', name: 'Figma', icon: SiFigma, color: '#F24E1E' },
  { id: 'gitlab', name: 'GitLab', icon: SiGitlab, color: '#FC6D26' },
  { id: 'gmail', name: 'Gmail', icon: SiGmail, color: '#EA4335' },
  { id: 'notion', name: 'Notion', icon: SiNotion, color: '#FFFFFF' },
  { id: 'calendly', name: 'Calendly', icon: SiCalendly, color: '#006BFF' },
  { id: 'zoom', name: 'Zoom', icon: SiZoom, color: '#2D8CFF' },
  { id: 'stripe', name: 'Stripe', icon: SiStripe, color: '#635BFF' },
  { id: 'paypal', name: 'PayPal', icon: SiPaypal, color: '#00457C' },
  { id: 'substack', name: 'Substack', icon: SiSubstack, color: '#FF6719' },
  { id: 'kick', name: 'Kick', icon: SiKick, color: '#53FC18' },
  { id: 'threads', name: 'Threads', icon: SiThreads, color: '#FFFFFF' },
]

function rotateApps(offset: number): AppItem[] {
  const len = apps.length
  const start = ((offset % len) + len) % len
  return [...apps.slice(start), ...apps.slice(0, start)]
}

/** Four staggered full tracks so each row feels dense and unique */
export const appRows: AppItem[][] = [
  rotateApps(0),
  rotateApps(8),
  rotateApps(16),
  rotateApps(24),
]
