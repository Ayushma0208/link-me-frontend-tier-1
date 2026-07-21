'use client'

import { useEffect, useMemo, useState, type DragEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Plus } from 'lucide-react'

import { ChatPlanEditor } from '@/components/chat/ChatPlanEditor'
import { PlanEditorModal } from '@/components/creator-studio/plans/PlanEditorModal'
import { PlanPricingCard } from '@/components/creator-studio/plans/PlanPricingCard'
import { PlanPreviewPanel } from '@/components/creator-studio/plans/PlanPreviewPanel'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import { Button } from '@/components/ui/button'
import type { CreatorPlan } from '@/data/creator-studio'
import { api, ApiError } from '@/lib/api'
import {
  draftsFromPlans,
  draftsToPayload,
  emptyChatPlanDrafts,
  type ChatPlan,
  type ChatPlanDraft,
} from '@/lib/chat-plans'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

type ApiPlan = {
  id: string
  name: string
  description?: string | null
  interval: string
  price: string
  currency: string
  benefits?: unknown
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
}

const ACCENTS: CreatorPlan['accent'][] = ['violet', 'amber', 'sky', 'rose']

function parseBenefits(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String).filter(Boolean)
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
    } catch {
      return raw ? [raw] : []
    }
  }
  return []
}

function toStudioPlan(plan: ApiPlan, index: number): CreatorPlan {
  const price = Number(plan.price) || 0
  const isYearly = plan.interval.toUpperCase() === 'YEARLY'
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description || '',
    monthlyPrice: isYearly ? Math.round(price / 12) || price : price,
    yearlyPrice: isYearly ? price : Math.round(price * 10) || price,
    benefits: parseBenefits(plan.benefits),
    enabled: plan.isActive,
    featured: plan.isFeatured,
    badge: plan.isFeatured ? 'Featured' : undefined,
    accent: ACCENTS[index % ACCENTS.length]!,
  }
}

export function PlansStudio() {
  const prefersReducedMotion = useReducedMotion()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<CreatorPlan | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [chatDrafts, setChatDrafts] = useState<ChatPlanDraft[]>(
    emptyChatPlanDrafts()
  )
  const [chatSaving, setChatSaving] = useState(false)
  const [chatMessage, setChatMessage] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [planError, setPlanError] = useState<string | null>(null)

  const plansQuery = useQuery({
    queryKey: ['creator-plans'],
    queryFn: async () => {
      const res = await api<{ items: ApiPlan[] }>('/creators/me/plans')
      return res.items ?? []
    },
  })

  const apiPlans = plansQuery.data ?? []

  const visibleApiPlans = useMemo(() => {
    const want = billing === 'yearly' ? 'YEARLY' : 'MONTHLY'
    const filtered = apiPlans.filter(
      (p) => p.interval.toUpperCase() === want
    )
    return (filtered.length > 0 ? filtered : apiPlans).slice().sort(
      (a, b) => a.sortOrder - b.sortOrder
    )
  }, [apiPlans, billing])

  const plans = useMemo(
    () => visibleApiPlans.map(toStudioPlan),
    [visibleApiPlans]
  )

  useEffect(() => {
    if (!plans.length) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !plans.some((p) => p.id === selectedId)) {
      setSelectedId(plans[0]!.id)
    }
  }, [plans, selectedId])

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await api<{
          allPlans?: ChatPlan[]
          plans: ChatPlan[]
        }>(`/chat/plans/${user.id}`)
        if (cancelled) return
        setChatDrafts(draftsFromPlans(res.allPlans ?? res.plans))
      } catch {
        // Keep defaults when plans have not been configured yet.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  async function saveChatPlans() {
    setChatSaving(true)
    setChatError(null)
    setChatMessage(null)
    try {
      await api('/chat/plans/me', {
        method: 'PUT',
        body: JSON.stringify(draftsToPayload(chatDrafts)),
      })
      setChatMessage('Chat plans saved')
    } catch (e) {
      setChatError(e instanceof Error ? e.message : 'Failed to save chat plans')
    } finally {
      setChatSaving(false)
    }
  }

  const savePlanMutation = useMutation({
    mutationFn: async (plan: CreatorPlan) => {
      const interval = billing === 'yearly' ? 'YEARLY' : 'MONTHLY'
      const price =
        billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
      const body = {
        name: plan.name.trim(),
        description: plan.description.trim() || null,
        interval,
        price,
        currency: 'INR',
        benefits: plan.benefits,
        isActive: plan.enabled,
        isFeatured: Boolean(plan.featured),
      }
      const exists = apiPlans.some((p) => p.id === plan.id)
      if (exists) {
        return api<{ plan: ApiPlan }>(`/creators/me/plans/${plan.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        })
      }
      return api<{ plan: ApiPlan }>('/creators/me/plans', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: async (result) => {
      setPlanError(null)
      setEditorOpen(false)
      setSelectedId(result.plan.id)
      await queryClient.invalidateQueries({ queryKey: ['creator-plans'] })
    },
    onError: (e) => {
      setPlanError(
        e instanceof ApiError || e instanceof Error
          ? e.message
          : 'Failed to save plan'
      )
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async (plan: CreatorPlan) =>
      api(`/creators/me/plans/${plan.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !plan.enabled }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['creator-plans'] })
    },
  })

  const reorderMutation = useMutation({
    mutationFn: async (ordered: CreatorPlan[]) => {
      await Promise.all(
        ordered.map((plan, index) =>
          api(`/creators/me/plans/${plan.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ sortOrder: index }),
          })
        )
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['creator-plans'] })
    },
  })

  const selected = plans.find((p) => p.id === selectedId) ?? plans[0] ?? null

  function reorder(from: number, to: number) {
    if (from === to || from < 0 || to < 0) return
    const next = [...plans]
    const [item] = next.splice(from, 1)
    if (!item) return
    next.splice(to, 0, item)
    reorderMutation.mutate(next)
  }

  function onDragStart(index: number, e: DragEvent) {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  function onDrop(index: number, e: DragEvent) {
    e.preventDefault()
    const from = Number(e.dataTransfer.getData('text/plain'))
    if (Number.isFinite(from)) reorder(from, index)
    setDragIndex(null)
  }

  return (
    <div>
      <StudioPageHeader
        title="Subscription Plans"
        description="Create a simple monthly or yearly plan that unlocks every Subscribers Only post."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setEditorOpen(true)
            }}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-4 text-[13px] font-semibold text-white shadow-[0_12px_32px_rgba(217,70,239,0.35)]"
          >
            <Plus className="size-4" />
            Create plan
          </button>
        }
      />

      {plansQuery.isLoading ? (
        <p className="mb-4 text-sm text-white/45">Loading plans…</p>
      ) : null}
      {planError ? (
        <p className="mb-4 text-sm text-rose-400">{planError}</p>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-white/40">
          Drag cards to reorder · toggle to enable/disable
        </p>
        <div className="flex rounded-full border border-white/10 bg-white/[0.03] p-1">
          {(['monthly', 'yearly'] as const).map((id) => {
            const active = billing === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setBilling(id)}
                className={cn(
                  'relative rounded-full px-4 py-2 text-[12px] font-semibold capitalize transition',
                  active ? 'text-black' : 'text-white/50 hover:text-white'
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="plans-billing"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 420, damping: 34 }
                    }
                  />
                ) : null}
                <span className="relative z-10">{id}</span>
              </button>
            )
          })}
        </div>
      </div>

      {plans.length === 0 ? (
        <p className="mb-8 text-sm text-white/45">
          No {billing} plans yet. Create one to offer subscriptions to fans.
        </p>
      ) : (
        <div className="grid gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <AnimatePresence mode="popLayout">
              <div className="grid gap-4 sm:grid-cols-2">
                {plans.map((plan, index) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedId(plan.id)}
                    className={cn(
                      'rounded-[30px] transition',
                      selectedId === plan.id &&
                        'ring-2 ring-fuchsia-400/35 ring-offset-2 ring-offset-[#06060a]',
                      dragIndex === index && 'opacity-60'
                    )}
                  >
                    <PlanPricingCard
                      plan={plan}
                      billing={billing}
                      index={index}
                      onEdit={() => {
                        setEditing(plan)
                        setEditorOpen(true)
                      }}
                      onToggle={() => toggleMutation.mutate(plan)}
                      onDragStart={(e) => onDragStart(index, e)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => onDrop(index, e)}
                    />
                  </div>
                ))}
              </div>
            </AnimatePresence>
          </div>

          <div className="xl:col-span-2">
            <div className="sticky top-24">
              <PlanPreviewPanel plan={selected} billing={billing} />
            </div>
          </div>
        </div>
      )}

      <PlanEditorModal
        open={editorOpen}
        plan={editing}
        billing={billing}
        onBillingChange={setBilling}
        onClose={() => setEditorOpen(false)}
        onSave={(plan) => savePlanMutation.mutate(plan)}
      />

      <section className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Chat billing plans</h2>
            <p className="mt-1 max-w-2xl text-[13px] text-white/45">
              Offer a timed package, per-minute chat, or per-message pricing. Images
              and voice notes are included in package and per-minute plans.
            </p>
          </div>
          <Button
            type="button"
            disabled={chatSaving}
            onClick={() => void saveChatPlans()}
          >
            {chatSaving ? 'Saving…' : 'Save chat plans'}
          </Button>
        </div>
        {chatMessage ? (
          <p className="mt-3 text-[13px] text-emerald-400">{chatMessage}</p>
        ) : null}
        {chatError ? (
          <p className="mt-3 text-[13px] text-rose-400">{chatError}</p>
        ) : null}
        <ChatPlanEditor
          className="mt-5"
          drafts={chatDrafts}
          onChange={setChatDrafts}
        />
      </section>
    </div>
  )
}
