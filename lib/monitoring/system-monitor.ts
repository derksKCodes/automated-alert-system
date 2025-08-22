// System monitoring and health checks
export interface SystemMetrics {
  timestamp: Date
  alertsProcessed: number
  averageProcessingTime: number
  errorRate: number
  memoryUsage: number
  activeConnections: number
  queueSize: number
}

export interface HealthCheck {
  service: string
  status: "healthy" | "warning" | "critical"
  message: string
  responseTime: number
  timestamp: Date
}

export class SystemMonitor {
  private metrics: SystemMetrics[] = []
  private healthChecks: Map<string, HealthCheck> = new Map()
  private alertThresholds = {
    errorRate: 0.1, // 10%
    responseTime: 5000, // 5 seconds
    memoryUsage: 0.8, // 80%
    queueSize: 1000,
  }

  // Record system metrics
  recordMetrics(metrics: Partial<SystemMetrics>) {
    const fullMetrics: SystemMetrics = {
      timestamp: new Date(),
      alertsProcessed: 0,
      averageProcessingTime: 0,
      errorRate: 0,
      memoryUsage: 0,
      activeConnections: 0,
      queueSize: 0,
      ...metrics,
    }

    this.metrics.push(fullMetrics)

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics.shift()
    }

    // Check for alerts
    this.checkAlerts(fullMetrics)
  }

  // Perform health check
  async performHealthCheck(
    service: string,
    checkFunction: () => Promise<{ success: boolean; message: string; responseTime: number }>,
  ) {
    const startTime = Date.now()

    try {
      const result = await checkFunction()
      const responseTime = Date.now() - startTime

      const healthCheck: HealthCheck = {
        service,
        status: result.success ? "healthy" : "warning",
        message: result.message,
        responseTime,
        timestamp: new Date(),
      }

      // Check response time threshold
      if (responseTime > this.alertThresholds.responseTime) {
        healthCheck.status = "warning"
        healthCheck.message += ` (Slow response: ${responseTime}ms)`
      }

      this.healthChecks.set(service, healthCheck)
      return healthCheck
    } catch (error) {
      const healthCheck: HealthCheck = {
        service,
        status: "critical",
        message: error instanceof Error ? error.message : "Health check failed",
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
      }

      this.healthChecks.set(service, healthCheck)
      return healthCheck
    }
  }

  // Check for system alerts
  private checkAlerts(metrics: SystemMetrics) {
    const alerts: string[] = []

    if (metrics.errorRate > this.alertThresholds.errorRate) {
      alerts.push(`High error rate: ${(metrics.errorRate * 100).toFixed(1)}%`)
    }

    if (metrics.memoryUsage > this.alertThresholds.memoryUsage) {
      alerts.push(`High memory usage: ${(metrics.memoryUsage * 100).toFixed(1)}%`)
    }

    if (metrics.queueSize > this.alertThresholds.queueSize) {
      alerts.push(`Large queue size: ${metrics.queueSize} items`)
    }

    if (alerts.length > 0) {
      console.warn("System alerts:", alerts)
      // In production, would send notifications
    }
  }

  // Get recent metrics
  getMetrics(limit = 100): SystemMetrics[] {
    return this.metrics.slice(-limit)
  }

  // Get all health checks
  getHealthChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values())
  }

  // Get system status summary
  getSystemStatus(): {
    overall: "healthy" | "warning" | "critical"
    services: HealthCheck[]
    metrics: SystemMetrics | null
  } {
    const services = this.getHealthChecks()
    const latestMetrics = this.metrics[this.metrics.length - 1] || null

    let overall: "healthy" | "warning" | "critical" = "healthy"

    if (services.some((s) => s.status === "critical")) {
      overall = "critical"
    } else if (services.some((s) => s.status === "warning")) {
      overall = "warning"
    }

    return {
      overall,
      services,
      metrics: latestMetrics,
    }
  }
}

// Global monitor instance
export const globalMonitor = new SystemMonitor()
