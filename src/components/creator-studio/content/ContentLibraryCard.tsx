'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import {
  CalendarClock,
  Check,
  Copy,
  Eye,
  FilePenLine,
  Heart,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'

import {
  MediaTypeBadge,
  VisibilityBadge,
} from '@/components/creator-studio/VisibilityBadge'
import type { StudioPost } from '@/data/creator-studio'
import { cn, formatCurrency, formatFollowers } from '@/lib/utils'

export interface ContentLibraryCardProps {
  post: StudioPost
  view: 'grid' | 'card'
  selected: boolean
  selectionMode: boolean
  onToggleSelect: () => void
  onPreview: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  delay?: number
}

function StatusPill({ status }: { status: StudioPost['status'] }) {
  if (status === 'published') return null
  return (
    <span
      className={cn(
        'rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
        status === 'draft'
          ? 'border-white/15 bg-white/10 text-white/70'
          : 'border-amber-400/30 bg-amber-500/15 text-amber-100'
      )}
    >
      {status === 'draft' ? 'Draft' : 'Scheduled'}
    </span>
  )
}

export function ContentLibraryCard({
  post,
  view,
  selected,
  selectionMode,
  onToggleSelect,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
  delay = 0,
}: ContentLibraryCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)
  const locked = post.visibility !== 'public'

  if (view === 'card') {
    return (
      <motion.article
        layout
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={cn(
          'flex gap-3 overflow-hidden rounded-[22px] border bg-white/[0.04] p-3 backdrop-blur-xl transition sm:gap-4 sm:p-3.5',
          selected
            ? 'border-fuchsia-400/40 ring-1 ring-fuchsia-400/25'
            : 'border-white/10 hover:border-white/16'
        )}
      >
        <button
          type="button"
          onClick={selectionMode ? onToggleSelect : onPreview}
          className="relative size-24 shrink-0 overflow-hidden rounded-2xl sm:size-28"
        >
          <Image
            src={post.thumbnail}
            alt=""
            fill
            className={cn('object-cover', locked && 'brightness-75')}
            sizes="112px"
          />
          {locked ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/35">
              <Lock className="size-4 text-white" />
            </span>
          ) : null}
          {selectionMode ? (
            <span
              className={cn(
                'absolute top-2 left-2 flex size-5 items-center justify-center rounded-md border',
                selected
                  ? 'border-fuchsia-300 bg-fuchsia-500 text-white'
                  : 'border-white/30 bg-black/40'
              )}
            >
              {selected ? <Check className="size-3" strokeWidth={3} /> : null}
            </span>
          ) : null}
        </button>

        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <MediaTypeBadge type={post.type} />
            <VisibilityBadge visibility={post.visibility} />
            <StatusPill status={post.status} />
          </div>
          <h3 className="mt-2 line-clamp-1 text-[14px] font-semibold text-white">
            {post.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-[12px] text-white/40">
            {post.caption ||
              (post.scheduledFor
                ? `Scheduled ${new Date(post.scheduledFor).toLocaleString()}`
                : post.createdAt)}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-white/45">
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3" />
              {formatFollowers(post.likes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3" />
              {formatFollowers(post.views)}
            </span>
            {post.price ? (
              <span className="text-amber-200/80">{formatCurrency(post.price)}</span>
            ) : null}
          </div>
        </div>

        <div className="relative flex shrink-0 flex-col items-end gap-1">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-white/60 hover:text-white"
            aria-label="Actions"
          >
            <MoreHorizontal className="size-4" />
          </button>
          {menuOpen ? (
            <ActionMenu
              onPreview={() => {
                setMenuOpen(false)
                onPreview()
              }}
              onEdit={() => {
                setMenuOpen(false)
                onEdit()
              }}
              onDuplicate={() => {
                setMenuOpen(false)
                onDuplicate()
              }}
              onDelete={() => {
                setMenuOpen(false)
                onDelete()
              }}
            />
          ) : null}
        </div>
      </motion.article>
    )
  }

  return (
    <motion.article
      layout
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      className={cn(
        'group relative overflow-hidden rounded-[22px] border bg-white/[0.04] shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl',
        selected
          ? 'border-fuchsia-400/40 ring-1 ring-fuchsia-400/25'
          : 'border-white/10'
      )}
    >
      <button
        type="button"
        onClick={selectionMode ? onToggleSelect : onPreview}
        className="relative block aspect-[4/5] w-full text-left"
      >
        <Image
          src={post.thumbnail}
          alt={post.title}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className={cn(
            'object-cover transition duration-500 group-hover:scale-105',
            locked && 'brightness-[0.7]'
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {selectionMode ? (
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-lg border backdrop-blur-md',
                selected
                  ? 'border-fuchsia-300 bg-fuchsia-500 text-white'
                  : 'border-white/25 bg-black/45 text-transparent'
              )}
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
          ) : null}
          <MediaTypeBadge type={post.type} />
          <VisibilityBadge visibility={post.visibility} />
          <StatusPill status={post.status} />
        </div>

        {post.price ? (
          <span className="absolute top-3 right-3 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            {formatCurrency(post.price)}
          </span>
        ) : null}

        {locked ? (
          <span className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
            <Lock className="size-4" />
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <p className="line-clamp-2 text-[13px] font-semibold text-white">
            {post.title}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-white/55">
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3" />
              {formatFollowers(post.likes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3" />
              {formatFollowers(post.views)}
            </span>
            {post.status === 'scheduled' ? (
              <span className="inline-flex items-center gap-1 text-amber-200/80">
                <CalendarClock className="size-3" />
                Soon
              </span>
            ) : null}
          </div>
        </div>
      </button>

      <div className="flex items-center gap-1 border-t border-white/8 p-2">
        <IconBtn label="Preview" onClick={onPreview}>
          <Eye className="size-3.5" />
        </IconBtn>
        <IconBtn label="Edit" onClick={onEdit}>
          <Pencil className="size-3.5" />
        </IconBtn>
        <IconBtn label="Duplicate" onClick={onDuplicate}>
          <Copy className="size-3.5" />
        </IconBtn>
        <IconBtn label="Delete" onClick={onDelete} danger>
          <Trash2 className="size-3.5" />
        </IconBtn>
      </div>
    </motion.article>
  )
}

function IconBtn({
  children,
  onClick,
  label,
  danger,
}: {
  children: ReactNode
  onClick: () => void
  label: string
  danger?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'flex h-8 flex-1 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/[0.06] hover:text-white',
        danger && 'hover:bg-rose-500/15 hover:text-rose-200'
      )}
    >
      {children}
    </button>
  )
}

function ActionMenu({
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  onPreview: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const items = [
    { label: 'Preview', icon: Eye, onClick: onPreview },
    { label: 'Edit', icon: FilePenLine, onClick: onEdit },
    { label: 'Duplicate', icon: Copy, onClick: onDuplicate },
    { label: 'Delete', icon: Trash2, onClick: onDelete, danger: true },
  ]
  return (
    <div className="absolute top-10 right-0 z-20 w-40 overflow-hidden rounded-2xl border border-white/12 bg-[#12121a]/95 py-1 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={cn(
            'flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium',
            item.danger
              ? 'text-rose-300 hover:bg-rose-500/10'
              : 'text-white/75 hover:bg-white/[0.06] hover:text-white'
          )}
        >
          <item.icon className="size-3.5" />
          {item.label}
        </button>
      ))}
    </div>
  )
}
