import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

interface StudioGlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  glow?: 'creator' | 'soft' | 'none'
}

const glowStyles = {
  creator: 'from-violet-500/15 via-fuchsia-500/8 to-transparent',
  soft: 'from-white/[0.08] via-transparent to-transparent',
  none: '',
} as const

export function StudioGlassCard({
  children,
  className,
  glow = 'soft',
  ...props
}: StudioGlassCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[24px]',
        'border border-white/10 bg-white/[0.04]',
        'shadow-[0_24px_60px_rgba(0,0,0,0.35)]',
        'backdrop-blur-xl backdrop-saturate-150',
        className
      )}
      {...props}
    >
      {glow !== 'none' ? (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 bg-gradient-to-br',
            glowStyles[glow]
          )}
        />
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <div className="relative">{children}</div>
    </div>
  )
}
