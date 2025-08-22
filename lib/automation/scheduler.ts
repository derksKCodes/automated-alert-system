// Automation scheduler for background tasks
export interface ScheduledTask {
  id: string
  name: string
  schedule: string // cron-like format
  lastRun?: Date
  nextRun: Date
  status: "active" | "paused" | "error"
  errorCount: number
  maxRetries: number
}

export interface TaskResult {
  success: boolean
  message: string
  duration: number
  timestamp: Date
}

export class AutomationScheduler {
  private tasks: Map<string, ScheduledTask> = new Map()
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private taskHistory: Map<string, TaskResult[]> = new Map()

  // Add a scheduled task
  addTask(task: ScheduledTask, handler: () => Promise<TaskResult>) {
    this.tasks.set(task.id, task)
    this.taskHistory.set(task.id, [])

    // Convert schedule to interval (simplified - in production would use proper cron parser)
    const intervalMs = this.parseSchedule(task.schedule)

    const interval = setInterval(async () => {
      await this.executeTask(task.id, handler)
    }, intervalMs)

    this.intervals.set(task.id, interval)
  }

  // Execute a task
  private async executeTask(taskId: string, handler: () => Promise<TaskResult>) {
    const task = this.tasks.get(taskId)
    if (!task || task.status !== "active") return

    const startTime = Date.now()

    try {
      const result = await handler()
      const duration = Date.now() - startTime

      // Update task status
      task.lastRun = new Date()
      task.nextRun = new Date(Date.now() + this.parseSchedule(task.schedule))
      task.errorCount = result.success ? 0 : task.errorCount + 1
      task.status = task.errorCount >= task.maxRetries ? "error" : "active"

      // Store result
      const taskResult: TaskResult = {
        ...result,
        duration,
        timestamp: new Date(),
      }

      const history = this.taskHistory.get(taskId) || []
      history.push(taskResult)

      // Keep only last 100 results
      if (history.length > 100) {
        history.shift()
      }

      this.taskHistory.set(taskId, history)

      console.log(`Task ${task.name} completed:`, taskResult)
    } catch (error) {
      task.errorCount++
      task.status = task.errorCount >= task.maxRetries ? "error" : "active"

      const taskResult: TaskResult = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }

      const history = this.taskHistory.get(taskId) || []
      history.push(taskResult)
      this.taskHistory.set(taskId, history)

      console.error(`Task ${task.name} failed:`, error)
    }
  }

  // Parse schedule string to milliseconds (simplified)
  private parseSchedule(schedule: string): number {
    const scheduleMap: Record<string, number> = {
      "*/1 * * * *": 60 * 1000, // Every minute
      "*/5 * * * *": 5 * 60 * 1000, // Every 5 minutes
      "*/15 * * * *": 15 * 60 * 1000, // Every 15 minutes
      "*/30 * * * *": 30 * 60 * 1000, // Every 30 minutes
      "0 * * * *": 60 * 60 * 1000, // Every hour
      "0 */6 * * *": 6 * 60 * 60 * 1000, // Every 6 hours
      "0 0 * * *": 24 * 60 * 60 * 1000, // Daily
    }

    return scheduleMap[schedule] || 60 * 60 * 1000 // Default to hourly
  }

  // Get all tasks
  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values())
  }

  // Get task history
  getTaskHistory(taskId: string): TaskResult[] {
    return this.taskHistory.get(taskId) || []
  }

  // Pause/resume task
  toggleTask(taskId: string) {
    const task = this.tasks.get(taskId)
    if (!task) return

    if (task.status === "active") {
      task.status = "paused"
      const interval = this.intervals.get(taskId)
      if (interval) {
        clearInterval(interval)
        this.intervals.delete(taskId)
      }
    } else if (task.status === "paused") {
      task.status = "active"
      // Would need to re-add the task with its handler
    }
  }

  // Stop all tasks
  stopAll() {
    for (const interval of this.intervals.values()) {
      clearInterval(interval)
    }
    this.intervals.clear()
  }
}

// Global scheduler instance
export const globalScheduler = new AutomationScheduler()
