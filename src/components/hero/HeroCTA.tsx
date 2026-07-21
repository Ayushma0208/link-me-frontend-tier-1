'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

import { LogoMark } from '@/components/layout/Logo'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface HeroCTAProps {
  prefix?: string
  placeholder?: string
  buttonLabel?: string
  className?: string
  onSubmitUsername?: (username: string) => void
}

export function HeroCTA({
  prefix = 'link.me/',
  placeholder = 'yourname',
  buttonLabel = 'Start for free',
  className,
  onSubmitUsername,
}: HeroCTAProps) {
  const router = useRouter()
  const [username, setUsername] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleaned = username.trim().replace(/^@/, '')
    if (onSubmitUsername) {
      onSubmitUsername(cleaned)
      return
    }
    router.push(cleaned ? `/signup?username=${encodeURIComponent(cleaned)}` : '/signup')
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={cn(
        'flex w-full max-w-[480px] items-center gap-2 rounded-[9999px] bg-white p-1.5 pl-3.5 shadow-[0_16px_48px_rgba(0,0,0,0.4)] sm:pl-4',
        className
      )}
    >
      <LogoMark size="sm" />

      <label htmlFor="hero-username" className="sr-only">
        Choose your Linkme username
      </label>

      <div className="flex min-w-0 flex-1 items-center">
        <span className="shrink-0 text-[15px] font-medium text-zinc-400">
          {prefix}
        </span>
        <Input
          id="hero-username"
          name="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder={placeholder}
          autoComplete="username"
          className="h-12 border-0 bg-transparent px-0 text-[15px] text-zinc-800 shadow-none placeholder:text-zinc-400 focus-visible:border-transparent focus-visible:ring-0 md:text-[15px] dark:bg-transparent dark:disabled:bg-transparent"
        />
      </div>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex h-12 shrink-0 items-center justify-center rounded-[9999px] bg-black px-5 text-[14px] font-semibold tracking-[-0.01em] text-white transition-colors hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-6 sm:text-[15px]"
      >
        {buttonLabel}
      </motion.button>
    </motion.form>
  )
}
