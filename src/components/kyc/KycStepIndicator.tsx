'use client'

import { motion, useReducedMotion } from 'framer-motion'

import type { KycSignupStep } from '@/lib/kyc/types'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1 as const, label: 'Account' },
  { id: 2 as const, label: 'Documents' },
  { id: 3 as const, label: 'Face verify' },
]

interface KycStepIndicatorProps {
  currentStep: KycSignupStep
  className?: string
}

export function KycStepIndicator({ currentStep, className }: KycStepIndicatorProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <nav aria-label="KYC signup progress" className={cn('w-full', className)}>
      <ol className="grid grid-cols-3 gap-2">
        {STEPS.map((step, index) => {
          const isComplete = currentStep > step.id
          const isCurrent = currentStep === step.id

          return (
            <li key={step.id} className="flex flex-col items-center text-center">
              <div className="flex w-full items-center">
                {index > 0 ? (
                  <span
                    aria-hidden
                    className={cn(
                      'h-px flex-1',
                      isComplete || isCurrent ? 'bg-fuchsia-400/50' : 'bg-white/10'
                    )}
                  />
                ) : (
                  <span className="flex-1" aria-hidden />
                )}

                <motion.span
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold',
                    isComplete &&
                      'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.35)]',
                    isCurrent &&
                      'border border-fuchsia-300/60 bg-fuchsia-500/15 text-fuchsia-100 ring-2 ring-fuchsia-400/35',
                    !isComplete &&
                      !isCurrent &&
                      'border border-white/10 bg-white/[0.04] text-white/35'
                  )}
                  animate={
                    prefersReducedMotion || !isCurrent
                      ? undefined
                      : { scale: [1, 1.04, 1] }
                  }
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {isComplete ? '✓' : step.id}
                </motion.span>

                {index < STEPS.length - 1 ? (
                  <span
                    aria-hidden
                    className={cn(
                      'h-px flex-1',
                      currentStep > step.id ? 'bg-fuchsia-400/50' : 'bg-white/10'
                    )}
                  />
                ) : (
                  <span className="flex-1" aria-hidden />
                )}
              </div>

              <span
                className={cn(
                  'mt-2 text-[11px] font-medium tracking-[0.08em] uppercase',
                  isCurrent ? 'text-fuchsia-200' : isComplete ? 'text-white/55' : 'text-white/30'
                )}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
