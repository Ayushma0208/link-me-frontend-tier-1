import { Sidebar, type NavItem } from './Sidebar'

interface PanelLayoutProps {
  title: string
  subtitle: string
  navItems: NavItem[]
  children: React.ReactNode
}

export function PanelLayout({ title, subtitle, navItems, children }: PanelLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#07070b] text-white">
      <Sidebar title={title} subtitle={subtitle} items={navItems} />
      <main className="relative flex-1 overflow-auto pt-14 pb-24 md:pt-0 md:pb-0">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(76,110,245,0.08),transparent_45%)]"
        />
        <div className="relative px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</div>
      </main>
    </div>
  )
}
