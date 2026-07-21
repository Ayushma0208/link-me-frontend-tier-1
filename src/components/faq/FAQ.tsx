'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { faqs } from '@/data/landing'
import { cn } from '@/lib/utils'

interface FAQProps {
  className?: string
}

export function FAQ({ className }: FAQProps) {
  const prefersReducedMotion = useReducedMotion()
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null)

  return (
    <section
      id="faq"
      className={cn('relative bg-black py-20 sm:py-28', className)}
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-[800px] px-5 sm:px-8 lg:px-16">
        <div className="text-center">
          <p className="text-[12px] font-medium tracking-[0.18em] text-white/45 uppercase">FAQ</p>
          <h2
            id="faq-heading"
            className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl"
          >
            Questions, answered
          </h2>
        </div>

        <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {faqs.map((item) => {
            const isOpen = openId === item.id
            return (
              <div key={item.id}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.id}`}
                    id={`faq-button-${item.id}`}
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    <span className="text-[15px] font-semibold tracking-[-0.01em] text-white sm:text-base">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'size-5 shrink-0 text-white/50 transition-transform duration-300',
                        isOpen && 'rotate-180'
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={`faq-panel-${item.id}`}
                      role="region"
                      aria-labelledby={`faq-button-${item.id}`}
                      initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed text-white/60 sm:text-[15px]">
                        {item.answer}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
