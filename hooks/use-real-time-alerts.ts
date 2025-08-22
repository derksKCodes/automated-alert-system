"use client"

import { useState, useEffect, useCallback } from "react"
import { DatabaseService, type Alert } from "@/lib/database"
import { useToast } from "@/components/notifications/toast-provider"

interface UseRealTimeAlertsOptions {
  pollInterval?: number
  soundEnabled?: boolean
}

export function useRealTimeAlerts({ pollInterval = 30000, soundEnabled = true }: UseRealTimeAlertsOptions = {}) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const { showToast } = useToast()

  // Load initial alerts
  const loadAlerts = useCallback(async () => {
    try {
      const alertsData = await DatabaseService.getAlerts()
      setAlerts(alertsData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Failed to load alerts:", error)
      showToast({
        type: "error",
        title: "Failed to load alerts",
        description: "Please check your connection and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  // Check for new alerts
  const checkForNewAlerts = useCallback(async () => {
    try {
      const newAlertsData = await DatabaseService.getAlerts()

      // Find truly new alerts (not just updates)
      const existingIds = new Set(alerts.map((alert) => alert.id))
      const newAlerts = newAlertsData.filter((alert) => !existingIds.has(alert.id))

      if (newAlerts.length > 0) {
        setAlerts(newAlertsData)
        setLastUpdate(new Date())

        // Show notifications for new alerts
        newAlerts.forEach((alert) => {
          const toastType = alert.urgency_level >= 4 ? "warning" : "info"

          showToast({
            type: toastType,
            title: `New ${alert.urgency_level >= 4 ? "High Priority" : ""} Alert`,
            description: alert.title,
            duration: alert.urgency_level >= 4 ? 10000 : 5000,
          })

          // Play sound notification
          if (soundEnabled && (window as any).playNotificationSound) {
            ;(window as any).playNotificationSound(alert.urgency_level)
          }
        })

        // Show summary if multiple new alerts
        if (newAlerts.length > 1) {
          showToast({
            type: "info",
            title: "Multiple New Alerts",
            description: `${newAlerts.length} new alerts received`,
            duration: 7000,
          })
        }
      } else {
        // Update existing alerts (for read status changes, etc.)
        setAlerts(newAlertsData)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Failed to check for new alerts:", error)
    }
  }, [alerts, showToast, soundEnabled])

  // Set up polling
  useEffect(() => {
    loadAlerts()

    const interval = setInterval(checkForNewAlerts, pollInterval)
    return () => clearInterval(interval)
  }, [loadAlerts, checkForNewAlerts, pollInterval])

  // Manual refresh
  const refresh = useCallback(async () => {
    setIsLoading(true)
    await loadAlerts()
  }, [loadAlerts])

  return {
    alerts,
    isLoading,
    lastUpdate,
    refresh,
  }
}
