import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { ExportService, type ExportOptions } from "@/lib/export/export-service"

// POST /api/export - Export alerts
export async function POST(request: NextRequest) {
  try {
    const options: ExportOptions = await request.json()

    // Get alerts and categories
    const [alerts, categories] = await Promise.all([DatabaseService.getAlerts(), DatabaseService.getCategories()])

    // Export data
    const result = await ExportService.exportAlerts(alerts, categories, options)

    // Convert Blob to base64 for JSON response
    let data: string
    if (result.data instanceof Blob) {
      const arrayBuffer = await result.data.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      data = buffer.toString("base64")
    } else {
      data = result.data
    }

    return NextResponse.json({
      success: true,
      data: {
        filename: result.filename,
        data,
        mimeType: result.mimeType,
        size: result.size,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Export failed",
      },
      { status: 500 },
    )
  }
}
