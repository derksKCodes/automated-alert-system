"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Database, FileImage, Trash2, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ExportRecord {
  id: string
  filename: string
  format: "csv" | "json" | "pdf"
  size: number
  createdAt: Date
  downloadCount: number
  filters?: any
}

export function ExportHistory() {
  const [exports, setExports] = useState<ExportRecord[]>([])

  // Mock export history - in real app would load from API
  useEffect(() => {
    const mockExports: ExportRecord[] = [
      {
        id: "1",
        filename: "alerts-export-2024-01-15.csv",
        format: "csv",
        size: 245760,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        downloadCount: 3,
        filters: { categoryId: 2, urgencyLevel: 4 },
      },
      {
        id: "2",
        filename: "alerts-report-2024-01-14.json",
        format: "json",
        size: 512000,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        downloadCount: 1,
        filters: { includeAnalytics: true },
      },
      {
        id: "3",
        filename: "alerts-report-2024-01-13.html",
        format: "pdf",
        size: 1024000,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        downloadCount: 5,
      },
    ]

    setExports(mockExports)
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
        return <FileText className="h-4 w-4" />
      case "json":
        return <Database className="h-4 w-4" />
      case "pdf":
        return <FileImage className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getFormatColor = (format: string) => {
    switch (format) {
      case "csv":
        return "bg-green-50 text-green-700 border-green-200"
      case "json":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "pdf":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const handleDownload = (exportRecord: ExportRecord) => {
    // Mock download - in real app would download actual file
    console.log("Downloading:", exportRecord.filename)

    // Update download count
    setExports((prev) =>
      prev.map((exp) => (exp.id === exportRecord.id ? { ...exp, downloadCount: exp.downloadCount + 1 } : exp)),
    )
  }

  const handleDelete = (exportId: string) => {
    setExports((prev) => prev.filter((exp) => exp.id !== exportId))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Export History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {exports.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No exports yet</p>
            <p className="text-sm">Your exported files will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exports.map((exportRecord) => (
              <div key={exportRecord.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">{getFormatIcon(exportRecord.format)}</div>
                  <div>
                    <h4 className="font-medium text-slate-800">{exportRecord.filename}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getFormatColor(exportRecord.format)}>{exportRecord.format.toUpperCase()}</Badge>
                      <span className="text-sm text-slate-500">{formatFileSize(exportRecord.size)}</span>
                      <span className="text-sm text-slate-500">
                        {formatDistanceToNow(exportRecord.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    {exportRecord.downloadCount > 0 && (
                      <p className="text-xs text-slate-400 mt-1">Downloaded {exportRecord.downloadCount} times</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(exportRecord)}>
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(exportRecord.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
