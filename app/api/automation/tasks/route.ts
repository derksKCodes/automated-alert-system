import { NextResponse } from "next/server"
import { globalScheduler } from "@/lib/automation/scheduler"
import { DataCollector } from "@/lib/data-collector"
import { DatabaseService } from "@/lib/database"

// Initialize automation tasks
const initializeTasks = () => {
  // Data collection task
  globalScheduler.addTask(
    {
      id: "data-collection",
      name: "Automated Data Collection",
      schedule: "*/15 * * * *", // Every 15 minutes
      nextRun: new Date(Date.now() + 15 * 60 * 1000),
      status: "active",
      errorCount: 0,
      maxRetries: 3,
    },
    async () => {
      const startTime = Date.now()

      try {
        const sources = await DatabaseService.getSources()
        const activeSources = sources.filter((s) => s.status === "active")

        const results = await DataCollector.collectFromAllSources(activeSources)
        const successCount = results.filter((r) => r.success).length

        return {
          success: successCount > 0,
          message: `Collected data from ${successCount}/${activeSources.length} sources`,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Data collection failed",
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      }
    },
  )

  // Cleanup task
  globalScheduler.addTask(
    {
      id: "cleanup",
      name: "Database Cleanup",
      schedule: "0 2 * * *", // Daily at 2 AM
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: "active",
      errorCount: 0,
      maxRetries: 2,
    },
    async () => {
      const startTime = Date.now()

      try {
        // Mock cleanup - in real app would clean old data
        await new Promise((resolve) => setTimeout(resolve, 2000))

        return {
          success: true,
          message: "Database cleanup completed successfully",
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Cleanup failed",
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      }
    },
  )
}

// Initialize tasks on first load
initializeTasks()

// GET /api/automation/tasks - Get all scheduled tasks
export async function GET() {
  try {
    const tasks = globalScheduler.getTasks()

    return NextResponse.json({
      success: true,
      data: tasks,
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 })
  }
}
