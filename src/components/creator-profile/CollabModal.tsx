'use client'

import { useEffect, useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BriefcaseBusiness, X } from 'lucide-react'

import {
  buildWhatsAppUrl,
  getAdminWhatsAppNumber,
} from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

const COLLAB_TYPES = [
  'Brand Ambassadorship',
  'Sponsored Post / Reel',
  'Product Seeding',
  'Event Appearance',
  'Long-term Partnership',
  'Other',
] as const

const BUDGET_RANGES = [
  'Under ₹25,000',
  '₹25,000 – ₹75,000',
  '₹75,000 – ₹2,00,000',
  '₹2,00,000 – ₹5,00,000',
  'Above ₹5,00,000',
  'To be discussed',
] as const

export interface CollabModalProps {
  open: boolean
  creatorName: string
  creatorHandle: string
  onClose: () => void
}

type FormState = {
  brandName: string
  contactName: string
  email: string
  phone: string
  collabType: string
  budget: string
  timeline: string
  details: string
  website: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const EMPTY_FORM: FormState = {
  brandName: '',
  contactName: '',
  email: '',
  phone: '',
  collabType: '',
  budget: '',
  timeline: '',
  details: '',
  website: '',
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.brandName.trim()) errors.brandName = 'Brand name is required'
  if (!form.contactName.trim()) errors.contactName = 'Contact name is required'
  if (!form.email.trim()) {
    errors.email = 'Work email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email'
  }
  if (!form.phone.trim()) {
    errors.phone = 'Phone / WhatsApp is required'
  } else if (form.phone.replace(/\D/g, '').length < 8) {
    errors.phone = 'Enter a valid phone number'
  }
  if (!form.collabType) errors.collabType = 'Select a collaboration type'
  if (!form.budget) errors.budget = 'Select a budget range'
  if (!form.timeline.trim()) errors.timeline = 'Timeline is required'
  if (!form.details.trim()) {
    errors.details = 'Tell us about the campaign'
  } else if (form.details.trim().length < 20) {
    errors.details = 'Please add a bit more detail (20+ characters)'
  }
  if (form.website.trim()) {
    try {
      const raw = form.website.trim()
      const url = raw.startsWith('http') ? raw : `https://${raw}`
      void new URL(url)
    } catch {
      errors.website = 'Enter a valid URL'
    }
  }
  return errors
}

function buildMessage(
  form: FormState,
  creatorName: string,
  creatorHandle: string
): string {
  const handle = creatorHandle.replace(/^@/, '')
  const origin =
    typeof window !== 'undefined' ? window.location.origin : ''
  const profileUrl = origin
    ? `${origin}/@${handle}`
    : `/@${handle}`
  const lines = [
    'New Brand Collaboration Request',
    '',
    `Creator: ${creatorName} (@${handle})`,
    `Profile: ${profileUrl}`,
    '',
    `Brand: ${form.brandName.trim()}`,
    `Contact: ${form.contactName.trim()}`,
    `Email: ${form.email.trim()}`,
    `Phone/WhatsApp: ${form.phone.trim()}`,
    `Collaboration type: ${form.collabType}`,
    `Budget: ${form.budget}`,
    `Timeline: ${form.timeline.trim()}`,
    '',
    'Campaign details:',
    form.details.trim(),
  ]
  if (form.website.trim()) {
    lines.push('', `Website / social: ${form.website.trim()}`)
  }
  return lines.join('\n')
}

export function CollabModal({
  open,
  creatorName,
  creatorHandle,
  onClose,
}: CollabModalProps) {
  const prefersReducedMotion = useReducedMotion()
  const formId = useId()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [configError, setConfigError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM)
      setErrors({})
      setConfigError(null)
      setSubmitting(false)
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, submitting])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
    if (configError) setConfigError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const adminNumber = getAdminWhatsAppNumber()
    if (!adminNumber) {
      setConfigError(
        'Admin WhatsApp number is not configured. Please try again later.'
      )
      return
    }

    setSubmitting(true)
    const message = buildMessage(form, creatorName, creatorHandle)
    const url = buildWhatsAppUrl(adminNumber, message)
    window.open(url, '_blank', 'noopener,noreferrer')
    setSubmitting(false)
    onClose()
  }

  const fieldClass = (hasError?: string) =>
    cn(
      'h-11 w-full rounded-2xl border bg-white/[0.06] px-3.5 text-[14px] text-white',
      'placeholder:text-white/30 outline-none transition-[border-color,box-shadow,background-color]',
      'hover:border-white/20 hover:bg-white/[0.08]',
      'focus-visible:bg-white/[0.09] focus-visible:ring-4 focus-visible:ring-sky-400/25',
      hasError
        ? 'border-red-400/50 focus-visible:border-red-400/60'
        : 'border-white/12 focus-visible:border-sky-400/60'
    )

  const labelClass =
    'block text-[11px] font-medium tracking-[0.08em] text-white/50 uppercase'

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!submitting) onClose()
            }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${formId}-title`}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 36, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 20, scale: 0.98 }
            }
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative z-10 flex max-h-[92dvh] w-full max-w-[480px] flex-col overflow-hidden',
              'rounded-t-[28px] sm:rounded-[32px]',
              'border border-white/14 bg-[#0c0c12]/92',
              'shadow-[0_40px_120px_rgba(0,0,0,0.7)] backdrop-blur-2xl'
            )}
          >
            <div className="relative shrink-0 border-b border-white/10 px-5 pt-5 pb-4">
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => {
                  if (!submitting) onClose()
                }}
                className="absolute top-3 right-3 rounded-full border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur-md"
              >
                <X className="size-4" />
              </button>
              <div className="flex items-center gap-3 pr-10">
                <span className="flex size-11 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/15 text-sky-100">
                  <BriefcaseBusiness className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2
                    id={`${formId}-title`}
                    className="text-[1.15rem] font-extrabold tracking-tight text-white"
                  >
                    Brand Collab
                  </h2>
                  <p className="truncate text-[12px] text-white/50">
                    Inquiry for @{creatorHandle.replace(/^@/, '')} ·{' '}
                    {creatorName}
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
              noValidate
            >
              <div className="flex-1 space-y-3.5 overflow-y-auto px-5 py-4">
                <div className="space-y-1.5">
                  <label htmlFor={`${formId}-brand`} className={labelClass}>
                    Brand name
                  </label>
                  <input
                    id={`${formId}-brand`}
                    value={form.brandName}
                    onChange={(e) => updateField('brandName', e.target.value)}
                    placeholder="Acme Cosmetics"
                    className={fieldClass(errors.brandName)}
                    autoComplete="organization"
                  />
                  {errors.brandName ? (
                    <p className="text-[12px] text-red-300/90">
                      {errors.brandName}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`${formId}-contact`}
                      className={labelClass}
                    >
                      Contact person
                    </label>
                    <input
                      id={`${formId}-contact`}
                      value={form.contactName}
                      onChange={(e) =>
                        updateField('contactName', e.target.value)
                      }
                      placeholder="Your name"
                      className={fieldClass(errors.contactName)}
                      autoComplete="name"
                    />
                    {errors.contactName ? (
                      <p className="text-[12px] text-red-300/90">
                        {errors.contactName}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`${formId}-email`} className={labelClass}>
                      Work email
                    </label>
                    <input
                      id={`${formId}-email`}
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="you@brand.com"
                      className={fieldClass(errors.email)}
                      autoComplete="email"
                    />
                    {errors.email ? (
                      <p className="text-[12px] text-red-300/90">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`${formId}-phone`} className={labelClass}>
                    Phone / WhatsApp
                  </label>
                  <input
                    id={`${formId}-phone`}
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className={fieldClass(errors.phone)}
                    autoComplete="tel"
                  />
                  {errors.phone ? (
                    <p className="text-[12px] text-red-300/90">{errors.phone}</p>
                  ) : null}
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor={`${formId}-type`} className={labelClass}>
                      Collaboration type
                    </label>
                    <select
                      id={`${formId}-type`}
                      value={form.collabType}
                      onChange={(e) =>
                        updateField('collabType', e.target.value)
                      }
                      className={cn(fieldClass(errors.collabType), 'pr-8')}
                    >
                      <option value="" className="bg-[#12121a] text-white">
                        Select type
                      </option>
                      {COLLAB_TYPES.map((type) => (
                        <option
                          key={type}
                          value={type}
                          className="bg-[#12121a] text-white"
                        >
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.collabType ? (
                      <p className="text-[12px] text-red-300/90">
                        {errors.collabType}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`${formId}-budget`} className={labelClass}>
                      Budget range
                    </label>
                    <select
                      id={`${formId}-budget`}
                      value={form.budget}
                      onChange={(e) => updateField('budget', e.target.value)}
                      className={cn(fieldClass(errors.budget), 'pr-8')}
                    >
                      <option value="" className="bg-[#12121a] text-white">
                        Select budget
                      </option>
                      {BUDGET_RANGES.map((range) => (
                        <option
                          key={range}
                          value={range}
                          className="bg-[#12121a] text-white"
                        >
                          {range}
                        </option>
                      ))}
                    </select>
                    {errors.budget ? (
                      <p className="text-[12px] text-red-300/90">
                        {errors.budget}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`${formId}-timeline`} className={labelClass}>
                    Campaign timeline
                  </label>
                  <input
                    id={`${formId}-timeline`}
                    value={form.timeline}
                    onChange={(e) => updateField('timeline', e.target.value)}
                    placeholder="e.g. Next 2 weeks / August launch"
                    className={fieldClass(errors.timeline)}
                  />
                  {errors.timeline ? (
                    <p className="text-[12px] text-red-300/90">
                      {errors.timeline}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`${formId}-details`} className={labelClass}>
                    Campaign details
                  </label>
                  <textarea
                    id={`${formId}-details`}
                    value={form.details}
                    onChange={(e) => updateField('details', e.target.value)}
                    placeholder="What are you looking for? Deliverables, platforms, creative brief…"
                    rows={4}
                    className={cn(
                      fieldClass(errors.details),
                      'h-auto resize-none py-3'
                    )}
                  />
                  {errors.details ? (
                    <p className="text-[12px] text-red-300/90">
                      {errors.details}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`${formId}-website`} className={labelClass}>
                    Website / social{' '}
                    <span className="normal-case tracking-normal text-white/35">
                      (optional)
                    </span>
                  </label>
                  <input
                    id={`${formId}-website`}
                    value={form.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://brand.com or Instagram"
                    className={fieldClass(errors.website)}
                    autoComplete="url"
                  />
                  {errors.website ? (
                    <p className="text-[12px] text-red-300/90">
                      {errors.website}
                    </p>
                  ) : null}
                </div>

                {configError ? (
                  <p
                    role="alert"
                    className="rounded-2xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-200"
                  >
                    {configError}
                  </p>
                ) : null}

                <p className="text-[12px] leading-relaxed text-white/40">
                  Submitting opens WhatsApp with your answers prefilled for our
                  team. Review the message and tap Send.
                </p>
              </div>

              <div className="shrink-0 border-t border-white/10 px-5 py-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className={cn(
                    'inline-flex h-11 w-full items-center justify-center rounded-full',
                    'bg-[#25D366] text-[14px] font-semibold text-black',
                    'transition hover:brightness-110 disabled:opacity-60'
                  )}
                >
                  {submitting ? 'Opening WhatsApp…' : 'Send via WhatsApp'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
