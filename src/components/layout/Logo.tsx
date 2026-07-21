import { cn } from '@/lib/utils'

interface LogoMarkProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'size-6 rounded-[7px] text-[9px]',
  md: 'size-[30px] rounded-[8px] text-[11px]',
  lg: 'size-9 rounded-[10px] text-sm',
} as const

export function LogoMark({ className, size = 'md' }: LogoMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-[#ff4d9a] via-[#ff6a4d] to-[#ffb03a] font-extrabold tracking-tight text-white',
        sizeClasses[size],
        className
      )}
    >
      me
    </span>
  )
}

interface LogoProps {
  className?: string
  markSize?: LogoMarkProps['size']
  showWordmark?: boolean
}

export function Logo({ className, markSize = 'md', showWordmark = true }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={markSize} />
      {showWordmark ? (
        <span className="text-[18px] font-semibold tracking-[-0.02em] text-white">
          Linkme
        </span>
      ) : null}
    </span>
  )
}
