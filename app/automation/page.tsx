"use client"

import { AutomationPanel } from "@/components/dashboard/automation-panel"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ToastProvider } from "@/components/notifications/toast-provider"

export default function AutomationPage() {
  const handleLogout = () => {
    window.location.href = "/"
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader unreadCount={0} onSearch={() => {}} onLogout={handleLogout} />

        <main className="container mx-auto px-6 py-8">
          <AutomationPanel />
        </main>
      </div>
    </ToastProvider>
  )
}
