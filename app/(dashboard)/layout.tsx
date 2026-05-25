import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import FAB from '@/components/layout/FAB'
import { ToastProvider } from '@/components/layout/Toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
        <Sidebar />
        <main className="flex-1 pb-24 md:pb-0">
          <div className="container-custom">
            {children}
          </div>
        </main>
        <BottomNav />
        <FAB />
      </div>
    </ToastProvider>
  )
}
