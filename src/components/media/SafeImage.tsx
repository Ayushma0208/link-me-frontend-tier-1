'use client'

import Image, { type ImageProps } from 'next/image'
import {
  imageSrcForDisplay,
  MEDIA_IMAGE_FALLBACK,
} from '@/lib/media-url'

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src: string | null | undefined
  /** Used when src is missing or is a video with no poster. */
  fallback?: string
}

/**
 * `next/image` wrapper that never passes video URLs through the optimizer
 * (those hang ~7s and 500 on localhost).
 */
export function SafeImage({
  src,
  fallback = MEDIA_IMAGE_FALLBACK,
  alt,
  ...props
}: SafeImageProps) {
  const resolved = imageSrcForDisplay(src, fallback)
  return <Image src={resolved} alt={alt} {...props} />
}
