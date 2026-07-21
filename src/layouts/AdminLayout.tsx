import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Video,
  MessageSquare,
} from 'lucide-react'
import { PanelLayout } from '@/components/layout/PanelLayout'

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'AI Creators', href: '/admin/influencers', icon: Users },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelLayout
      title="LinkMe Admin"
      subtitle="AI Creator Management"
      navItems={adminNav}
    >
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-100">
          <Video className="size-4 shrink-0 text-emerald-300" aria-hidden />
          <p>
            Video calls to AI creators ring here. Keep this admin tab open — an
            Accept / Decline banner appears at the top when a fan calls.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-[13px] text-sky-100">
          <MessageSquare className="size-4 shrink-0 text-sky-300" aria-hidden />
          <p>
            Fan chats appear under Messages — each thread shows which user is
            texting which influencer. Reply manually or with AI as that creator.
          </p>
        </div>
      </div>
      {children}
    </PanelLayout>
  )
}
