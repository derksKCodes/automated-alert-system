"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Database, FileImage, Filter } from "lucide-react"
import type { Category } from "@/lib/database"
import type { ExportOptions } from "@/lib/export/export-service"

interface ExportDialogProps {
  categories: Category[]
  totalAlerts: number
  onExport: (options: ExportOptions) => void
  isExporting?: boolean
}

export function ExportDialog({ categories, totalAlerts, onExport, isExporting = false }: ExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "json" | "pdf">("csv")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [showRead, setShowRead] = useState<boolean | undefined>(undefined)
  const [includeAnalytics, setIncludeAnalytics] = useState(false)
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "title",
    "category",
    "urgency_level",
    "published_at",
    "is_read",
  ])

  const availableFields = [
    { id: "id", label: "ID" },
    { id: "title", label: "Title" },
    { id: "content", label: "Content" },
    { id: "category", label: "Category" },
    { id: "urgency_level", label: "Urgency Level" },
    { id: "sentiment_score", label: "Sentiment Score" },
    { id: "keywords_matched", label: "Keywords" },
    { id: "url", label: "Source URL" },
    { id: "published_at", label: "Published Date" },
    { id: "created_at", label: "Created Date" },
    { id: "is_read", label: "Read Status" },
    { id: "is_archived", label: "Archived Status" },
  ]

  const handleExport = () => {
    const options: ExportOptions = {
      format,
      includeAnalytics,
      fields: selectedFields,
      filters: {
        ...(selectedCategory !== "all" && { categoryId: Number(selectedCategory) }),
        ...(selectedUrgency !== "all" && { urgencyLevel: Number(selectedUrgency) }),
        ...(showRead !== undefined && { isRead: showRead }),
        ...(dateRange.start &&
          dateRange.end && {
            dateRange: {
              start: new Date(dateRange.start),
              end: new Date(dateRange.end),
            },
          }),
      },
    }

    onExport(options)
  }

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) => (prev.includes(fieldId) ? prev.filter((f) => f !== fieldId) : [...prev, fieldId]))
  }

  const formatIcons = {
    csv: FileText,
    json: Database,
    pdf: FileImage,
  }

  const FormatIcon = formatIcons[format]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Alerts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Alerts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(value: any) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV - Spreadsheet format
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    JSON - Structured data
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    PDF - Report format
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label className="text-base font-medium">Filters</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Urgency Filter */}
              <div className="space-y-2">
                <Label>Minimum Urgency</Label>
                <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="5">Critical (5)</SelectItem>
                    <SelectItem value="4">High (4)</SelectItem>
                    <SelectItem value="3">Medium (3)</SelectItem>
                    <SelectItem value="2">Low (2)</SelectItem>
                    <SelectItem value="1">Info (1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>

            {/* Read Status */}
            <div className="space-y-2">
              <Label>Read Status</Label>
              <Select
                value={showRead === undefined ? "all" : showRead ? "read" : "unread"}
                onValueChange={(value) => setShowRead(value === "all" ? undefined : value === "read" ? true : false)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="read">Read Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Field Selection (for CSV/JSON) */}
          {format !== "pdf" && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Fields to Include</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => toggleField(field.id)}
                    />
                    <Label htmlFor={field.id} className="text-sm">
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedFields(availableFields.map((f) => f.id))}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedFields([])}>
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Options */}
          {format === "json" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="analytics"
                checked={includeAnalytics}
                onCheckedChange={(checked) => setIncludeAnalytics(checked as boolean)}
              />
              <Label htmlFor="analytics">Include analytics summary</Label>
            </div>
          )}

          {/* Preview */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Export Preview</span>
              <Badge variant="outline">{totalAlerts} total alerts</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FormatIcon className="h-4 w-4" />
              <span>Format: {format.toUpperCase()}</span>
              {selectedFields.length > 0 && <span>• {selectedFields.length} fields</span>}
              {includeAnalytics && <span>• With analytics</span>}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-3">
            <DialogTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogTrigger>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
