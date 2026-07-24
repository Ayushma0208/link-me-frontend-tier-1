'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { ApiError } from '@/lib/api'
import { kycStatus, type KycStatus, type KycStatusResponse } from '@/lib/kyc/api'
import { submitCreatorKyc } from '@/lib/kyc/submit-kyc'
import {
  INITIAL_KYC_DRAFT,
  KYC_DOCUMENT_MAX_BYTES,
  type CreatorKycDraft,
  type CreatorKycProfile,
  type KycDocumentKind,
  type KycSignupStep,
} from '@/lib/kyc/types'

function validateProfile(profile: CreatorKycProfile): string | null {
  const name = profile.name.trim()
  const username = profile.username.trim().toLowerCase()
  const email = profile.email.trim()

  if (name.length < 2) return 'Name must be at least 2 characters.'
  if (username.length < 3) return 'Username must be at least 3 characters.'
  if (username.length > 30) return 'Username must be at most 30 characters.'
  if (!/^[a-z0-9_]+$/.test(username)) {
    return 'Username can only contain lowercase letters, numbers, and underscores.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
  if (profile.password.length < 8) return 'Password must be at least 8 characters.'

  return null
}

function validateDocuments(draft: CreatorKycDraft): string | null {
  const { aadhaar, pan } = draft.documents
  if (!aadhaar || !pan) {
    return 'Upload both your Aadhaar and PAN card images to continue.'
  }
  if (aadhaar.size > KYC_DOCUMENT_MAX_BYTES || pan.size > KYC_DOCUMENT_MAX_BYTES) {
    return 'Each document must be 5 MB or smaller.'
  }
  return null
}

const TERMINAL_STATUSES = new Set<KycStatus>([
  'APPROVED',
  'REJECTED',
  'REVIEW_REQUIRED',
])

export function useCreatorKycSignup() {
  const [draft, setDraft] = useState<CreatorKycDraft>(INITIAL_KYC_DRAFT)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [kycStatusState, setKycStatusState] = useState<KycStatusResponse | null>(
    null
  )
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const pollKycStatus = useCallback(async () => {
    const status = await kycStatus()
    setKycStatusState(status)
    if (TERMINAL_STATUSES.has(status.status)) {
      stopPolling()
    }
    return status
  }, [stopPolling])

  useEffect(() => {
    if (!submitted) return

    void pollKycStatus()
    pollRef.current = setInterval(() => {
      void pollKycStatus().catch(() => undefined)
    }, 4000)

    return stopPolling
  }, [submitted, pollKycStatus, stopPolling])

  const goToStep = useCallback((step: KycSignupStep) => {
    setDraft((prev) => ({ ...prev, step }))
    setError('')
  }, [])

  const setProfile = useCallback((profile: CreatorKycProfile) => {
    const message = validateProfile(profile)
    if (message) {
      setError(message)
      return false
    }

    setDraft((prev) => ({
      ...prev,
      authMethod: 'email',
      profile,
      googleIdToken: null,
      step: 2,
    }))
    setError('')
    return true
  }, [])

  const setGoogleToken = useCallback((token: string) => {
    setDraft((prev) => ({
      ...prev,
      authMethod: 'google',
      googleIdToken: token,
      profile: null,
      step: 2,
    }))
    setError('')
  }, [])

  const setDocument = useCallback((kind: KycDocumentKind, file: File | null) => {
    setDraft((prev) => ({
      ...prev,
      documents: { ...prev.documents, [kind]: file },
    }))
    setError('')
  }, [])

  const setSelfie = useCallback((selfie: Blob | null) => {
    setDraft((prev) => ({ ...prev, selfie }))
    setError('')
  }, [])

  const nextStep = useCallback(() => {
    setDraft((prev) => {
      if (prev.step !== 2) return prev

      const message = validateDocuments(prev)
      if (message) {
        setError(message)
        return prev
      }

      setError('')
      return { ...prev, step: 3 }
    })
  }, [])

  const prevStep = useCallback(() => {
    setDraft((prev) => {
      if (prev.step <= 1) return prev
      setError('')
      return { ...prev, step: (prev.step - 1) as KycSignupStep }
    })
  }, [])

  const submitKyc = useCallback(async () => {
    if (!draft.selfie) {
      setError('Capture a live selfie before submitting verification.')
      return false
    }

    if (draft.authMethod === 'email' && !draft.profile) {
      setError('Account details are missing. Go back to Step 1.')
      return false
    }

    if (draft.authMethod === 'google' && !draft.googleIdToken) {
      setError('Google sign-in is incomplete. Go back to Step 1.')
      return false
    }

    const docError = validateDocuments(draft)
    if (docError) {
      setError(docError)
      return false
    }

    setSubmitting(true)
    setError('')

    try {
      const result = await submitCreatorKyc(draft)
      setKycStatusState({ status: result.status })
      setSubmitted(true)
      return true
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Verification submission failed. Please try again.'
      setError(message)
      return false
    } finally {
      setSubmitting(false)
    }
  }, [draft])

  return {
    draft,
    submitted,
    submitting,
    error,
    kycStatus: kycStatusState,
    setError,
    goToStep,
    setProfile,
    setGoogleToken,
    setDocument,
    setSelfie,
    nextStep,
    prevStep,
    submitKyc,
  }
}
