import { type NextRequest, NextResponse } from "next/server"
import { EnhancedNLPProcessor } from "@/lib/enhanced-nlp-processor"
import { LanguageDetector } from "@/lib/language-detector"
import { ContentSummarizer } from "@/lib/content-summarizer"

// POST /api/analyze - Analyze text content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, target_language = "en" } = body

    if (!text) {
      return NextResponse.json({ success: false, error: "Text content is required" }, { status: 400 })
    }

    // Language detection
    const languageDetection = LanguageDetector.detectLanguage(text)

    // Content summarization
    const summary = ContentSummarizer.generateSummary(text)

    // Sentiment analysis
    const sentiment = EnhancedNLPProcessor.analyzeSentiment(text)

    // Category detection
    const categoryMatch = EnhancedNLPProcessor.findBestCategory(text)

    // Translation if needed
    const translatedContent =
      target_language !== languageDetection.language
        ? await EnhancedNLPProcessor.translateContent(text, target_language)
        : undefined

    return NextResponse.json({
      success: true,
      data: {
        original_text: text,
        detected_language: languageDetection.language,
        language_confidence: languageDetection.confidence,
        language_alternatives: languageDetection.alternatives,
        sentiment_score: sentiment,
        category: {
          id: categoryMatch.categoryId,
          confidence: categoryMatch.confidence,
          matched_keywords: categoryMatch.matchedKeywords,
          alternatives: categoryMatch.alternativeCategories,
        },
        summary: summary.summary,
        key_points: summary.keyPoints,
        reading_time: summary.readingTime,
        word_count: summary.wordCount,
        translated_content: translatedContent,
      },
    })
  } catch (error) {
    console.error("Error analyzing content:", error)
    return NextResponse.json({ success: false, error: "Content analysis failed" }, { status: 500 })
  }
}
