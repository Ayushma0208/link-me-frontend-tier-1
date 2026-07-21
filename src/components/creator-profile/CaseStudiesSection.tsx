'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ChevronDown } from 'lucide-react'

import type { PublicCaseStudy } from '@/data/public-creator'
import { cn } from '@/lib/utils'

export interface CaseStudiesSectionProps {
  items: PublicCaseStudy[]
  className?: string
}

function CaseStudyCard({
  study,
  index,
  prefersReducedMotion,
}: {
  study: PublicCaseStudy
  index: number
  prefersReducedMotion: boolean | null
}) {
  const [open, setOpen] = useState(index === 0)

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04]"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-col text-left sm:flex-row"
        aria-expanded={open}
      >
        <div className="relative aspect-[16/10] w-full shrink-0 sm:aspect-auto sm:h-auto sm:w-[220px] lg:w-[260px]">
          <Image
            src={study.coverImage}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:640px) 100vw, 260px"
          />
          {study.industry ? (
            <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
              {study.industry}
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-white/40 uppercase">
              {study.brand}
            </p>
            <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-white sm:text-[17px]">
              {study.title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-white/50">
              {study.summary}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            {study.metrics?.length ? (
              <div className="flex flex-wrap gap-2">
                {study.metrics.slice(0, 3).map((m) => (
                  <span
                    key={m.label}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/70"
                  >
                    <span className="font-semibold text-white">{m.value}</span>{' '}
                    <span className="text-white/40">{m.label}</span>
                  </span>
                ))}
              </div>
            ) : (
              <span />
            )}
            <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-white/55">
              {open ? 'Hide' : 'Case study'}
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform',
                  open && 'rotate-180'
                )}
              />
            </span>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-white/8 px-4 py-4 sm:px-5 sm:py-5">
              {[
                { label: 'Problem', body: study.problem },
                { label: 'Solution', body: study.solution },
                { label: 'Results', body: study.results },
              ].map((block) => (
                <div
                  key={block.label}
                  className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3.5"
                >
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-white/40 uppercase">
                    <ArrowUpRight className="size-3.5 text-fuchsia-300" aria-hidden />
                    {block.label}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/65">
                    {block.body}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  )
}

export function CaseStudiesSection({ items, className }: CaseStudiesSectionProps) {
  const prefersReducedMotion = useReducedMotion()

  if (!items.length) {
    return (
      <div
        className={cn(
          'rounded-[24px] border border-dashed border-white/12 bg-white/[0.02] px-5 py-10 text-center',
          className
        )}
      >
        <p className="text-[15px] font-semibold text-white">No case studies yet</p>
        <p className="mt-1.5 text-[13px] text-white/45">
          Brand collaborations will show up here as Problem → Solution → Results.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Case studies</h2>
        <p className="mt-1 text-[13px] text-white/40">
          Past brand work structured as Problem → Solution → Results.
        </p>
      </div>
      <div className="space-y-3">
        {items.map((study, index) => (
          <CaseStudyCard
            key={study.id}
            study={study}
            index={index}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>
    </div>
  )
}
