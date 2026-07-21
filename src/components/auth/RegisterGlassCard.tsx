import { cn } from '@/lib/utils'

export type RegisterAccent = 'user' | 'creator' | 'neutral'

interface RegisterGlassCardProps {
  accent: RegisterAccent
  children: React.ReactNode
  className?: string
}

const shellStyles = {
  user: {
    ring: 'ring-1 ring-inset ring-sky-400/25',
    glow: 'from-sky-400/18 via-transparent to-blue-500/10',
    hairline: 'via-sky-300/45',
    shadow: 'shadow-[0_32px_90px_rgba(14,165,233,0.16),0_24px_60px_rgba(0,0,0,0.5)]',
  },
  creator: {
    ring: 'ring-1 ring-inset ring-fuchsia-400/30',
    glow: 'from-violet-400/22 via-fuchsia-400/10 to-pink-400/16',
    hairline: 'via-pink-300/50',
    shadow: 'shadow-[0_32px_90px_rgba(217,70,239,0.18),0_24px_60px_rgba(0,0,0,0.5)]',
  },
  neutral: {
    ring: 'ring-1 ring-inset ring-white/15',
    glow: 'from-white/[0.12] via-transparent to-transparent',
    hairline: 'via-white/30',
    shadow: 'shadow-[0_32px_80px_rgba(0,0,0,0.55),0_24px_60px_rgba(0,0,0,0.45)]',
  },
} as const

export function RegisterGlassCard({ accent, children, className }: RegisterGlassCardProps) {
  const styles = shellStyles[accent]

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-[32px]',
        'border border-white/10 bg-white/[0.08] p-6 sm:p-8',
        'backdrop-blur-2xl backdrop-saturate-150',
        styles.ring,
        styles.shadow,
        className
      )}
    >
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br', styles.glow)}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent to-transparent',
          styles.hairline
        )}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
