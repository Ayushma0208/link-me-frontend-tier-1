import { api } from '@/lib/api'

export type MediaPurpose =
  | 'AVATAR'
  | 'COVER'
  | 'POST'
  | 'STORY'
  | 'REEL'
  | 'CHAT'
  | 'OTHER'

export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT'

export interface PresignedUpload {
  url: string
  method: 'PUT' | 'POST'
  headers?: Record<string, string>
  fields?: Record<string, string>
  key: string
  provider?: string
  stub?: boolean
}

export interface MediaAsset {
  id: string
  url?: string | null
  storageKey?: string
}

/** Cloudinary recommends chunked upload above ~100MB; use 6MB chunks. */
const CLOUDINARY_CHUNK_THRESHOLD = 20 * 1024 * 1024
const CLOUDINARY_CHUNK_SIZE = 6 * 1024 * 1024

function uniqueUploadId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `upload_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

/**
 * Cloudinary large-file upload via Content-Range chunks.
 * Required for videos over ~100MB (e.g. long posts / stories).
 */
async function uploadCloudinaryChunked(
  file: File,
  upload: PresignedUpload
): Promise<string | null> {
  const total = file.size
  const uploadId = uniqueUploadId()
  let deliveredUrl: string | null = null

  for (let start = 0; start < total; start += CLOUDINARY_CHUNK_SIZE) {
    const end = Math.min(start + CLOUDINARY_CHUNK_SIZE, total) - 1
    const blob = file.slice(start, end + 1)

    const form = new FormData()
    if (upload.fields) {
      for (const [key, value] of Object.entries(upload.fields)) {
        form.append(key, value)
      }
    }
    form.append('file', blob, file.name || 'upload.bin')

    const res = await fetch(upload.url, {
      method: 'POST',
      headers: {
        'X-Unique-Upload-Id': uploadId,
        'Content-Range': `bytes ${start}-${end}/${total}`,
      },
      body: form,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(
        `Upload failed (${res.status})${errText ? `: ${errText.slice(0, 200)}` : ''}`
      )
    }

    // Final chunk returns the asset JSON with secure_url.
    if (end === total - 1) {
      try {
        const json = (await res.json()) as {
          secure_url?: string
          url?: string
        }
        deliveredUrl = json.secure_url ?? json.url ?? null
      } catch {
        deliveredUrl = null
      }
    }
  }

  return deliveredUrl
}

async function uploadCloudinarySingle(
  file: File,
  upload: PresignedUpload
): Promise<string | null> {
  const form = new FormData()
  if (upload.fields) {
    for (const [key, value] of Object.entries(upload.fields)) {
      form.append(key, value)
    }
  }
  form.append('file', file)
  const res = await fetch(upload.url, { method: 'POST', body: form })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(
      `Upload failed (${res.status})${errText ? `: ${errText.slice(0, 200)}` : ''}`
    )
  }
  try {
    const json = (await res.json()) as { secure_url?: string; url?: string }
    return json.secure_url ?? json.url ?? null
  } catch {
    return null
  }
}

/**
 * Presign → upload to storage (S3 PUT or Cloudinary POST) → complete.
 * Large Cloudinary videos use chunked upload so 1h+ files are not blocked at ~100MB.
 */
export async function uploadMediaFile(params: {
  file: File
  purpose: MediaPurpose
  type: MediaType
}): Promise<{ asset: MediaAsset; url: string | null }> {
  const { file, purpose, type } = params

  const presign = await api<{
    asset: MediaAsset
    upload: PresignedUpload
  }>('/media/presign', {
    method: 'POST',
    body: JSON.stringify({
      purpose,
      type,
      mimeType: file.type || 'application/octet-stream',
      filename: file.name || 'upload.bin',
      sizeBytes: file.size,
    }),
  })

  const { upload } = presign
  let deliveredUrl: string | null = null

  if (upload.method === 'POST' || upload.fields) {
    const isCloudinary =
      upload.provider === 'cloudinary' ||
      upload.url.includes('api.cloudinary.com')

    if (isCloudinary && file.size > CLOUDINARY_CHUNK_THRESHOLD) {
      deliveredUrl = await uploadCloudinaryChunked(file, upload)
    } else {
      deliveredUrl = await uploadCloudinarySingle(file, upload)
    }
  } else {
    const headers = new Headers(upload.headers)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', file.type || 'application/octet-stream')
    }
    const res = await fetch(upload.url, {
      method: 'PUT',
      headers,
      body: file,
    })
    if (!res.ok) {
      throw new Error(`Upload failed (${res.status})`)
    }
  }

  const completed = await api<{ asset: MediaAsset }>(
    `/media/${presign.asset.id}/complete`,
    {
      method: 'POST',
      body: JSON.stringify({
        sizeBytes: file.size,
        ...(deliveredUrl ? { url: deliveredUrl } : {}),
      }),
    }
  )

  return {
    asset: completed.asset,
    url: completed.asset.url ?? deliveredUrl,
  }
}
