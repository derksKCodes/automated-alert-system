// NLP processing service for content analysis
import type { RSSItem } from "./data-collector"

export interface ProcessedAlert {
  title: string
  content: string
  translated_content?: string
  sentiment_score: number
  urgency_level: number
  keywords_matched: string[]
  category_id: number
  url?: string
  published_at: Date
}

export class NLPProcessor {
  // Keyword matching for categorization
  private static categoryKeywords: Record<number, { keywords: string[]; weights: number[] }> = {
    1: {
      // Technology
      keywords: ["ai", "artificial intelligence", "machine learning", "blockchain", "tech", "software", "algorithm"],
      weights: [3, 3, 3, 2, 1, 1, 2],
    },
    2: {
      // Security
      keywords: ["vulnerability", "breach", "malware", "phishing", "security", "hack", "cyber"],
      weights: [5, 5, 4, 3, 2, 4, 3],
    },
    3: {
      // Business
      keywords: ["market", "business", "economy", "finance", "stock", "ipo", "merger"],
      weights: [2, 2, 2, 2, 2, 2, 2],
    },
    4: {
      // Health
      keywords: ["health", "medical", "vaccine", "pandemic", "disease", "treatment"],
      weights: [2, 3, 3, 5, 4, 2],
    },
    5: {
      // Environment
      keywords: ["climate", "environment", "pollution", "renewable", "sustainability"],
      weights: [3, 2, 2, 2, 2],
    },
  }

  // Sentiment analysis (simplified)
  static analyzeSentiment(text: string): number {
    const positiveWords = ["good", "great", "excellent", "positive", "success", "breakthrough", "improvement", "growth"]
    const negativeWords = [
      "bad",
      "terrible",
      "negative",
      "failure",
      "crisis",
      "vulnerability",
      "breach",
      "attack",
      "decline",
    ]

    const words = text.toLowerCase().split(/\s+/)
    let score = 0

    words.forEach((word) => {
      if (positiveWords.some((pos) => word.includes(pos))) score += 0.1
      if (negativeWords.some((neg) => word.includes(neg))) score -= 0.1
    })

    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, score))
  }

  // Calculate urgency level based on keywords and sentiment
  static calculateUrgency(text: string, sentiment: number, matchedKeywords: string[]): number {
    let urgency = 1

    // High urgency keywords
    const urgentKeywords = ["critical", "urgent", "breaking", "emergency", "vulnerability", "breach", "pandemic"]
    const hasUrgentKeywords = urgentKeywords.some((keyword) => text.toLowerCase().includes(keyword))

    if (hasUrgentKeywords) urgency += 2
    if (sentiment < -0.5) urgency += 1
    if (matchedKeywords.length > 3) urgency += 1

    return Math.min(5, urgency)
  }

  // Find matching category based on keywords
  static findBestCategory(text: string): { categoryId: number; matchedKeywords: string[]; confidence: number } {
    const textLower = text.toLowerCase()
    let bestMatch = { categoryId: 1, matchedKeywords: [] as string[], confidence: 0 }

    Object.entries(this.categoryKeywords).forEach(([categoryId, { keywords, weights }]) => {
      const matches: string[] = []
      let totalWeight = 0

      keywords.forEach((keyword, index) => {
        if (textLower.includes(keyword)) {
          matches.push(keyword)
          totalWeight += weights[index]
        }
      })

      const confidence = totalWeight / keywords.length
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          categoryId: Number.parseInt(categoryId),
          matchedKeywords: matches,
          confidence,
        }
      }
    })

    return bestMatch
  }

  // Simple translation simulation (in real app, would use translation API)
  static async translateContent(content: string, targetLanguage: string): Promise<string> {
    if (targetLanguage === "en") return content

    // Mock translation - in reality would use Google Translate API or similar
    return `[Translated to ${targetLanguage}] ${content}`
  }

  // Main processing function
  static async processItem(item: RSSItem, targetLanguage = "en"): Promise<ProcessedAlert> {
    const fullText = `${item.title} ${item.content}`

    // Analyze sentiment
    const sentiment = this.analyzeSentiment(fullText)

    // Find best category and keywords
    const categoryMatch = this.findBestCategory(fullText)

    // Calculate urgency
    const urgency = this.calculateUrgency(fullText, sentiment, categoryMatch.matchedKeywords)

    // Translate if needed
    const translatedContent =
      targetLanguage !== "en" ? await this.translateContent(item.content, targetLanguage) : undefined

    return {
      title: item.title,
      content: item.content,
      translated_content: translatedContent,
      sentiment_score: sentiment,
      urgency_level: urgency,
      keywords_matched: categoryMatch.matchedKeywords,
      category_id: categoryMatch.categoryId,
      url: item.url,
      published_at: item.publishedAt,
    }
  }

  // Process multiple items
  static async processItems(items: RSSItem[], targetLanguage = "en"): Promise<ProcessedAlert[]> {
    const processed: ProcessedAlert[] = []

    for (const item of items) {
      const processedItem = await this.processItem(item, targetLanguage)
      processed.push(processedItem)
    }

    return processed
  }
}
