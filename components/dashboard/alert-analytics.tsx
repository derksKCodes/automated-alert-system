"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { Alert, Category } from "@/lib/database"

interface AlertAnalyticsProps {
  alerts: Alert[]
  categories: Category[]
}

export function AlertAnalytics({ alerts, categories }: AlertAnalyticsProps) {
  // Prepare data for urgency distribution
  const urgencyData = [
    { name: "Critical (5)", value: alerts.filter((a) => a.urgency_level === 5).length, color: "#ef4444" },
    { name: "High (4)", value: alerts.filter((a) => a.urgency_level === 4).length, color: "#f97316" },
    { name: "Medium (3)", value: alerts.filter((a) => a.urgency_level === 3).length, color: "#eab308" },
    { name: "Low (2)", value: alerts.filter((a) => a.urgency_level === 2).length, color: "#3b82f6" },
    { name: "Info (1)", value: alerts.filter((a) => a.urgency_level === 1).length, color: "#6b7280" },
  ].filter((item) => item.value > 0)

  // Prepare data for category distribution
  const categoryData = categories.map((category) => ({
    name: category.name,
    value: alerts.filter((a) => a.category_id === category.id).length,
    color: category.color,
  }))

  // Prepare data for hourly distribution (last 24 hours)
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date()
    hour.setHours(hour.getHours() - (23 - i), 0, 0, 0)

    const hourAlerts = alerts.filter((alert) => {
      const alertHour = new Date(alert.created_at)
      return (
        alertHour.getHours() === hour.getHours() &&
        alertHour.getDate() === hour.getDate() &&
        alertHour.getMonth() === hour.getMonth()
      )
    })

    return {
      hour: hour.getHours().toString().padStart(2, "0") + ":00",
      alerts: hourAlerts.length,
    }
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Urgency Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Alert Urgency Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={urgencyData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {urgencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} alerts`, "Count"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4">
            {urgencyData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span>
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Alerts by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hourly Activity */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Alert Activity (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} alerts`, "Count"]} />
              <Bar dataKey="alerts" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
