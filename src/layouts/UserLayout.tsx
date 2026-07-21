import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

/** Thin alias — prefer importing DashboardLayout from `@/components/dashboard`. */
export function UserLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
