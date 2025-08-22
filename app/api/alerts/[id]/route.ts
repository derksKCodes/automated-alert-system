import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

// PATCH /api/alerts/[id] - Update alert status
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const alertId = Number.parseInt(params.id)
    const body = await request.json()

    if (body.is_read !== undefined) {
      await DatabaseService.markAlertAsRead(alertId)
    }

    if (body.is_archived !== undefined) {
      await DatabaseService.archiveAlert(alertId)
    }

    return NextResponse.json({
      success: true,
      message: "Alert updated successfully",
    })
  } catch (error) {
    console.error("Error updating alert:", error)
    return NextResponse.json({ success: false, error: "Failed to update alert" }, { status: 500 })
  }
}
