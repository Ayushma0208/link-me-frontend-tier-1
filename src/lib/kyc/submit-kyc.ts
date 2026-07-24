import { api, setTokens } from '@/lib/api'
import {
  mapBackendTokens,
  mapBackendUser,
  toBackendRole,
  type BackendAuthResult,
} from '@/lib/auth-map'
import type { CreatorKycDraft } from '@/lib/kyc/types'
import {
  kycPresign,
  kycSubmit,
  uploadPresignedFile,
  type KycSubmitResponse,
} from '@/lib/kyc/api'

function selfieFilename(selfie: Blob) {
  const type = selfie.type || 'image/jpeg'
  if (type.includes('png')) return 'selfie.png'
  if (type.includes('webp')) return 'selfie.webp'
  return 'selfie.jpg'
}

async function authenticateDraft(draft: CreatorKycDraft) {
  if (draft.authMethod === 'google') {
    if (!draft.googleIdToken) throw new Error('Google sign-in is incomplete.')
    const result = await api<BackendAuthResult>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        idToken: draft.googleIdToken,
        role: toBackendRole('creator'),
      }),
    })
    setTokens(mapBackendTokens(result.tokens))
    return mapBackendUser(result.user)
  }

  if (!draft.profile) throw new Error('Account details are missing.')
  const result = await api<BackendAuthResult>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: draft.profile.email.trim(),
      password: draft.profile.password,
      displayName: draft.profile.name.trim(),
      username: draft.profile.username.trim().toLowerCase(),
      role: toBackendRole('creator'),
    }),
  })
  setTokens(mapBackendTokens(result.tokens))
  return mapBackendUser(result.user)
}

export async function submitCreatorKyc(
  draft: CreatorKycDraft
): Promise<KycSubmitResponse> {
  if (!draft.selfie) throw new Error('Capture a live selfie before submitting.')
  if (!draft.documents.aadhaar || !draft.documents.pan) {
    throw new Error('Upload both your Aadhaar and PAN card images.')
  }

  await authenticateDraft(draft)

  const presign = await kycPresign([
    {
      kind: 'aadhaar',
      filename: draft.documents.aadhaar.name,
      mimeType: draft.documents.aadhaar.type || 'image/jpeg',
      sizeBytes: draft.documents.aadhaar.size,
    },
    {
      kind: 'pan',
      filename: draft.documents.pan.name,
      mimeType: draft.documents.pan.type || 'image/jpeg',
      sizeBytes: draft.documents.pan.size,
    },
    {
      kind: 'selfie',
      filename: selfieFilename(draft.selfie),
      mimeType: draft.selfie.type || 'image/jpeg',
      sizeBytes: draft.selfie.size,
    },
  ])

  const byKind = Object.fromEntries(
    presign.uploads.map((u) => [u.kind, u])
  ) as Record<'aadhaar' | 'pan' | 'selfie', (typeof presign.uploads)[0]>

  await Promise.all([
    uploadPresignedFile(byKind.aadhaar, draft.documents.aadhaar),
    uploadPresignedFile(byKind.pan, draft.documents.pan),
    uploadPresignedFile(byKind.selfie, draft.selfie),
  ])

  return kycSubmit({
    aadhaarMediaId: byKind.aadhaar.mediaId,
    panMediaId: byKind.pan.mediaId,
    selfieMediaId: byKind.selfie.mediaId,
  })
}
