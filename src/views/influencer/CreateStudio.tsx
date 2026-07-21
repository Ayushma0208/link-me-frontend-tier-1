'use client'

import { useSearchParams } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { CircleDot, ImagePlus, Pencil, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import { cn } from '@/lib/utils'

const CREATE_OPTIONS = [
  {
    id: 'post',
    title: 'Create Post',
    description: 'Publish an image, video, reel, or carousel — public, subscribers, or PPV.',
    href: '/influencer/create/post',
    icon: ImagePlus,
    accent: 'from-violet-500/25 to-fuchsia-500/20',
  },
  {
    id: 'story',
    title: 'Upload Story',
    description: 'Share a 24-hour story that fans can watch from your profile.',
    href: '/influencer/stories',
    icon: CircleDot,
    accent: 'from-pink-500/25 to-orange-500/20',
  },
  {
    id: 'highlight',
    title: 'Add Highlight',
    description: 'Pin lasting story collections on your public page.',
    href: '/influencer/highlights',
    icon: Sparkles,
    accent: 'from-amber-500/25 to-pink-500/20',
  },
  {
    id: 'profile',
    title: 'Edit Profile',
    description: 'Update bio, cover, theme, and how your page looks.',
    href: '/influencer/settings',
    icon: Pencil,
    accent: 'from-sky-500/25 to-violet-500/20',
  },
] as const

export function CreateStudio() {
  const prefersReducedMotion = useReducedMotion()
  const searchParams = useSearchParams()
  const focus = searchParams.get('type')

  return (
    <div>
      <StudioPageHeader
        title="Create"
        description="Start something new — posts, stories, highlights, or profile updates."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {CREATE_OPTIONS.map((option, index) => {
          const active = focus === option.id
          return (
            <motion.div
              key={option.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={prefersReducedMotion ? undefined : { y: -3 }}
            >
              <Link href={option.href} className="block h-full">
                <StudioGlassCard
                  glow={active ? 'creator' : 'soft'}
                  className={cn(
                    'h-full p-5 transition',
                    active && 'ring-1 ring-fuchsia-400/35'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br',
                      option.accent
                    )}
                  >
                    <option.icon className="size-5 text-white" />
                  </span>
                  <h2 className="mt-4 text-lg font-bold text-white">
                    {option.title}
                  </h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/45">
                    {option.description}
                  </p>
                  <span className="mt-4 inline-flex text-[12px] font-semibold text-fuchsia-300">
                    Continue →
                  </span>
                </StudioGlassCard>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
