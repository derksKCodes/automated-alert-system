"use client"

import { AlertCard } from "./alert-card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import type { Alert } from "@/lib/database"

interface AlertsListProps {
  alerts: Alert[]
  isLoading: boolean
  onRefresh: () => void
  onMarkAsRead: (id: number) => void
  onArchive: (id: number) => void
}

export function AlertsList({ alerts, isLoading, onRefresh, onMarkAsRead, onArchive }: AlertsListProps) {
  if (alerts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <RefreshCw className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No alerts found</h3>
          <p className="text-sm">Try adjusting your filters or refresh to check for new alerts.</p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Alerts
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Alerts ({alerts.length})</h2>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} onMarkAsRead={onMarkAsRead} onArchive={onArchive} />
        ))}
      </div>
    </div>
  )
}
