export async function captureVideoFrame(
  video: HTMLVideoElement,
  quality = 0.92
): Promise<Blob> {
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    throw new Error('Camera is not ready yet. Wait for the preview to load.')
  }

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not capture image from camera.')
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not capture image from camera.'))
          return
        }
        resolve(blob)
      },
      'image/jpeg',
      quality
    )
  })
}
