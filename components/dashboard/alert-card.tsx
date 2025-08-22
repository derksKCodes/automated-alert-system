"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Clock, Eye, Archive, AlertTriangle, Shield, TrendingUp, Heart, Leaf } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Alert } from "@/lib/database"

interface AlertCardProps {
  alert: Alert
  onMarkAsRead: (id: number) => void
  onArchive: (id: number) => void
}

const categoryIcons = {
  1: TrendingUp, // Technology
  2: Shield, // Security
  3: TrendingUp, // Business
  4: Heart, // Health
  5: Leaf, // Environment
}

const urgencyColors = {
  5: "bg-red-100 text-red-800 border-red-200",
  4: "bg-orange-100 text-orange-800 border-orange-200",
  3: "bg-yellow-100 text-yellow-800 border-yellow-200",
  2: "bg-blue-100 text-blue-800 border-blue-200",
  1: "bg-gray-100 text-gray-800 border-gray-200",
}

const urgencyLabels = {
  5: "Critical",
  4: "High",
  3: "Medium",
  2: "Low",
  1: "Info",
}

export function AlertCard({ alert, onMarkAsRead, onArchive }: AlertCardProps) {
  const IconComponent = categoryIcons[alert.category_id as keyof typeof categoryIcons] || AlertTriangle
  const urgencyClass = urgencyColors[alert.urgency_level as keyof typeof urgencyColors]
  const urgencyLabel = urgencyLabels[alert.urgency_level as keyof typeof urgencyLabels]

  return (
    <Card className={`transition-all hover:shadow-md ${!alert.is_read ? "ring-2 ring-blue-200" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <IconComponent className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 line-clamp-2">{alert.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs ${urgencyClass}`}>{urgencyLabel}</Badge>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(alert.published_at, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {!alert.is_read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-slate-600 line-clamp-3 mb-4">{alert.content}</p>

        {alert.keywords_matched.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {alert.keywords_matched.slice(0, 3).map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {alert.keywords_matched.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{alert.keywords_matched.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {!alert.is_read && (
              <Button variant="outline" size="sm" onClick={() => onMarkAsRead(alert.id)}>
                <Eye className="h-3 w-3 mr-1" />
                Mark Read
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={() => onArchive(alert.id)}>
              <Archive className="h-3 w-3 mr-1" />
              Archive
            </Button>
          </div>

          {alert.url && (
            <Button variant="ghost" size="sm" asChild>
              <a href={alert.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                View Source
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
