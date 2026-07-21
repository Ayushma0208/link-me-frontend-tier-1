'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckSquare, Copy, Trash2, X } from 'lucide-react'

export interface ContentBulkBarProps {
  count: number
  onClear: () => void
  onDelete: () => void
  onDuplicate: () => void
}

export function ContentBulkBar({
  count,
  onClear,
  onDelete,
  onDuplicate,
}: ContentBulkBarProps) {
  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-xl items-center gap-2 rounded-full border border-white/12 bg-[#12121a]/95 px-3 py-2 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:bottom-8"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/15 px-3 py-1.5 text-[12px] font-semibold text-fuchsia-100">
            <CheckSquare className="size-3.5" />
            {count} selected
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={onDuplicate}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
            >
              <Copy className="size-3.5" />
              Duplicate
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold text-rose-200 hover:bg-rose-500/15"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear selection"
              className="rounded-full p-2 text-white/40 hover:bg-white/[0.06] hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
