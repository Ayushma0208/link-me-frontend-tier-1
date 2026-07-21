export type ProfileTheme = 'dark' | 'light' | 'gradient'
export type ProfileButtonStyle = 'pill' | 'rounded' | 'soft' | 'outline'
export type ProfileFont = 'geist' | 'space' | 'dm' | 'syne' | 'serif'

export type CoverMediaType = 'image' | 'video'

export interface ProfileAppearance {
  theme: ProfileTheme
  accent: string
  buttonStyle: ProfileButtonStyle
  font: ProfileFont
  coverType: CoverMediaType
  coverImage: string
  coverVideo: string
}

export const ACCENT_PRESETS = [
  { id: 'fuchsia', label: 'Fuchsia', value: '#d946ef' },
  { id: 'rose', label: 'Rose', value: '#fb7185' },
  { id: 'amber', label: 'Amber', value: '#f59e0b' },
  { id: 'sky', label: 'Sky', value: '#38bdf8' },
  { id: 'emerald', label: 'Emerald', value: '#34d399' },
  { id: 'violet', label: 'Violet', value: '#8b5cf6' },
  { id: 'orange', label: 'Sunset', value: '#ff6a4d' },
] as const

export const THEME_OPTIONS: { id: ProfileTheme; label: string; hint: string }[] = [
  { id: 'dark', label: 'Dark', hint: 'Cinema black' },
  { id: 'light', label: 'Light', hint: 'Clean & airy' },
  { id: 'gradient', label: 'Gradient', hint: 'Brand wash' },
]

export const BUTTON_STYLE_OPTIONS: {
  id: ProfileButtonStyle
  label: string
}[] = [
  { id: 'pill', label: 'Pill' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'soft', label: 'Soft' },
  { id: 'outline', label: 'Outline' },
]

export const FONT_OPTIONS: { id: ProfileFont; label: string; sample: string }[] = [
  { id: 'geist', label: 'Geist', sample: 'Modern sans' },
  { id: 'space', label: 'Space Grotesk', sample: 'Tech display' },
  { id: 'dm', label: 'DM Sans', sample: 'Editorial clean' },
  { id: 'syne', label: 'Syne', sample: 'Bold identity' },
  { id: 'serif', label: 'Instrument', sample: 'Premium serif' },
]

export const COVER_IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80',
]

export const COVER_VIDEO_PRESETS = [
  '/videos/hero-1.mp4',
  '/videos/hero-2.mp4',
  '/videos/hero-3.mp4',
  '/videos/hero-4.mp4',
]

export const PUBLIC_URL_HOST = 'linkme.com'

export const RESERVED_PUBLIC_URLS = new Set([
  'login',
  'signup',
  'register',
  'admin',
  'user',
  'influencer',
  'api',
  'settings',
  'explore',
  'help',
  'about',
  'terms',
  'privacy',
])

/** Demo handles already claimed in the catalog. */
export const TAKEN_PUBLIC_URLS = new Set([
  'richforever',
  'kyliefit',
  'johndoe',
  'priyasharma',
  'alexc',
  'ashtonhall',
])

export const defaultAppearance: ProfileAppearance = {
  theme: 'dark',
  accent: '#d946ef',
  buttonStyle: 'pill',
  font: 'geist',
  coverType: 'image',
  coverImage: COVER_IMAGE_PRESETS[0]!,
  coverVideo: COVER_VIDEO_PRESETS[0]!,
}

export function sanitizePublicUsername(raw: string) {
  return raw.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24)
}

export function validatePublicUsername(
  username: string,
  currentUsername?: string
): { ok: boolean; message: string } {
  if (username.length < 3) {
    return { ok: false, message: 'At least 3 characters' }
  }
  if (RESERVED_PUBLIC_URLS.has(username)) {
    return { ok: false, message: 'This URL is reserved' }
  }
  if (
    TAKEN_PUBLIC_URLS.has(username) &&
    username !== (currentUsername ?? '').toLowerCase()
  ) {
    return { ok: false, message: 'Already taken' }
  }
  return { ok: true, message: 'Available' }
}

export function publicProfileUrl(username: string) {
  return `${PUBLIC_URL_HOST}/${username || 'yourname'}`
}

export function fontFamilyFor(font: ProfileFont): string {
  switch (font) {
    case 'space':
      return 'var(--font-space), ui-sans-serif, system-ui, sans-serif'
    case 'dm':
      return 'var(--font-dm), ui-sans-serif, system-ui, sans-serif'
    case 'syne':
      return 'var(--font-syne), ui-sans-serif, system-ui, sans-serif'
    case 'serif':
      return 'var(--font-instrument), ui-serif, Georgia, serif'
    default:
      return 'var(--font-sans), ui-sans-serif, system-ui, sans-serif'
  }
}

export function buttonRadiusClass(style: ProfileButtonStyle): string {
  switch (style) {
    case 'rounded':
      return 'rounded-2xl'
    case 'soft':
      return 'rounded-xl'
    case 'outline':
      return 'rounded-full'
    default:
      return 'rounded-full'
  }
}

export function themeSurface(theme: ProfileTheme): {
  page: string
  card: string
  text: string
  muted: string
  border: string
  header: string
} {
  if (theme === 'light') {
    return {
      page: 'bg-[#f4f4f7] text-zinc-900',
      card: 'border-black/8 bg-white/80 shadow-[0_24px_60px_rgba(15,15,20,0.08)]',
      text: 'text-zinc-900',
      muted: 'text-zinc-500',
      border: 'border-black/8',
      header: 'border-black/8 bg-white/80',
    }
  }
  if (theme === 'gradient') {
    return {
      page: 'bg-[#0a0612] text-white',
      card: 'border-white/12 bg-white/[0.08]',
      text: 'text-white',
      muted: 'text-white/55',
      border: 'border-white/12',
      header: 'border-white/10 bg-black/40',
    }
  }
  return {
    page: 'bg-black text-white',
    card: 'border-white/12 bg-white/[0.06]',
    text: 'text-white',
    muted: 'text-white/55',
    border: 'border-white/12',
    header: 'border-white/8 bg-black/70',
  }
}

export function withAlpha(hex: string, alpha: number) {
  const raw = hex.replace('#', '')
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return `rgba(217,70,239,${alpha})`
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r},${g},${b},${alpha})`
}
