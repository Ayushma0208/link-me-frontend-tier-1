/** Placeholder used when no safe image URL is available. */
export const MEDIA_IMAGE_FALLBACK =
  'https://picsum.photos/id/1015/900/1100'

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|mkv)(\?|#|$)/i

/** True when the URL points at a video asset (Cloudinary video/upload or file ext). */
export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false
  const u = url.toLowerCase()
  if (u.includes('/video/upload/')) return true
  if (u.startsWith('data:video/')) return true
  return VIDEO_EXT.test(u)
}

/**
 * Cloudinary first-frame poster for a video delivery URL.
 * Returns null when the URL is not a Cloudinary video URL.
 */
export function cloudinaryVideoPoster(
  url: string | null | undefined
): string | null {
  if (!url || !url.includes('/video/upload/')) return null
  let out = url.replace('/video/upload/', '/video/upload/so_0,f_jpg/')
  out = out.replace(/\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i, '.jpg$2')
  return out
}

/**
 * Resolve a URL that is safe to pass to `next/image` / `<img>`.
 * Video URLs are converted to a Cloudinary poster or the fallback.
 */
export function imageSrcForDisplay(
  url: string | null | undefined,
  fallback: string = MEDIA_IMAGE_FALLBACK
): string {
  if (!url) return fallback
  if (!isVideoUrl(url)) return url
  return cloudinaryVideoPoster(url) ?? fallback
}

/** Prefer real image candidates; never return a raw video URL. */
export function pickImageSrc(
  ...candidates: Array<string | null | undefined>
): string {
  for (const c of candidates) {
    if (!c) continue
    if (!isVideoUrl(c)) return c
    const poster = cloudinaryVideoPoster(c)
    if (poster) return poster
  }
  return MEDIA_IMAGE_FALLBACK
}
