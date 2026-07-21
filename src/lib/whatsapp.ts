/**
 * Digits-only international number for WhatsApp (wa.me).
 * Example India: 919876543210
 * Bare 10-digit Indian mobiles get country code 91 prepended.
 */
export function normalizeWhatsAppNumber(raw: string | undefined | null): string {
  if (!raw) return ''
  let digits = raw.replace(/\D/g, '')
  // Drop a single leading 0 (local dialing) before country-code handling.
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1)
  }
  // Indian mobile numbers are 10 digits; WhatsApp requires country code.
  if (digits.length === 10) {
    digits = `91${digits}`
  }
  return digits
}

export function getAdminWhatsAppNumber(): string {
  return normalizeWhatsAppNumber(
    process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER
  )
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = normalizeWhatsAppNumber(phone)
  const text = encodeURIComponent(message)
  return `https://wa.me/${digits}?text=${text}`
}
