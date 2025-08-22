import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

// GET /api/categories - Fetch all categories
export async function GET() {
  try {
    const categories = await DatabaseService.getCategories()

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 })
  }
}
