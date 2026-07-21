'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

import type { PublicStoreItem } from '@/data/public-creator'
import { cn, formatCurrency } from '@/lib/utils'

export interface StoreSectionProps {
  items: PublicStoreItem[]
  className?: string
}

export function StoreSection({ items, className }: StoreSectionProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {items.map((item, index) => (
        <motion.article
          key={item.id}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          whileHover={prefersReducedMotion ? undefined : { y: -4 }}
          className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] backdrop-blur-xl"
        >
          <div className="relative aspect-square">
            <Image
              src={item.imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 280px"
            />
            {item.badge ? (
              <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold tracking-wide text-black uppercase">
                {item.badge}
              </span>
            ) : null}
          </div>
          <div className="space-y-3 p-4">
            <div>
              <h3 className="text-[15px] font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-[13px] text-white/45">{item.description}</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[15px] font-bold text-white">
                {formatCurrency(item.price)}
              </p>
              <button
                type="button"
                className="rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-black hover:bg-neutral-100"
              >
                Buy
              </button>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  )
}
