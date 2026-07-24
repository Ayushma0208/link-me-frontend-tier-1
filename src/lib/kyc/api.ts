import { api } from '@/lib/api'

export type KycDocumentKind = 'aadhaar' | 'pan' | 'selfie'

export type KycStatus =
  | 'NOT_SUBMITTED'
  | 'PROCESSING'
  | 'APPROVED'
  | 'REVIEW_REQUIRED'
  | 'REJECTED'

export type KycPresignUpload = {
  kind: KycDocumentKind
  mediaId: string
  url: string
  method: 'PUT' | 'POST'
  headers: Record<string, string>
  fields?: Record<string, string>
  expiresIn: number
}

export type KycStatusResponse = {
  status: KycStatus
  matchScore?: number | null
  verifyFlags?: string[] | null
  rejectionReason?: string | null
  submittedAt?: string | null
  reviewedAt?: string | null
}

export type KycSubmitResponse = {
  applicationId: string
  status: KycStatus
}

export async function kycPresign(
  files: Array<{
    kind: KycDocumentKind
    filename: string
    mimeType: string
    sizeBytes: number
  }>
) {
  return api<{ uploads: KycPresignUpload[] }>('/kyc/presign', {
    method: 'POST',
    body: JSON.stringify({ files }),
  })
}

export async function kycSubmit(input: {
  aadhaarMediaId: string
  panMediaId: string
  selfieMediaId: string
}) {
  return api<KycSubmitResponse>('/kyc/submit', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function kycStatus() {
  return api<KycStatusResponse>('/kyc/status')
}

export async function uploadPresignedFile(
  upload: KycPresignUpload,
  body: Blob | File,
  filename = 'upload.jpg'
) {
  if (upload.method === 'POST' || upload.fields) {
    const form = new FormData()
    if (upload.fields) {
      for (const [key, value] of Object.entries(upload.fields)) {
        form.append(key, value)
      }
    }
    const file =
      body instanceof File
        ? body
        : new File([body], filename, { type: body.type || 'image/jpeg' })
    form.append('file', file)
    const res = await fetch(upload.url, { method: 'POST', body: form })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(
        `Upload failed for ${upload.kind}${errText ? `: ${errText.slice(0, 200)}` : ''}`
      )
    }
    return
  }

  const headers = new Headers(upload.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', body.type || 'image/jpeg')
  }
  const res = await fetch(upload.url, {
    method: upload.method,
    headers,
    body,
  })
  if (!res.ok) {
    throw new Error(`Upload failed for ${upload.kind}`)
  }
}
