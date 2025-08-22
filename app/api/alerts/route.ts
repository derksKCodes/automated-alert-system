import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

// GET /api/alerts - Fetch alerts with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      category_id: searchParams.get("category_id") ? Number.parseInt(searchParams.get("category_id")!) : undefined,
      is_read: searchParams.get("is_read") ? searchParams.get("is_read") === "true" : undefined,
      is_archived: searchParams.get("is_archived") ? searchParams.get("is_archived") === "true" : undefined,
      urgency_level: searchParams.get("urgency_level")
        ? Number.parseInt(searchParams.get("urgency_level")!)
        : undefined,
    }

    const alerts = await DatabaseService.getAlerts(filters)

    return NextResponse.json({
      success: true,
      data: alerts,
      count: alerts.length,
    })
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 })
  }
}
