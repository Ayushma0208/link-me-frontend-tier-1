'use client'

import { cn } from '@/lib/utils'
import {
  planModeLabel,
  type ChatPlanDraft,
  type ChatPlanMode,
} from '@/lib/chat-plans'

const MODE_HELP: Record<ChatPlanMode, string> = {
  FIXED_DURATION:
    'Fans pay once for a timed package. Text, images, and voice notes are included until time runs out.',
  PER_MINUTE:
    'Timer starts on the first fan message. Wallet is charged per minute; media is included.',
  PER_ITEM:
    'Every text, image, and voice note is charged separately at the prices you set.',
}

type Props = {
  drafts: ChatPlanDraft[]
  onChange: (next: ChatPlanDraft[]) => void
  className?: string
}

export function ChatPlanEditor({ drafts, onChange, className }: Props) {
  function update(mode: ChatPlanMode, patch: Partial<ChatPlanDraft>) {
    onChange(
      drafts.map((d) => (d.mode === mode ? { ...d, ...patch } : d))
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {drafts.map((draft) => (
        <div
          key={draft.mode}
          className="rounded-2xl border border-white/10 bg-black/25 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                {planModeLabel(draft.mode)}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/45">
                {MODE_HELP[draft.mode]}
              </p>
            </div>
            <label className="flex items-center gap-2 text-[12px] text-white/70">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) =>
                  update(draft.mode, { isActive: e.target.checked })
                }
              />
              Active
            </label>
          </div>

          {draft.mode === 'FIXED_DURATION' ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-[12px] text-white/40">
                Package price (INR)
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                  value={draft.packagePrice}
                  onChange={(e) =>
                    update(draft.mode, { packagePrice: e.target.value })
                  }
                />
              </label>
              <label className="block text-[12px] text-white/40">
                Duration (minutes)
                <input
                  type="number"
                  min="1"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                  value={draft.durationMinutes}
                  onChange={(e) =>
                    update(draft.mode, { durationMinutes: e.target.value })
                  }
                />
              </label>
            </div>
          ) : null}

          {draft.mode === 'PER_MINUTE' ? (
            <label className="mt-3 block text-[12px] text-white/40">
              Price per minute (INR)
              <input
                type="number"
                min="0"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                value={draft.pricePerMinute}
                onChange={(e) =>
                  update(draft.mode, { pricePerMinute: e.target.value })
                }
              />
            </label>
          ) : null}

          {draft.mode === 'PER_ITEM' ? (
            <div className="mt-3 grid grid-cols-3 gap-3">
              <label className="block text-[12px] text-white/40">
                Text
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                  value={draft.textPrice}
                  onChange={(e) =>
                    update(draft.mode, { textPrice: e.target.value })
                  }
                />
              </label>
              <label className="block text-[12px] text-white/40">
                Image
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                  value={draft.imagePrice}
                  onChange={(e) =>
                    update(draft.mode, { imagePrice: e.target.value })
                  }
                />
              </label>
              <label className="block text-[12px] text-white/40">
                Voice note
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                  value={draft.audioPrice}
                  onChange={(e) =>
                    update(draft.mode, { audioPrice: e.target.value })
                  }
                />
              </label>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
