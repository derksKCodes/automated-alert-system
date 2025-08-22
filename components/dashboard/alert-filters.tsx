"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X } from "lucide-react"
import type { Category } from "@/lib/database"

interface AlertFiltersProps {
  categories: Category[]
  selectedCategory?: number
  selectedUrgency?: number
  showRead: boolean
  onCategoryChange: (categoryId?: number) => void
  onUrgencyChange: (urgency?: number) => void
  onShowReadChange: (showRead: boolean) => void
  onClearFilters: () => void
}

export function AlertFilters({
  categories,
  selectedCategory,
  selectedUrgency,
  showRead,
  onCategoryChange,
  onUrgencyChange,
  onShowReadChange,
  onClearFilters,
}: AlertFiltersProps) {
  const hasActiveFilters = selectedCategory || selectedUrgency || showRead

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-lg mb-6">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">Filters:</span>
      </div>

      {/* Category Filter */}
      <Select
        value={selectedCategory?.toString() || "all"}
        onValueChange={(value) => onCategoryChange(value === "all" ? undefined : Number(value))}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Category" />
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

      {/* Urgency Filter */}
      <Select
        value={selectedUrgency?.toString() || "all"}
        onValueChange={(value) => onUrgencyChange(value === "all" ? undefined : Number(value))}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Urgency" />
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

      {/* Show Read Toggle */}
      <Button variant={showRead ? "default" : "outline"} size="sm" onClick={() => onShowReadChange(!showRead)}>
        {showRead ? "Hide Read" : "Show Read"}
      </Button>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}

      {/* Active Filter Badges */}
      <div className="flex gap-2">
        {selectedCategory && (
          <Badge variant="secondary">{categories.find((c) => c.id === selectedCategory)?.name}</Badge>
        )}
        {selectedUrgency && <Badge variant="secondary">Urgency: {selectedUrgency}</Badge>}
      </div>
    </div>
  )
}
