import AgoraRTC, { type ICameraVideoTrack } from 'agora-rtc-sdk-ng'

export type FlipCameraResult =
  | { ok: true; deviceId: string }
  | {
      ok: false
      reason: 'no-track' | 'single-camera' | 'failed'
      message: string
    }

function oppositeFacing(
  facing: string | undefined
): 'user' | 'environment' {
  return facing === 'environment' ? 'user' : 'environment'
}

/**
 * Switch the local Agora camera track to the other camera (front ↔ back)
 * without unpublishing. Prefer deviceId cycling; fall back to facingMode.
 */
export async function flipCameraTrack(
  track: ICameraVideoTrack | null | undefined
): Promise<FlipCameraResult> {
  if (!track) {
    return { ok: false, reason: 'no-track', message: 'Camera is not active' }
  }

  try {
    const settings = track.getMediaStreamTrack().getSettings()
    const currentId = settings.deviceId
    const cameras = await AgoraRTC.getCameras()

    if (cameras.length >= 2) {
      const currentIndex = cameras.findIndex((c) => c.deviceId === currentId)
      const next =
        currentIndex >= 0
          ? cameras[(currentIndex + 1) % cameras.length]
          : cameras.find((c) => c.deviceId !== currentId) ?? cameras[0]

      if (!next?.deviceId || next.deviceId === currentId) {
        return {
          ok: false,
          reason: 'single-camera',
          message: 'No other camera found',
        }
      }

      await track.setDevice(next.deviceId)
      return { ok: true, deviceId: next.deviceId }
    }

    // Mobile browsers sometimes expose one device until the other facing mode
    // is requested — try facingMode toggle.
    const nextFacing = oppositeFacing(settings.facingMode)
    await track.setDevice({ facingMode: nextFacing })
    return { ok: true, deviceId: nextFacing }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to flip camera'
    // Distinguish "only one camera" style failures when possible.
    if (/device|camera|not found|NotFound/i.test(message)) {
      return { ok: false, reason: 'single-camera', message }
    }
    return { ok: false, reason: 'failed', message }
  }
}
