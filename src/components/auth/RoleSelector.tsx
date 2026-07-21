'use client'

import { Users } from 'lucide-react'

import { RoleCard, type SignupRole } from '@/components/auth/RoleCard'
import { cn } from '@/lib/utils'

export type { SignupRole }

export interface RoleSelectorProps {
  value: SignupRole | null
  onChange: (role: SignupRole) => void
  className?: string
}

/** Fan-only role picker. Creator accounts are admin-managed. */
const ROLES = [
  {
    id: 'user' as const,
    title: 'User',
    description: 'Follow creators, subscribe, unlock exclusive content.',
    icon: Users,
  },
]

export function RoleSelector({ value, onChange, className }: RoleSelectorProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-[12px] font-medium tracking-[0.14em] text-white/45 uppercase">
        Continue as
      </p>
      <div className="grid gap-3">
        {ROLES.map((role) => (
          <RoleCard
            key={role.id}
            id={role.id}
            title={role.title}
            description={role.description}
            icon={role.icon}
            selected={value === role.id}
            onSelect={onChange}
          />
        ))}
      </div>
    </div>
  )
}
