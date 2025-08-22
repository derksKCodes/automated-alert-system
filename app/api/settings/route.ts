import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

// GET /api/settings - Get user settings
export async function GET() {
  try {
    const settings = await DatabaseService.getUserSettings()

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 })
  }
}

// PATCH /api/settings - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const updatedSettings = await DatabaseService.updateUserSettings(body)

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 })
  }
}
