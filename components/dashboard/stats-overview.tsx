"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Shield, TrendingUp, Clock } from "lucide-react"

interface StatsOverviewProps {
  totalAlerts: number
  highUrgencyAlerts: number
  totalDataPoints: number
  lastUpdated: Date
}

export function StatsOverview({ totalAlerts, highUrgencyAlerts, totalDataPoints, lastUpdated }: StatsOverviewProps) {
  const stats = [
    {
      title: "Current Alerts",
      value: totalAlerts,
      icon: AlertTriangle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "High Urgency",
      value: highUrgencyAlerts,
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Total Data Points",
      value: totalDataPoints.toLocaleString(),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Last Updated",
      value: lastUpdated.toLocaleTimeString(),
      icon: Clock,
      color: "text-slate-600",
      bgColor: "bg-slate-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
