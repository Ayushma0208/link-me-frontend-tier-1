'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

import { testimonials } from '@/data/landing'
import { cn } from '@/lib/utils'

interface TestimonialsProps {
  className?: string
}

export function Testimonials({ className }: TestimonialsProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      id="business"
      className={cn('relative bg-black py-20 sm:py-28', className)}
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-medium tracking-[0.18em] text-white/45 uppercase">
            Testimonials
          </p>
          <h2
            id="testimonials-heading"
            className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.75rem]"
          >
            Creators feel the difference
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.blockquote
              key={item.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="flex flex-col rounded-[24px] border border-white/10 bg-white/[0.03] p-6 sm:p-7"
            >
              <p className="flex-1 text-[15px] leading-relaxed text-white/80 sm:text-base">
                “{item.quote}”
              </p>
              <footer className="mt-8 flex items-center gap-3">
                <span className="relative size-11 overflow-hidden rounded-full border border-white/10">
                  <Image src={item.avatar} alt="" fill sizes="44px" className="object-cover" />
                </span>
                <div>
                  <cite className="not-italic text-sm font-semibold text-white">{item.name}</cite>
                  <p className="text-sm text-white/50">{item.role}</p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
