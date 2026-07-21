'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Coffee,
  CreditCard,
  Crown,
  MessageSquare,
  PhoneCall,
  Radio,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import { CallsStudio } from '@/views/influencer/CallsStudio'
import { CoffeeStudio } from '@/views/influencer/CoffeeStudio'
import { ExclusivePricingStudio } from '@/views/influencer/ExclusivePricingStudio'
import { LiveEventsStudio } from '@/views/influencer/LiveEventsStudio'
import { PlansStudio } from '@/views/influencer/PlansStudio'
import { cn } from '@/lib/utils'

type SectionId = 'overview' | 'plans' | 'coffee' | 'live' | 'calls'

type Section = {
  id: SectionId
  label: string
  shortLabel: string
  description: string
  icon: LucideIcon
  tone: string
}

const SECTIONS: Section[] = [
  {
    id: 'plans',
    label: 'Subscriptions & PPV',
    shortLabel: 'Plans',
    description:
      'Offer one-time pay-per-post unlocks or memberships that unlock every Subscribers Only post.',
    icon: CreditCard,
    tone: 'from-violet-500/20 to-fuchsia-500/10 text-fuchsia-200',
  },
  {
    id: 'coffee',
    label: 'Buy Me a Coffee',
    shortLabel: 'Coffee',
    description:
      'Turn fan tips on or off and customize your coffee button and thank-you message.',
    icon: Coffee,
    tone: 'from-amber-500/20 to-orange-500/10 text-amber-200',
  },
  {
    id: 'live',
    label: 'Live Event Plans',
    shortLabel: 'Live',
    description:
      'Create free or ticketed live events, schedule broadcasts, and set emoji pricing.',
    icon: Radio,
    tone: 'from-rose-500/20 to-pink-500/10 text-rose-200',
  },
  {
    id: 'calls',
    label: 'Voice & Video Calls',
    shortLabel: 'Calls',
    description:
      'Control availability and set separate per-minute voice and video call rates.',
    icon: PhoneCall,
    tone: 'from-sky-500/20 to-cyan-500/10 text-sky-200',
  },
]

export function MonetizationStudio() {
  const [active, setActive] = useState<SectionId>('overview')

  return (
    <div>
      <StudioPageHeader
        title="Monetization"
        description="Manage every way you earn from one place — memberships, exclusives, messages, coffee, live events, and calls."
      />

      <div className="sticky top-3 z-30 mb-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#0a0a10]/90 p-1.5 shadow-2xl backdrop-blur-xl">
        <div className="flex min-w-max gap-1">
          <button
            type="button"
            onClick={() => setActive('overview')}
            className={tabClass(active === 'overview')}
          >
            <Sparkles className="size-4" />
            Overview
          </button>
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActive(section.id)}
              className={tabClass(active === section.id)}
            >
              <section.icon className="size-4" />
              <span className="hidden sm:inline">{section.label}</span>
              <span className="sm:hidden">{section.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {active === 'overview' ? (
        <div>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white">Earning tools</h2>
            <p className="mt-1 text-sm text-white/45">
              Choose a tool to configure it without leaving this page.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActive(section.id)}
                className="text-left"
              >
                <StudioGlassCard className="group h-full p-5 transition hover:-translate-y-1 hover:border-white/20">
                  <div
                    className={cn(
                      'flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br',
                      section.tone
                    )}
                  >
                    <section.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-white">
                    {section.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/45">
                    {section.description}
                  </p>
                  <span className="mt-5 inline-flex text-xs font-semibold text-fuchsia-300 transition group-hover:text-fuchsia-200">
                    Manage settings →
                  </span>
                </StudioGlassCard>
              </button>
            ))}
          </div>

          <StudioGlassCard className="mt-6 flex items-start gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                Message types are included
              </h3>
              <p className="mt-1 text-sm text-white/45">
                Open Subscriptions & PPV to price text messages, images,
                voice notes, timed packages, and per-minute chats.
              </p>
            </div>
          </StudioGlassCard>
        </div>
      ) : null}

      {active === 'plans' ? (
        <div>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <StudioGlassCard className="border-amber-400/15 p-5">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-200">
                  <Zap className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">
                    Pay per post (PPV)
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-white/45">
                    A fan pays once to unlock only that post. They do not need a
                    subscription. Select <strong className="text-white/70">Pay Per View</strong>{' '}
                    while creating the post and set its price.
                  </p>
                  <Link
                    href="/influencer/create/post"
                    className="mt-3 inline-flex text-xs font-semibold text-amber-300 hover:text-amber-200"
                  >
                    Create a PPV post →
                  </Link>
                </div>
              </div>
            </StudioGlassCard>

            <StudioGlassCard className="border-fuchsia-400/15 p-5">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-200">
                  <Crown className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">
                    Monthly or yearly subscription
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-white/45">
                    An active member can access all posts marked{' '}
                    <strong className="text-white/70">Subscribers Only</strong>.
                    PPV posts remain separate one-time purchases.
                  </p>
                  <Link
                    href="/influencer/create/post"
                    className="mt-3 inline-flex text-xs font-semibold text-fuchsia-300 hover:text-fuchsia-200"
                  >
                    Create a subscriber post →
                  </Link>
                </div>
              </div>
            </StudioGlassCard>
          </div>

          <ExclusivePricingStudio />

          <div className="my-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          <PlansStudio />
        </div>
      ) : null}
      {active === 'coffee' ? <CoffeeStudio /> : null}
      {active === 'live' ? <LiveEventsStudio /> : null}
      {active === 'calls' ? <CallsStudio /> : null}
    </div>
  )
}

function tabClass(active: boolean) {
  return cn(
    'inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition',
    active
      ? 'bg-gradient-to-r from-violet-500/30 via-fuchsia-500/25 to-pink-500/20 text-white ring-1 ring-fuchsia-400/25'
      : 'text-white/45 hover:bg-white/[0.05] hover:text-white/80'
  )
}
