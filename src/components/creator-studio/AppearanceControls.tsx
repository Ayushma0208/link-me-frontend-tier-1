'use client'

import {
  ACCENT_PRESETS,
  BUTTON_STYLE_OPTIONS,
  FONT_OPTIONS,
  THEME_OPTIONS,
  buttonRadiusClass,
  fontFamilyFor,
  type ProfileAppearance,
  withAlpha,
} from '@/lib/profile-appearance'
import { cn } from '@/lib/utils'

interface AppearanceControlsProps {
  appearance: ProfileAppearance
  onChange: (patch: Partial<ProfileAppearance>) => void
  className?: string
}

export function AppearanceControls({
  appearance,
  onChange,
  className,
}: AppearanceControlsProps) {
  return (
    <div className={cn('space-y-7', className)}>
      <div>
        <h2 className="text-[15px] font-bold text-white">Appearance</h2>
        <p className="mt-1 text-[13px] text-white/45">
          Theme, accent, buttons, and type for your public page.
        </p>
      </div>

      <section className="space-y-3">
        <p className="text-[11px] font-medium tracking-[0.1em] text-white/40 uppercase">
          Theme
        </p>
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map((theme) => {
            const active = appearance.theme === theme.id
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onChange({ theme: theme.id })}
                className={cn(
                  'rounded-2xl border px-3 py-3 text-left transition-colors',
                  active
                    ? 'border-fuchsia-400/40 bg-fuchsia-500/15'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                )}
              >
                <span
                  className={cn(
                    'mb-2 block h-8 rounded-xl',
                    theme.id === 'dark' && 'bg-zinc-900 ring-1 ring-white/15',
                    theme.id === 'light' && 'bg-zinc-100 ring-1 ring-black/10',
                    theme.id === 'gradient' &&
                      'bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500'
                  )}
                />
                <span className="block text-[13px] font-semibold text-white">
                  {theme.label}
                </span>
                <span className="mt-0.5 block text-[11px] text-white/40">
                  {theme.hint}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[11px] font-medium tracking-[0.1em] text-white/40 uppercase">
          Accent color
        </p>
        <div className="flex flex-wrap gap-2.5">
          {ACCENT_PRESETS.map((accent) => {
            const active = appearance.accent.toLowerCase() === accent.value.toLowerCase()
            return (
              <button
                key={accent.id}
                type="button"
                onClick={() => onChange({ accent: accent.value })}
                title={accent.label}
                className={cn(
                  'size-9 rounded-full transition-transform',
                  active && 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#0a0a10]'
                )}
                style={{ backgroundColor: accent.value }}
                aria-label={accent.label}
              />
            )
          })}
          <label className="relative size-9 overflow-hidden rounded-full border border-dashed border-white/25">
            <span className="sr-only">Custom accent</span>
            <input
              type="color"
              value={appearance.accent}
              onChange={(e) => onChange({ accent: e.target.value })}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
            <span
              className="block size-full"
              style={{ backgroundColor: appearance.accent }}
            />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[11px] font-medium tracking-[0.1em] text-white/40 uppercase">
          Button style
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BUTTON_STYLE_OPTIONS.map((style) => {
            const active = appearance.buttonStyle === style.id
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onChange({ buttonStyle: style.id })}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 transition-colors',
                  active
                    ? 'border-fuchsia-400/40 bg-fuchsia-500/15'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                )}
              >
                <span
                  className={cn(
                    'h-8 w-full max-w-[88px] border text-[10px] font-semibold',
                    buttonRadiusClass(style.id),
                    style.id === 'outline'
                      ? 'border-white/40 bg-transparent text-white'
                      : 'border-transparent text-white'
                  )}
                  style={
                    style.id === 'outline'
                      ? { boxShadow: `inset 0 0 0 1.5px ${appearance.accent}` }
                      : {
                          background:
                            style.id === 'soft'
                              ? withAlpha(appearance.accent, 0.35)
                              : `linear-gradient(135deg, ${appearance.accent}, ${withAlpha(appearance.accent, 0.65)})`,
                        }
                  }
                />
                <span className="text-[11px] font-semibold text-white/70">
                  {style.label}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[11px] font-medium tracking-[0.1em] text-white/40 uppercase">
          Font
        </p>
        <div className="space-y-2">
          {FONT_OPTIONS.map((font) => {
            const active = appearance.font === font.id
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => onChange({ font: font.id })}
                className={cn(
                  'flex w-full items-center justify-between rounded-2xl border px-3.5 py-3 text-left transition-colors',
                  active
                    ? 'border-fuchsia-400/40 bg-fuchsia-500/15'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                )}
              >
                <span>
                  <span
                    className="block text-[15px] font-semibold text-white"
                    style={{ fontFamily: fontFamilyFor(font.id) }}
                  >
                    {font.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-white/40">
                    {font.sample}
                  </span>
                </span>
                {active ? (
                  <span className="text-[11px] font-semibold text-fuchsia-200">
                    Active
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
