"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { AlertFilters } from "@/components/dashboard/alert-filters"
import { AlertsList } from "@/components/dashboard/alerts-list"
import { RealTimeStatus } from "@/components/dashboard/real-time-status"
import { AlertAnalytics } from "@/components/dashboard/alert-analytics"
import { ExportHistory } from "@/components/dashboard/export-history"
import { SoundManager } from "@/components/notifications/sound-manager"
import { ToastProvider, useToast } from "@/components/notifications/toast-provider"
import { useRealTimeAlerts } from "@/hooks/use-real-time-alerts"
import { DatabaseService, type Category } from "@/lib/database"
import type { ExportOptions } from "@/lib/export/export-service"

function DashboardContent() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number>()
  const [selectedUrgency, setSelectedUrgency] = useState<number>()
  const [showRead, setShowRead] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [showExportHistory, setShowExportHistory] = useState(false)
  const { showToast } = useToast()

  // Use real-time alerts hook
  const { alerts, isLoading, lastUpdate, refresh } = useRealTimeAlerts({
    pollInterval: 30000,
    soundEnabled,
  })

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await DatabaseService.getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Failed to load categories:", error)
      }
    }
    loadCategories()
  }, [])

  // Filter alerts based on current filters
  const filteredAlerts = alerts.filter((alert) => {
    if (selectedCategory && alert.category_id !== selectedCategory) return false
    if (selectedUrgency && alert.urgency_level < selectedUrgency) return false
    if (!showRead && alert.is_read) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        alert.title.toLowerCase().includes(query) ||
        alert.content.toLowerCase().includes(query) ||
        alert.keywords_matched.some((keyword) => keyword.toLowerCase().includes(query))
      )
    }
    return true
  })

  const handleExport = async (options: ExportOptions) => {
    setIsExporting(true)

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      })

      const result = await response.json()

      if (result.success) {
        // Create download link
        const byteCharacters = atob(result.data.data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: result.data.mimeType })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = result.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        showToast({
          type: "success",
          title: "Export completed",
          description: `Downloaded ${result.data.filename}`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleMarkAsRead = async (alertId: number) => {
    try {
      await DatabaseService.markAlertAsRead(alertId)
    } catch (error) {
      console.error("Failed to mark alert as read:", error)
    }
  }

  const handleArchive = async (alertId: number) => {
    try {
      await DatabaseService.archiveAlert(alertId)
    } catch (error) {
      console.error("Failed to archive alert:", error)
    }
  }

  const handleLogout = () => {
    window.location.href = "/"
  }

  const handleClearFilters = () => {
    setSelectedCategory(undefined)
    setSelectedUrgency(undefined)
    setShowRead(false)
    setSearchQuery("")
  }

  // Calculate stats
  const unreadCount = alerts.filter((alert) => !alert.is_read).length
  const highUrgencyCount = alerts.filter((alert) => alert.urgency_level >= 4).length
  const totalDataPoints = alerts.length * 10

  return (
    <div className="min-h-screen bg-slate-50">
      <SoundManager enabled={soundEnabled} />

      <DashboardHeader
        unreadCount={unreadCount}
        onSearch={setSearchQuery}
        onLogout={handleLogout}
        categories={categories}
        totalAlerts={alerts.length}
        onExport={handleExport}
        isExporting={isExporting}
      />

      <main className="container mx-auto px-6 py-8">
        {/* Real-time Status */}
        <div className="mb-6">
          <RealTimeStatus
            lastUpdate={lastUpdate}
            isConnected={!isLoading}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
          />
        </div>

        <StatsOverview
          totalAlerts={alerts.length}
          highUrgencyAlerts={highUrgencyCount}
          totalDataPoints={totalDataPoints}
          lastUpdated={lastUpdate}
        />

        {/* Analytics */}
        <AlertAnalytics alerts={alerts} categories={categories} />

        {/* Export History Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowExportHistory(!showExportHistory)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showExportHistory ? "Hide" : "Show"} Export History
          </button>
        </div>

        {/* Export History */}
        {showExportHistory && (
          <div className="mb-8">
            <ExportHistory />
          </div>
        )}

        <AlertFilters
          categories={categories}
          selectedCategory={selectedCategory}
          selectedUrgency={selectedUrgency}
          showRead={showRead}
          onCategoryChange={setSelectedCategory}
          onUrgencyChange={setSelectedUrgency}
          onShowReadChange={setShowRead}
          onClearFilters={handleClearFilters}
        />

        <AlertsList
          alerts={filteredAlerts}
          isLoading={isLoading}
          onRefresh={refresh}
          onMarkAsRead={handleMarkAsRead}
          onArchive={handleArchive}
        />
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  )
}
