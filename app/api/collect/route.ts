import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { DataCollector } from "@/lib/data-collector"
import { NLPProcessor } from "@/lib/nlp-processor"

// POST /api/collect - Trigger data collection from all sources
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source_ids, target_language = "en" } = body

    // Get sources to collect from
    const allSources = await DatabaseService.getSources()
    const sourcesToCollect = source_ids
      ? allSources.filter((source) => source_ids.includes(source.id))
      : allSources.filter((source) => source.status === "active")

    // Collect data from sources
    const collectionResults = await DataCollector.collectFromAllSources(sourcesToCollect)

    let totalProcessed = 0
    let totalErrors = 0

    // Process each collection result
    for (const result of collectionResults) {
      if (result.success && result.items.length > 0) {
        // Process items through NLP
        const processedAlerts = await NLPProcessor.processItems(result.items, target_language)
        totalProcessed += processedAlerts.length

        // In a real app, these would be saved to the database
        console.log(`Processed ${processedAlerts.length} alerts from source ${result.source_id}`)
      } else {
        totalErrors++
        console.error(`Failed to collect from source ${result.source_id}:`, result.error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Data collection completed",
      stats: {
        sources_processed: collectionResults.length,
        alerts_processed: totalProcessed,
        errors: totalErrors,
      },
    })
  } catch (error) {
    console.error("Error during data collection:", error)
    return NextResponse.json({ success: false, error: "Data collection failed" }, { status: 500 })
  }
}
