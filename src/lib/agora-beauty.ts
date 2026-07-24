import AgoraRTC, { type ICameraVideoTrack } from 'agora-rtc-sdk-ng'
import BeautyExtension, {
  type BeautyEffectOptions,
  type IBeautyProcessor,
} from 'agora-extension-beauty-effect'

export type { BeautyEffectOptions, IBeautyProcessor }

/** Mild defaults — noticeable skin smooth without heavy whitening. */
export const DEFAULT_BEAUTY_OPTIONS: BeautyEffectOptions = {
  lighteningContrastLevel: 1,
  lighteningLevel: 0.45,
  smoothnessLevel: 0.55,
  sharpnessLevel: 0.3,
  rednessLevel: 0.12,
}

let extension: BeautyExtension | null = null
let registered = false

export function ensureBeautyExtensionRegistered(): BeautyExtension {
  if (!registered || !extension) {
    extension = new BeautyExtension()
    AgoraRTC.registerExtensions([extension])
    registered = true
  }
  return extension
}

export function createBeautyProcessor(): IBeautyProcessor {
  const ext = ensureBeautyExtensionRegistered()
  return ext.createProcessor()
}

export function beautyOptionsFromLevels(levels: {
  contrast: 0 | 1 | 2
  lightening: number
  smoothness: number
  sharpness: number
  redness: number
}): BeautyEffectOptions {
  const clamp = (n: number) => Math.min(1, Math.max(0, n))
  return {
    lighteningContrastLevel: levels.contrast,
    lighteningLevel: clamp(levels.lightening),
    smoothnessLevel: clamp(levels.smoothness),
    sharpnessLevel: clamp(levels.sharpness),
    rednessLevel: clamp(levels.redness),
  }
}

/**
 * Pipe local camera → beauty processor → SDK destination, then enable.
 * Call after createCameraVideoTrack / createMicrophoneAndCameraTracks, before publish.
 */
export async function attachBeautyProcessor(
  cam: ICameraVideoTrack,
  processor: IBeautyProcessor,
  options: BeautyEffectOptions = DEFAULT_BEAUTY_OPTIONS
): Promise<void> {
  cam.pipe(processor).pipe(cam.processorDestination)
  processor.setOptions(options)
  await processor.enable()
}

export async function setBeautyEnabled(
  processor: IBeautyProcessor | null,
  enabled: boolean
): Promise<void> {
  if (!processor) return
  if (enabled) await processor.enable()
  else await processor.disable()
}

export function applyBeautyOptions(
  processor: IBeautyProcessor | null,
  options: BeautyEffectOptions
): void {
  processor?.setOptions(options)
}

/** Disable + unpipe + release worker when leaving the live room. */
export async function teardownBeautyProcessor(
  cam: ICameraVideoTrack | null | undefined,
  processor: IBeautyProcessor | null | undefined
): Promise<void> {
  if (!processor) return
  try {
    await processor.disable()
  } catch {
    /* ignore */
  }
  try {
    cam?.unpipe()
  } catch {
    /* ignore */
  }
  const release = (
    processor as IBeautyProcessor & { release?: () => Promise<void> }
  ).release
  if (typeof release === 'function') {
    try {
      await release.call(processor)
    } catch {
      /* ignore */
    }
  }
}
