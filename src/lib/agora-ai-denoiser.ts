import AgoraRTC, { type IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng'
import {
  AIDenoiserExtension,
  type IAIDenoiserProcessor,
} from 'agora-extension-ai-denoiser'

export type { IAIDenoiserProcessor }

const ASSETS_PATH = '/agora-ai-denoiser'

let extension: AIDenoiserExtension | null = null
let registered = false

export function ensureAiDenoiserRegistered(): AIDenoiserExtension {
  if (!registered || !extension) {
    extension = new AIDenoiserExtension({ assetsPath: ASSETS_PATH })
    AgoraRTC.registerExtensions([extension])
    registered = true
  }
  return extension
}

export function createAiDenoiserProcessor(): IAIDenoiserProcessor {
  const ext = ensureAiDenoiserRegistered()
  if (!ext.checkCompatibility()) {
    throw new Error('AI denoiser unsupported in this browser')
  }
  return ext.createProcessor()
}

/** Pipe local mic → AI denoiser → SDK destination, NSNG + enable. */
export async function attachAiDenoiserProcessor(
  mic: IMicrophoneAudioTrack,
  processor: IAIDenoiserProcessor
): Promise<void> {
  mic.pipe(processor).pipe(mic.processorDestination)
  await processor.setMode('NSNG')
  await processor.setLevel('AGGRESSIVE')
  await processor.enable()
}

export async function setAiDenoiserEnabled(
  processor: IAIDenoiserProcessor | null,
  enabled: boolean
): Promise<void> {
  if (!processor) return
  if (enabled) await processor.enable()
  else await processor.disable()
}

/** First overload → STATIONARY_NS; second → disable + callback. */
export function bindAiDenoiserOverload(
  processor: IAIDenoiserProcessor,
  onForcedOff: () => void
): void {
  let fellBack = false
  processor.on('overload', () => {
    if (!fellBack) {
      fellBack = true
      void processor.setMode('STATIONARY_NS').catch(() => {
        /* ignore */
      })
      return
    }
    void setAiDenoiserEnabled(processor, false).finally(onForcedOff)
  })
}

export async function teardownAiDenoiserProcessor(
  mic: IMicrophoneAudioTrack | null | undefined,
  processor: IAIDenoiserProcessor | null | undefined
): Promise<void> {
  if (!processor) return
  try {
    await processor.disable()
  } catch {
    /* ignore */
  }
  try {
    processor.unpipe()
  } catch {
    /* ignore */
  }
  try {
    mic?.unpipe()
  } catch {
    /* ignore */
  }
  try {
    await processor.destroy()
  } catch {
    /* ignore */
  }
}
