'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { RegisterGlassCard } from '@/components/auth/RegisterGlassCard'
import { CreatorSignupStepGeneral } from '@/components/kyc/CreatorSignupStepGeneral'
import { KycDocumentUploadStep } from '@/components/kyc/KycDocumentUploadStep'
import { KycFaceCaptureStep } from '@/components/kyc/KycFaceCaptureStep'
import { KycStepIndicator } from '@/components/kyc/KycStepIndicator'
import { KycSubmissionPending } from '@/components/kyc/KycSubmissionPending'
import { useCreatorKycSignup } from '@/hooks/useCreatorKycSignup'

interface CreatorRegisterWizardProps {
  initialUsername?: string
  onSwitchRole: () => void
  className?: string
}

export function CreatorRegisterWizard({
  initialUsername = '',
  onSwitchRole,
  className,
}: CreatorRegisterWizardProps) {
  const prefersReducedMotion = useReducedMotion()
  const {
    draft,
    submitted,
    submitting,
    error,
    setError,
    setProfile,
    setGoogleToken,
    setDocument,
    setSelfie,
    nextStep,
    prevStep,
    submitKyc,
  } = useCreatorKycSignup()

  return (
    <RegisterGlassCard accent="creator" className={className}>
      {submitted ? (
        <KycSubmissionPending />
      ) : (
        <>
          <KycStepIndicator currentStep={draft.step} className="mb-8" />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={draft.step}
              initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {draft.step === 1 ? (
                <CreatorSignupStepGeneral
                  initialUsername={initialUsername}
                  initialProfile={draft.profile}
                  error={error}
                  onSwitchRole={onSwitchRole}
                  onContinueEmail={setProfile}
                  onContinueGoogle={setGoogleToken}
                  onError={setError}
                />
              ) : null}

              {draft.step === 2 ? (
                <KycDocumentUploadStep
                  documents={draft.documents}
                  error={error}
                  onDocumentChange={setDocument}
                  onError={setError}
                  onBack={prevStep}
                  onNext={nextStep}
                />
              ) : null}

              {draft.step === 3 ? (
                <KycFaceCaptureStep
                  selfie={draft.selfie}
                  error={error}
                  submitting={submitting}
                  onSelfieChange={setSelfie}
                  onError={setError}
                  onBack={prevStep}
                  onSubmit={() => void submitKyc()}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </RegisterGlassCard>
  )
}
