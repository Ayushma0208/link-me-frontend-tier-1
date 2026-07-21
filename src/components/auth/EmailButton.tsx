'use client'

import { Mail } from 'lucide-react'

import { cn } from '@/lib/utils'

interface EmailButtonProps {
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function EmailButton({ onClick, className, disabled }: EmailButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-12 w-full items-center justify-center gap-3 rounded-full',
        'border border-white/15 bg-white/[0.08] text-[15px] font-semibold text-white',
        'backdrop-blur-md transition-[transform,background-color,border-color,box-shadow] duration-200',
        'hover:border-white/25 hover:bg-white/[0.12]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        'active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      <Mail className="size-5 text-white/80" aria-hidden />
      Continue with Email
    </button>
  )
}
