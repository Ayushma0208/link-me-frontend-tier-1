export type DeviceClass = 'FLAGSHIP' | 'MID' | 'BUDGET' | 'UNKNOWN'

type NavigatorWithHints = Navigator & {
  deviceMemory?: number
  connection?: { effectiveType?: string }
}

function parseIPhoneGeneration(ua: string): number | null {
  // iPhone OS version is not the same as model, but newer OS + iPhone often correlates.
  // Prefer model tokens when present (e.g. some WebViews); otherwise use OS major.
  const os = /iPhone OS (\d+)/i.exec(ua)
  if (!os) return null
  return Number(os[1])
}

function isBudgetAndroidUa(ua: string): boolean {
  // Common budget / older Android cues in UA or model strings.
  const budget =
    /SM-A(0|1[0-5])|SM-A[0-9]{2}F|Redmi [0-6]|Redmi A|Nokia [1-5]|moto e|Galaxy A(0|1[0-5])|Itel|TECNO SPARK|Infinix SMART|Realme C[0-9]/i
  return budget.test(ua)
}

function isFlagshipUa(ua: string): boolean {
  if (/iPhone/i.test(ua)) {
    const gen = parseIPhoneGeneration(ua)
    // iOS 16+ is a reasonable proxy for relatively capable devices for live video.
    if (gen != null && gen >= 16) return true
    if (gen != null && gen <= 14) return false
  }
  return /iPhone\s*(1[2-9]|[2-9]\d)|Galaxy S(2[0-9]|1[89])|Pixel ([6-9]|1\d)|OnePlus (9|1[0-9]|Nord)/i.test(
    ua
  )
}

/**
 * Heuristic device tier for live stream quality (not an exact model DB).
 * Used to pick an initial Agora High vs Low remote stream.
 */
export function detectDeviceClass(): DeviceClass {
  if (typeof navigator === 'undefined') return 'UNKNOWN'

  const nav = navigator as NavigatorWithHints
  const ua = nav.userAgent || ''
  const memory = nav.deviceMemory
  const cores = nav.hardwareConcurrency ?? 0
  const effectiveType = nav.connection?.effectiveType?.toLowerCase() ?? ''

  if (
    effectiveType === 'slow-2g' ||
    effectiveType === '2g' ||
    effectiveType === '3g'
  ) {
    return 'BUDGET'
  }

  if (typeof memory === 'number' && memory > 0 && memory <= 2) {
    return 'BUDGET'
  }

  if (cores > 0 && cores <= 4 && /Android/i.test(ua)) {
    return 'BUDGET'
  }

  if (isBudgetAndroidUa(ua)) return 'BUDGET'

  if (isFlagshipUa(ua)) return 'FLAGSHIP'

  if (typeof memory === 'number' && memory >= 6 && cores >= 6) {
    return 'FLAGSHIP'
  }

  if (/iPhone|Android|Mobile/i.test(ua)) return 'MID'

  // Desktop / tablet without strong signals — treat as capable.
  if (!/Mobile/i.test(ua) && cores >= 4) return 'FLAGSHIP'

  return 'UNKNOWN'
}
