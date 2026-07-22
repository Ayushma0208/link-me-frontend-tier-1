export type KycSignupStep = 1 | 2 | 3

export type KycAuthMethod = 'email' | 'google'

export interface CreatorKycProfile {
  name: string
  username: string
  email: string
  password: string
}

export interface CreatorKycDocuments {
  aadhaar: File | null
  pan: File | null
}

export type KycDocumentKind = keyof CreatorKycDocuments

export interface CreatorKycDraft {
  step: KycSignupStep
  authMethod: KycAuthMethod | null
  profile: CreatorKycProfile | null
  googleIdToken: string | null
  documents: CreatorKycDocuments
  selfie: Blob | null
}

export const INITIAL_KYC_DRAFT: CreatorKycDraft = {
  step: 1,
  authMethod: null,
  profile: null,
  googleIdToken: null,
  documents: { aadhaar: null, pan: null },
  selfie: null,
}

export const KYC_DOCUMENT_ACCEPT = 'image/jpeg,image/png,image/webp'
export const KYC_DOCUMENT_MAX_BYTES = 5 * 1024 * 1024
