'use client'

import { Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type BeautyUiState = {
  enabled: boolean
  contrast: 0 | 1 | 2
  lightening: number
  smoothness: number
  sharpness: number
  redness: number
}

interface LiveBeautyControlsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: BeautyUiState
  onChange: (next: BeautyUiState) => void
  overloaded?: boolean
  className?: string
}

function SliderRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-white/70">{label}</span>
        <span className="text-[10px] tabular-nums text-white/40">
          {Math.round(value * 100)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        disabled={disabled}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-white disabled:opacity-40"
      />
    </label>
  )
}

export function LiveBeautyControls({
  open,
  onOpenChange,
  state,
  onChange,
  overloaded = false,
  className,
}: LiveBeautyControlsProps) {
  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition',
          open || state.enabled
            ? 'border-white bg-white text-black'
            : 'border-transparent bg-white/10 text-white hover:bg-white/20'
        )}
        title="Beauty filters"
      >
        <Sparkles className="size-4" />
        Beauty
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[60] w-[min(100vw-2rem,17rem)] rounded-2xl border border-white/15 bg-[#12121a]/95 p-3.5 shadow-xl backdrop-blur-md">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[12px] font-bold uppercase tracking-wide text-white/50">
              Beauty
            </p>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
              aria-label="Close beauty panel"
            >
              <X className="size-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onChange({ ...state, enabled: !state.enabled })}
            className={cn(
              'mb-3 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-[13px] font-semibold transition',
              state.enabled
                ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100'
                : 'border-white/15 bg-white/5 text-white/70'
            )}
          >
            <span>{state.enabled ? 'On' : 'Off'}</span>
            <span
              className={cn(
                'relative h-5 w-9 rounded-full transition',
                state.enabled ? 'bg-emerald-400' : 'bg-white/20'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 size-4 rounded-full bg-white transition',
                  state.enabled ? 'left-4' : 'left-0.5'
                )}
              />
            </span>
          </button>

          {overloaded ? (
            <p className="mb-2 rounded-lg bg-amber-500/15 px-2 py-1.5 text-[11px] text-amber-100">
              Device struggling — beauty turned off. Try again on a stronger
              device.
            </p>
          ) : null}

          <div
            className={cn(
              'space-y-2.5',
              !state.enabled && 'pointer-events-none opacity-40'
            )}
          >
            <SliderRow
              label="Skin smooth"
              value={state.smoothness}
              disabled={!state.enabled}
              onChange={(smoothness) => onChange({ ...state, smoothness })}
            />
            <SliderRow
              label="Brighten"
              value={state.lightening}
              disabled={!state.enabled}
              onChange={(lightening) => onChange({ ...state, lightening })}
            />
            <SliderRow
              label="Sharpen"
              value={state.sharpness}
              disabled={!state.enabled}
              onChange={(sharpness) => onChange({ ...state, sharpness })}
            />
            <SliderRow
              label="Rosy"
              value={state.redness}
              disabled={!state.enabled}
              onChange={(redness) => onChange({ ...state, redness })}
            />

            <div>
              <p className="mb-1.5 text-[11px] font-medium text-white/70">
                Contrast
              </p>
              <div className="flex gap-1">
                {(
                  [
                    [0, 'Low'],
                    [1, 'Normal'],
                    [2, 'High'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    disabled={!state.enabled}
                    onClick={() => onChange({ ...state, contrast: value })}
                    className={cn(
                      'flex-1 rounded-full border px-2 py-1.5 text-[10px] font-semibold transition disabled:opacity-40',
                      state.contrast === value
                        ? 'border-white bg-white text-black'
                        : 'border-white/15 bg-white/5 text-white/65 hover:bg-white/10'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-3 text-[10px] leading-snug text-white/35">
            Applies to your published video. Best on desktop Chrome with
            hardware acceleration.
          </p>
        </div>
      ) : null}
    </div>
  )
}

export const INITIAL_BEAUTY_UI: BeautyUiState = {
  enabled: true,
  contrast: 1,
  lightening: 0.45,
  smoothness: 0.55,
  sharpness: 0.3,
  redness: 0.12,
}
