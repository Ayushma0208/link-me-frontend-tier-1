/**
 * Client-side forensic watermark for live audience video.
 * Nearly invisible sparse pattern encoding a compact viewer+live payload.
 * Best-effort for screenshots / phone-of-screen; weak after heavy re-encode.
 */

export const WATERMARK_VERSION = 'LM1'
/** Grid cell size in CSS pixels (logical). */
export const WATERMARK_TILE = 28
/** Alpha for “on” bits — keep low so video stays watchable. */
export const WATERMARK_ALPHA = 0.045

export interface WatermarkPayloadParts {
  version: string
  userId8: string
  liveId8: string
  checksum: string
  raw: string
}

function stripUuid(id: string): string {
  return id.replace(/-/g, '').toLowerCase()
}

function checksum8(userId8: string, liveId8: string): string {
  let n = 0
  const s = `${WATERMARK_VERSION}${userId8}${liveId8}`
  for (let i = 0; i < s.length; i++) n = (n + s.charCodeAt(i) * (i + 1)) % 256
  return n.toString(16).padStart(2, '0')
}

/** First 8 hex chars of UUID (no dashes). */
export function idPrefix8(id: string): string {
  return stripUuid(id).slice(0, 8).padEnd(8, '0')
}

export function buildWatermarkPayload(
  userId: string,
  liveId: string
): WatermarkPayloadParts {
  const userId8 = idPrefix8(userId)
  const liveId8 = idPrefix8(liveId)
  const checksum = checksum8(userId8, liveId8)
  const raw = `${WATERMARK_VERSION}|${userId8}|${liveId8}|${checksum}`
  return { version: WATERMARK_VERSION, userId8, liveId8, checksum, raw }
}

function hash32(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Payload → bit array (8 bits per char). */
export function payloadToBits(raw: string): number[] {
  const bits: number[] = []
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i) & 0xff
    for (let b = 7; b >= 0; b--) bits.push((c >> b) & 1)
  }
  return bits
}

export function bitsToPayload(bits: number[]): string | null {
  if (bits.length < 8) return null
  const usable = bits.length - (bits.length % 8)
  let out = ''
  for (let i = 0; i < usable; i += 8) {
    let c = 0
    for (let b = 0; b < 8; b++) c = (c << 1) | (bits[i + b] ? 1 : 0)
    if (c === 0) break
    out += String.fromCharCode(c)
  }
  return out || null
}

export function parseWatermarkPayload(raw: string): WatermarkPayloadParts | null {
  const m = /^LM1\|([0-9a-f]{8})\|([0-9a-f]{8})\|([0-9a-f]{2})$/i.exec(
    raw.trim()
  )
  if (!m) return null
  const userId8 = m[1].toLowerCase()
  const liveId8 = m[2].toLowerCase()
  const checksum = m[3].toLowerCase()
  if (checksum8(userId8, liveId8) !== checksum) return null
  return {
    version: WATERMARK_VERSION,
    userId8,
    liveId8,
    checksum,
    raw: `LM1|${userId8}|${liveId8}|${checksum}`,
  }
}

/**
 * Paint sparse low-alpha marks. Bit index wraps across the grid so the
 * payload repeats for redundancy.
 */
export function paintWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  payload: string,
  tMs: number
) {
  if (width < 8 || height < 8) return
  ctx.clearRect(0, 0, width, height)

  const bits = payloadToBits(payload)
  if (bits.length === 0) return

  const tile = WATERMARK_TILE
  const cols = Math.ceil(width / tile)
  const rows = Math.ceil(height / tile)
  // Slow temporal phase so a static wipe can’t remove all copies.
  const phase = Math.floor(tMs / 900) % bits.length

  ctx.save()
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = (row * cols + col + phase) % bits.length
      if (!bits[idx]) continue

      const salt = hash32(`${payload}:${col}:${row}`)
      const ox = salt % Math.max(1, tile - 3)
      const oy = (salt >>> 8) % Math.max(1, tile - 3)
      const x = col * tile + ox
      const y = row * tile + oy
      if (x + 2 >= width || y + 2 >= height) continue

      // Near-white and near-black micro-dots — survives light compression better
      // than a single channel alone.
      ctx.fillStyle = `rgba(255,255,255,${WATERMARK_ALPHA})`
      ctx.fillRect(x, y, 2, 2)
      ctx.fillStyle = `rgba(0,0,0,${WATERMARK_ALPHA * 0.85})`
      ctx.fillRect(x + 1, y + 1, 1, 1)
    }
  }
  ctx.restore()
}

export interface DecodeWatermarkResult {
  ok: boolean
  payload: WatermarkPayloadParts | null
  raw: string | null
  message: string
}

/**
 * Best-effort decode from a screenshot’s ImageData.
 * Assumes roughly full-frame capture at similar resolution; crops hurt accuracy.
 */
export function decodeWatermarkFromImageData(
  imageData: ImageData
): DecodeWatermarkResult {
  const { width, height, data } = imageData
  if (width < WATERMARK_TILE * 4 || height < WATERMARK_TILE * 4) {
    return {
      ok: false,
      payload: null,
      raw: null,
      message: 'Image too small — use a fuller frame screenshot',
    }
  }

  const tile = WATERMARK_TILE
  const cols = Math.floor(width / tile)
  const rows = Math.floor(height / tile)
  if (cols < 4 || rows < 4) {
    return {
      ok: false,
      payload: null,
      raw: null,
      message: 'Not enough tiles to recover watermark',
    }
  }

  // Sample each tile: look for elevated luminance variance in the micro-dot region.
  // We don’t know phase — try all phases against expected payload length.
  const expectedLen = `LM1|${'0'.repeat(8)}|${'0'.repeat(8)}|00`.length
  const bitLen = expectedLen * 8

  const tileBits: number[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let maxLum = 0
      let minLum = 255
      const x0 = col * tile
      const y0 = row * tile
      // Sample a few points in the tile (covers ox/oy spread).
      for (let sy = 0; sy < tile; sy += 4) {
        for (let sx = 0; sx < tile; sx += 4) {
          const x = x0 + sx
          const y = y0 + sy
          if (x >= width || y >= height) continue
          const i = (y * width + x) * 4
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          if (lum > maxLum) maxLum = lum
          if (lum < minLum) minLum = lum
        }
      }
      // High local contrast → likely an “on” bit mark.
      tileBits.push(maxLum - minLum > 8 ? 1 : 0)
    }
  }

  // Vote across repeats for each phase.
  for (let phase = 0; phase < bitLen; phase++) {
    const recovered: number[] = []
    const votes: { zeros: number; ones: number }[] = Array.from(
      { length: bitLen },
      () => ({ zeros: 0, ones: 0 })
    )
    for (let i = 0; i < tileBits.length; i++) {
      const bitIndex = (i + phase) % bitLen
      if (tileBits[i]) votes[bitIndex].ones++
      else votes[bitIndex].zeros++
    }
    for (let i = 0; i < bitLen; i++) {
      recovered.push(votes[i].ones >= votes[i].zeros ? 1 : 0)
    }
    const raw = bitsToPayload(recovered)
    if (!raw) continue
    // Find LM1|…|…|xx substring
    const idx = raw.indexOf('LM1|')
    if (idx < 0) continue
    const slice = raw.slice(idx, idx + expectedLen)
    const parsed = parseWatermarkPayload(slice)
    if (parsed) {
      return {
        ok: true,
        payload: parsed,
        raw: parsed.raw,
        message: 'Decoded watermark payload',
      }
    }
  }

  return {
    ok: false,
    payload: null,
    raw: null,
    message:
      'Could not decode watermark — try a sharper full-frame PNG screenshot',
  }
}

/** Decode from an HTMLImageElement / ImageBitmap drawn to a temp canvas. */
export async function decodeWatermarkFromImageSource(
  source: CanvasImageSource,
  width: number,
  height: number
): Promise<DecodeWatermarkResult> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return {
      ok: false,
      payload: null,
      raw: null,
      message: 'Canvas 2D unavailable',
    }
  }
  ctx.drawImage(source, 0, 0, width, height)
  return decodeWatermarkFromImageData(ctx.getImageData(0, 0, width, height))
}
