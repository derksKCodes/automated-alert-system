"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Settings, Clock, CheckCircle, AlertCircle, Mail, Activity, Server } from "lucide-react"
import { globalScheduler, type ScheduledTask } from "@/lib/automation/scheduler"
import { globalMonitor, type HealthCheck } from "@/lib/monitoring/system-monitor"
import { globalEmailService } from "@/lib/automation/email-service"

export function AutomationPanel() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([])
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [emailStatus, setEmailStatus] = useState({ queueSize: 0, isProcessing: false })
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Load automation data
  const loadData = () => {
    setTasks(globalScheduler.getTasks())
    setHealthChecks(globalMonitor.getHealthChecks())
    setEmailStatus(globalEmailService.getQueueStatus())
  }

  useEffect(() => {
    loadData()

    if (autoRefresh) {
      const interval = setInterval(loadData, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200"
      case "paused":
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "error":
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "healthy":
        return <CheckCircle className="h-4 w-4" />
      case "paused":
      case "warning":
        return <AlertCircle className="h-4 w-4" />
      case "error":
      case "critical":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-slate-800">Automation & Monitoring</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <span className="text-sm text-slate-600">Auto Refresh</span>
          </div>
          <Button variant="outline" onClick={loadData}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduled Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No scheduled tasks configured</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-800">{task.name}</h4>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1">{task.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">Schedule: {task.schedule}</p>
                      {task.lastRun && (
                        <p className="text-xs text-slate-500">Last run: {task.lastRun.toLocaleString()}</p>
                      )}
                      {task.errorCount > 0 && (
                        <p className="text-xs text-red-600">
                          Errors: {task.errorCount}/{task.maxRetries}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => globalScheduler.toggleTask(task.id)}>
                        {task.status === "active" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthChecks.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No health checks configured</p>
              ) : (
                healthChecks.map((check) => (
                  <div key={check.service} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-800">{check.service}</h4>
                        <Badge className={getStatusColor(check.status)}>
                          {getStatusIcon(check.status)}
                          <span className="ml-1">{check.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{check.message}</p>
                      <p className="text-xs text-slate-500">
                        Response time: {check.responseTime}ms | {check.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Queue Size</span>
                <Badge variant="outline">{emailStatus.queueSize} emails</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Status</span>
                <Badge className={emailStatus.isProcessing ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-700"}>
                  {emailStatus.isProcessing ? "Processing" : "Idle"}
                </Badge>
              </div>

              {emailStatus.queueSize > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing Progress</span>
                    <span>{emailStatus.isProcessing ? "Active" : "Waiting"}</span>
                  </div>
                  <Progress value={emailStatus.isProcessing ? 75 : 0} className="h-2" />
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Configure Email Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-800">98.5%</div>
                  <div className="text-sm text-slate-600">Uptime</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-800">1.2s</div>
                  <div className="text-sm text-slate-600">Avg Response</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-800">0.1%</div>
                  <div className="text-sm text-slate-600">Error Rate</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-800">45%</div>
                  <div className="text-sm text-slate-600">Memory Usage</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
