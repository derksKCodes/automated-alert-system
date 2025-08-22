// Export service for generating various file formats
import type { Alert, Category } from "@/lib/database"

export interface ExportOptions {
  format: "csv" | "json" | "pdf"
  filters?: {
    categoryId?: number
    urgencyLevel?: number
    dateRange?: { start: Date; end: Date }
    isRead?: boolean
  }
  fields?: string[]
  includeAnalytics?: boolean
}

export interface ExportResult {
  filename: string
  data: string | Blob
  mimeType: string
  size: number
}

export class ExportService {
  // Export alerts to CSV format
  static exportToCSV(alerts: Alert[], categories: Category[], options: ExportOptions): ExportResult {
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

    // Define available fields
    const allFields = [
      "id",
      "title",
      "content",
      "category",
      "urgency_level",
      "sentiment_score",
      "keywords_matched",
      "url",
      "published_at",
      "created_at",
      "is_read",
      "is_archived",
    ]

    const fields = options.fields || allFields

    // Create CSV header
    const header = fields.join(",")

    // Create CSV rows
    const rows = alerts.map((alert) => {
      return fields
        .map((field) => {
          let value: any

          switch (field) {
            case "category":
              value = categoryMap.get(alert.category_id) || "Unknown"
              break
            case "keywords_matched":
              value = alert.keywords_matched.join("; ")
              break
            case "published_at":
            case "created_at":
              value = new Date(alert[field]).toISOString()
              break
            case "content":
            case "title":
              // Escape quotes and newlines for CSV
              value = `"${alert[field].replace(/"/g, '""').replace(/\n/g, " ")}"`
              return value
            default:
              value = alert[field as keyof Alert]
          }

          // Handle null/undefined values
          if (value === null || value === undefined) {
            return ""
          }

          // Wrap in quotes if contains comma or quotes
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }

          return value
        })
        .join(",")
    })

    const csvContent = [header, ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

    return {
      filename: `alerts-export-${new Date().toISOString().split("T")[0]}.csv`,
      data: blob,
      mimeType: "text/csv",
      size: blob.size,
    }
  }

  // Export alerts to JSON format
  static exportToJSON(alerts: Alert[], categories: Category[], options: ExportOptions): ExportResult {
    const categoryMap = new Map(categories.map((c) => [c.id, c]))

    // Enrich alerts with category information
    const enrichedAlerts = alerts.map((alert) => ({
      ...alert,
      category: categoryMap.get(alert.category_id),
    }))

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalAlerts: alerts.length,
        filters: options.filters,
        version: "1.0",
      },
      categories: categories,
      alerts: enrichedAlerts,
    }

    // Add analytics if requested
    if (options.includeAnalytics) {
      exportData.metadata = {
        ...exportData.metadata,
        analytics: this.generateAnalytics(alerts, categories),
      } as any
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })

    return {
      filename: `alerts-export-${new Date().toISOString().split("T")[0]}.json`,
      data: blob,
      mimeType: "application/json",
      size: blob.size,
    }
  }

  // Export alerts to PDF format (simplified - would use proper PDF library in production)
  static exportToPDF(alerts: Alert[], categories: Category[], options: ExportOptions): ExportResult {
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Alerts Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .alert { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
          .alert.critical { border-left: 5px solid #ef4444; }
          .alert.high { border-left: 5px solid #f97316; }
          .alert.medium { border-left: 5px solid #eab308; }
          .alert.low { border-left: 5px solid #3b82f6; }
          .alert.info { border-left: 5px solid #6b7280; }
          .meta { color: #666; font-size: 0.9em; }
          .keywords { background: #f5f5f5; padding: 5px; border-radius: 3px; margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Alerts Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Total Alerts: ${alerts.length}</p>
        </div>
        
        ${alerts
          .map((alert) => {
            const urgencyClass = ["info", "low", "medium", "high", "critical"][alert.urgency_level - 1] || "info"
            return `
              <div class="alert ${urgencyClass}">
                <h3>${alert.title}</h3>
                <div class="meta">
                  Category: ${categoryMap.get(alert.category_id) || "Unknown"} | 
                  Urgency: ${alert.urgency_level}/5 | 
                  Date: ${new Date(alert.published_at).toLocaleString()}
                </div>
                <p>${alert.content}</p>
                ${
                  alert.keywords_matched.length > 0
                    ? `<div class="keywords">Keywords: ${alert.keywords_matched.join(", ")}</div>`
                    : ""
                }
                ${alert.url ? `<p><a href="${alert.url}">Source Link</a></p>` : ""}
              </div>
            `
          })
          .join("")}
      </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" })

    return {
      filename: `alerts-report-${new Date().toISOString().split("T")[0]}.html`,
      data: blob,
      mimeType: "text/html",
      size: blob.size,
    }
  }

  // Generate analytics summary
  private static generateAnalytics(alerts: Alert[], categories: Category[]) {
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

    return {
      totalAlerts: alerts.length,
      urgencyDistribution: {
        critical: alerts.filter((a) => a.urgency_level === 5).length,
        high: alerts.filter((a) => a.urgency_level === 4).length,
        medium: alerts.filter((a) => a.urgency_level === 3).length,
        low: alerts.filter((a) => a.urgency_level === 2).length,
        info: alerts.filter((a) => a.urgency_level === 1).length,
      },
      categoryDistribution: categories.map((category) => ({
        name: category.name,
        count: alerts.filter((a) => a.category_id === category.id).length,
      })),
      readStatus: {
        read: alerts.filter((a) => a.is_read).length,
        unread: alerts.filter((a) => !a.is_read).length,
      },
      averageSentiment: alerts.reduce((sum, a) => sum + (a.sentiment_score || 0), 0) / alerts.length,
      topKeywords: this.getTopKeywords(alerts),
    }
  }

  // Get top keywords from alerts
  private static getTopKeywords(alerts: Alert[], limit = 10) {
    const keywordCounts = new Map<string, number>()

    alerts.forEach((alert) => {
      alert.keywords_matched.forEach((keyword) => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1)
      })
    })

    return Array.from(keywordCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([keyword, count]) => ({ keyword, count }))
  }

  // Apply filters to alerts
  static applyFilters(alerts: Alert[], filters?: ExportOptions["filters"]): Alert[] {
    if (!filters) return alerts

    return alerts.filter((alert) => {
      if (filters.categoryId && alert.category_id !== filters.categoryId) return false
      if (filters.urgencyLevel && alert.urgency_level < filters.urgencyLevel) return false
      if (filters.isRead !== undefined && alert.is_read !== filters.isRead) return false

      if (filters.dateRange) {
        const alertDate = new Date(alert.published_at)
        if (alertDate < filters.dateRange.start || alertDate > filters.dateRange.end) return false
      }

      return true
    })
  }

  // Main export function
  static async exportAlerts(alerts: Alert[], categories: Category[], options: ExportOptions): Promise<ExportResult> {
    // Apply filters
    const filteredAlerts = this.applyFilters(alerts, options.filters)

    // Export based on format
    switch (options.format) {
      case "csv":
        return this.exportToCSV(filteredAlerts, categories, options)
      case "json":
        return this.exportToJSON(filteredAlerts, categories, options)
      case "pdf":
        return this.exportToPDF(filteredAlerts, categories, options)
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }
}
