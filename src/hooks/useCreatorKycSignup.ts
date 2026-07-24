'use client'

import { useCallback, useState } from 'react'

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

export function useCreatorKycSignup() {
  const [draft, setDraft] = useState<CreatorKycDraft>(INITIAL_KYC_DRAFT)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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
      await new Promise((resolve) => setTimeout(resolve, 900))

      if (process.env.NODE_ENV !== 'production') {
        console.debug('[KYC stub submit]', {
          authMethod: draft.authMethod,
          profile: draft.profile
            ? {
                name: draft.profile.name,
                username: draft.profile.username,
                email: draft.profile.email,
              }
            : null,
          googleIdTokenPresent: Boolean(draft.googleIdToken),
          documents: {
            aadhaar: draft.documents.aadhaar?.name,
            pan: draft.documents.pan?.name,
          },
          selfieBytes: draft.selfie.size,
        })
      }

      setSubmitted(true)
      return true
    } catch {
      setError('Verification submission failed. Please try again.')
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
