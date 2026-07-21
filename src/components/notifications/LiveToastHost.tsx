'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Radio, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotificationsStore } from '@/stores/notifications'

/** Instagram-style toast shown when a subscribed creator goes live. */
export function LiveToastHost() {
  const router = useRouter()
  const liveToast = useNotificationsStore((s) => s.liveToast)
  const dismiss = useNotificationsStore((s) => s.dismissLiveToast)

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-3 sm:top-5">
      <AnimatePresence>
        {liveToast ? (
          <motion.div
            key={liveToast.liveId}
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-white/12 bg-[#141416]/95 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500">
              <Radio className="size-5 text-white" aria-hidden />
              <span className="absolute -right-0.5 -top-0.5 flex size-3">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-rose-500" />
              </span>
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">
                {liveToast.title}
              </p>
              <p className="truncate text-[12px] text-white/55">
                {liveToast.accessType === 'PAID' && liveToast.price
                  ? `Paid live · ₹${liveToast.price}`
                  : liveToast.body}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const href = liveToast.href
                dismiss()
                router.push(href)
              }}
              className="shrink-0 rounded-full bg-white px-4 py-1.5 text-[12px] font-bold text-[#07070b] transition hover:bg-white/90"
            >
              Join
            </button>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="shrink-0 rounded-full p-1 text-white/40 transition hover:text-white"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
