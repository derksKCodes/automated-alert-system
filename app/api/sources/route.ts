import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

// GET /api/sources - Fetch all data sources
export async function GET() {
  try {
    const sources = await DatabaseService.getSources()

    return NextResponse.json({
      success: true,
      data: sources,
    })
  } catch (error) {
    console.error("Error fetching sources:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch sources" }, { status: 500 })
  }
}
