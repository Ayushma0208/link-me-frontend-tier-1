'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

import { DocumentUploadField } from '@/components/kyc/DocumentUploadField'
import type { CreatorKycDocuments, KycDocumentKind } from '@/lib/kyc/types'
import { cn } from '@/lib/utils'

interface KycDocumentUploadStepProps {
  documents: CreatorKycDocuments
  error?: string
  onDocumentChange: (kind: KycDocumentKind, file: File | null) => void
  onError: (message: string) => void
  onBack: () => void
  onNext: () => void
}

export function KycDocumentUploadStep({
  documents,
  error,
  onDocumentChange,
  onError,
  onBack,
  onNext,
}: KycDocumentUploadStepProps) {
  const prefersReducedMotion = useReducedMotion()
  const canContinue = Boolean(documents.aadhaar && documents.pan)

  return (
    <div>
      <div className="text-center">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-transparent uppercase bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text">
          Identity verification
        </p>
        <h2 className="mt-2 text-[1.45rem] font-extrabold tracking-[-0.04em] text-white sm:text-[1.6rem]">
          Upload your documents
        </h2>
        <p className="mx-auto mt-2 max-w-[36ch] text-[14px] leading-relaxed text-white/55">
          Upload clear photos of your Aadhaar and PAN cards. Make sure details are readable with
          no glare.
        </p>
      </div>

      <div className="mt-7 space-y-5">
        {error ? (
          <p className="rounded-2xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-200">
            {error}
          </p>
        ) : null}

        <DocumentUploadField
          label="Aadhaar card"
          kind="aadhaar"
          file={documents.aadhaar}
          onFileChange={onDocumentChange}
          onError={onError}
        />
        <DocumentUploadField
          label="PAN card"
          kind="pan"
          file={documents.pan}
          onFileChange={onDocumentChange}
          onError={onError}
        />
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          className={cn(
            'flex h-12 flex-1 items-center justify-center rounded-full',
            'border border-white/15 bg-white/[0.04] text-[15px] font-semibold text-white/80',
            'transition-colors hover:border-white/25 hover:bg-white/[0.07]'
          )}
        >
          Back
        </motion.button>

        <motion.button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          whileHover={prefersReducedMotion || !canContinue ? undefined : { y: -2 }}
          whileTap={prefersReducedMotion || !canContinue ? undefined : { scale: 0.985 }}
          className={cn(
            'flex h-12 flex-1 items-center justify-center rounded-full',
            'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
            'text-[15px] font-semibold text-white',
            'shadow-[0_12px_40px_rgba(217,70,239,0.4)]',
            'transition-shadow duration-200 hover:shadow-[0_16px_48px_rgba(236,72,153,0.45)]',
            'disabled:pointer-events-none disabled:opacity-55'
          )}
        >
          Next
        </motion.button>
      </div>

      <p className="mt-6 text-center text-[13px] text-white/45">
        Already have an account?{' '}
        <Link
          href="/login?role=creator"
          className="font-medium text-white underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  )
}
