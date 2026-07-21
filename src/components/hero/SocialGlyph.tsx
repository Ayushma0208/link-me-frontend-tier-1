import type { SocialPlatform } from '@/components/hero/types'
import { cn } from '@/lib/utils'

interface SocialGlyphProps {
  platform: SocialPlatform
  className?: string
}

export function SocialGlyph({ platform, className }: SocialGlyphProps) {
  const shared = cn('size-full', className)

  switch (platform) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
        </svg>
      )
    case 'snapchat':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={shared} aria-hidden="true">
          <path d="M12 3c-2.4 0-4.2 1.7-4.2 4.3v.4c0 .5-.2.9-.5 1.2-.8.7-1.3 1.4-1.3 2.1 0 .5.3.9.8 1.1.3.1.5.4.5.7 0 .5-.5.9-1.2 1.1-.5.2-.8.6-.8 1.1 0 1.3 2.3 2.4 5.2 2.6l.5 1.4c.1.3.4.5.7.5h1.6c.3 0 .6-.2.7-.5l.5-1.4c2.9-.2 5.2-1.3 5.2-2.6 0-.5-.3-.9-.8-1.1-.7-.2-1.2-.6-1.2-1.1 0-.3.2-.6.5-.7.5-.2.8-.6.8-1.1 0-.7-.5-1.4-1.3-2.1-.3-.3-.5-.7-.5-1.2v-.4C16.2 4.7 14.4 3 12 3Z" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={shared} aria-hidden="true">
          <path d="M14.5 3h2.1c.2 1.7 1.2 3.1 2.7 3.9v2.3c-1.1-.1-2.1-.5-3-1.2v6.3c0 3-2.4 5.4-5.4 5.4S5.5 17.3 5.5 14.3 7.9 8.9 10.9 8.9c.3 0 .6 0 .9.1v2.5c-.3-.1-.6-.1-.9-.1-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9V3Z" />
        </svg>
      )
    case 'x':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={shared} aria-hidden="true">
          <path d="M4 4h4.2l4.1 5.7L17.5 4H20l-6.2 7.1L20.5 20H16.3l-4.5-6.2L6.5 20H4l6.6-7.5L4 4Z" />
        </svg>
      )
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={shared} aria-hidden="true">
          <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1Z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={shared} aria-hidden="true">
          <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15.2V8.8l5.2 3.2L10 15.2Z" />
        </svg>
      )
    case 'spotify':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={shared} aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.6 14.4a.75.75 0 0 1-1.03.25c-2.82-1.73-6.38-2.12-10.56-1.16a.75.75 0 1 1-.33-1.46c4.5-1.03 8.4-.58 11.5 1.33a.75.75 0 0 1 .42 1.04Zm1.23-2.74a.9.9 0 0 1-1.24.3c-3.23-1.98-8.15-2.56-11.97-1.4a.9.9 0 1 1-.52-1.72c4.3-1.3 9.7-.65 13.4 1.62a.9.9 0 0 1 .33 1.2Zm.1-2.86a1.05 1.05 0 0 1-1.44.35c-3.7-2.22-9.86-2.42-13.4-1.32a1.05 1.05 0 1 1-.62-2c4.08-1.26 10.9-1.02 15.2 1.55a1.05 1.05 0 0 1 .26 1.42Z" />
        </svg>
      )
    case 'apple':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={shared} aria-hidden="true">
          <path d="M16.4 13.1c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9-.7 0-1.9-.8-3.1-.8-1.6 0-3.1 1-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.1 1.7 2.4 3 2.3 1.2-.1 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.9-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.2Zm-2.3-6.7c.6-.8 1.1-1.9.9-3-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 3-1.4Z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={shared} aria-hidden="true">
          <path d="M6.5 9.5H3.8V20h2.7V9.5ZM5.1 4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM20.2 20h-2.7v-5.6c0-1.5-.5-2.5-1.8-2.5-1 0-1.5.7-1.8 1.3-.1.2-.1.6-.1.9V20h-2.7s.1-9.2 0-10.5h2.7v1.5c.4-.6 1.2-1.7 3-1.7 2.2 0 3.8 1.4 3.8 4.5V20Z" />
        </svg>
      )
    case 'kick':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={shared} aria-hidden="true">
          <path d="M4 3h5.2v6.2L14.5 3H21l-6.4 7.2L21 21h-6.4l-5.4-6.8V21H4V3Z" />
        </svg>
      )
    case 'link':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
          <path
            d="M10 14a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M14 10a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )
  }
}
