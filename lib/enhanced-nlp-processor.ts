// Enhanced NLP processor with advanced features
import type { RSSItem } from "./data-collector"
import type { ProcessedAlert } from "./nlp-processor"
import { LanguageDetector } from "./language-detector"
import { ContentSummarizer } from "./content-summarizer"
import { DuplicateDetector } from "./duplicate-detector"

export interface EnhancedProcessedAlert extends ProcessedAlert {
  detected_language: string
  language_confidence: number
  summary: string
  key_points: string[]
  reading_time: number
  word_count: number
  is_duplicate: boolean
  similarity_score?: number
  content_fingerprint: string
}

export class EnhancedNLPProcessor {
  // Enhanced sentiment analysis with more sophisticated scoring
  static analyzeSentiment(text: string): number {
    const sentimentWords = {
      positive: {
        strong: ["excellent", "outstanding", "breakthrough", "revolutionary", "amazing", "fantastic"],
        medium: ["good", "great", "positive", "success", "improvement", "growth", "beneficial"],
        weak: ["nice", "okay", "fine", "decent", "acceptable"],
      },
      negative: {
        strong: ["terrible", "awful", "catastrophic", "devastating", "critical", "severe"],
        medium: ["bad", "negative", "failure", "crisis", "problem", "issue", "concern"],
        weak: ["minor", "slight", "small", "limited"],
      },
    }

    const words = text.toLowerCase().split(/\s+/)
    let score = 0

    words.forEach((word) => {
      // Strong positive/negative words
      if (sentimentWords.positive.strong.some((pos) => word.includes(pos))) score += 0.3
      if (sentimentWords.positive.medium.some((pos) => word.includes(pos))) score += 0.2
      if (sentimentWords.positive.weak.some((pos) => word.includes(pos))) score += 0.1

      if (sentimentWords.negative.strong.some((neg) => word.includes(neg))) score -= 0.3
      if (sentimentWords.negative.medium.some((neg) => word.includes(neg))) score -= 0.2
      if (sentimentWords.negative.weak.some((neg) => word.includes(neg))) score -= 0.1
    })

    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, score))
  }

  // Enhanced urgency calculation with time-based factors
  static calculateUrgency(text: string, sentiment: number, matchedKeywords: string[], publishedAt: Date): number {
    let urgency = 1

    // Time-based urgency (newer content gets slight boost)
    const hoursOld = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60)
    if (hoursOld < 1) urgency += 0.5
    else if (hoursOld < 6) urgency += 0.3
    else if (hoursOld < 24) urgency += 0.1

    // Keyword-based urgency
    const urgentKeywords = [
      "breaking",
      "urgent",
      "critical",
      "emergency",
      "alert",
      "warning",
      "immediate",
      "vulnerability",
      "breach",
      "attack",
      "pandemic",
      "outbreak",
    ]

    const urgentMatches = urgentKeywords.filter((keyword) => text.toLowerCase().includes(keyword))
    urgency += urgentMatches.length * 0.5

    // Sentiment-based urgency
    if (sentiment < -0.5) urgency += 1
    else if (sentiment < -0.2) urgency += 0.5

    // Keyword match density
    if (matchedKeywords.length > 5) urgency += 1
    else if (matchedKeywords.length > 3) urgency += 0.5

    return Math.min(5, Math.max(1, Math.round(urgency)))
  }

  // Enhanced category detection with confidence scoring
  static findBestCategory(text: string): {
    categoryId: number
    matchedKeywords: string[]
    confidence: number
    alternativeCategories: Array<{ categoryId: number; confidence: number }>
  } {
    const categoryKeywords = {
      1: {
        // Technology
        keywords: [
          "ai",
          "artificial intelligence",
          "machine learning",
          "blockchain",
          "cryptocurrency",
          "software",
          "algorithm",
          "data science",
          "cloud computing",
          "automation",
        ],
        weights: [3, 3, 3, 2, 2, 1, 2, 2, 2, 2],
      },
      2: {
        // Security
        keywords: [
          "vulnerability",
          "breach",
          "malware",
          "phishing",
          "cybersecurity",
          "hack",
          "ransomware",
          "data leak",
          "security flaw",
          "cyber attack",
        ],
        weights: [5, 5, 4, 3, 3, 4, 4, 4, 4, 4],
      },
      3: {
        // Business
        keywords: [
          "market",
          "business",
          "economy",
          "finance",
          "stock",
          "ipo",
          "merger",
          "acquisition",
          "revenue",
          "profit",
        ],
        weights: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      },
      4: {
        // Health
        keywords: [
          "health",
          "medical",
          "vaccine",
          "pandemic",
          "disease",
          "treatment",
          "clinical trial",
          "drug",
          "hospital",
          "patient",
        ],
        weights: [2, 3, 3, 5, 4, 2, 3, 2, 2, 2],
      },
      5: {
        // Environment
        keywords: [
          "climate change",
          "environment",
          "pollution",
          "renewable energy",
          "sustainability",
          "carbon",
          "emissions",
          "global warming",
          "conservation",
          "ecosystem",
        ],
        weights: [3, 2, 2, 2, 2, 2, 2, 3, 2, 2],
      },
    }

    const textLower = text.toLowerCase()
    const categoryScores: Array<{ categoryId: number; matchedKeywords: string[]; confidence: number }> = []

    Object.entries(categoryKeywords).forEach(([categoryId, { keywords, weights }]) => {
      const matches: string[] = []
      let totalWeight = 0

      keywords.forEach((keyword, index) => {
        if (textLower.includes(keyword)) {
          matches.push(keyword)
          totalWeight += weights[index]
        }
      })

      const confidence = totalWeight / keywords.length
      categoryScores.push({
        categoryId: Number.parseInt(categoryId),
        matchedKeywords: matches,
        confidence,
      })
    })

    categoryScores.sort((a, b) => b.confidence - a.confidence)
    const bestMatch = categoryScores[0]
    const alternatives = categoryScores.slice(1, 3).map((cat) => ({
      categoryId: cat.categoryId,
      confidence: cat.confidence,
    }))

    return {
      categoryId: bestMatch.categoryId,
      matchedKeywords: bestMatch.matchedKeywords,
      confidence: bestMatch.confidence,
      alternativeCategories: alternatives,
    }
  }

  // Enhanced translation with language detection
  static async translateContent(content: string, targetLanguage: string): Promise<string> {
    const detection = LanguageDetector.detectLanguage(content)

    if (detection.language === targetLanguage) {
      return content
    }

    // Mock translation - in reality would use Google Translate API or similar
    return `[Translated from ${detection.language} to ${targetLanguage}] ${content}`
  }

  // Main enhanced processing function
  static async processItem(
    item: RSSItem,
    targetLanguage = "en",
    existingContent: string[] = [],
  ): Promise<EnhancedProcessedAlert> {
    const fullText = `${item.title} ${item.content}`

    // Language detection
    const languageDetection = LanguageDetector.detectLanguage(fullText)

    // Content analysis
    const summary = ContentSummarizer.generateSummary(item.content)

    // Duplicate detection
    const duplicateCheck = DuplicateDetector.checkForDuplicates(fullText, existingContent)
    const fingerprint = DuplicateDetector.generateFingerprint(fullText)

    // Enhanced sentiment analysis
    const sentiment = this.analyzeSentiment(fullText)

    // Enhanced category detection
    const categoryMatch = this.findBestCategory(fullText)

    // Enhanced urgency calculation
    const urgency = this.calculateUrgency(fullText, sentiment, categoryMatch.matchedKeywords, item.publishedAt)

    // Translation if needed
    const translatedContent =
      targetLanguage !== languageDetection.language
        ? await this.translateContent(item.content, targetLanguage)
        : undefined

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
      detected_language: languageDetection.language,
      language_confidence: languageDetection.confidence,
      summary: summary.summary,
      key_points: summary.keyPoints,
      reading_time: summary.readingTime,
      word_count: summary.wordCount,
      is_duplicate: duplicateCheck.isDuplicate,
      similarity_score: duplicateCheck.similarity,
      content_fingerprint: fingerprint,
    }
  }

  // Process multiple items with duplicate detection across the batch
  static async processItems(items: RSSItem[], targetLanguage = "en"): Promise<EnhancedProcessedAlert[]> {
    const processed: EnhancedProcessedAlert[] = []
    const existingContent: string[] = []

    for (const item of items) {
      const processedItem = await this.processItem(item, targetLanguage, existingContent)

      // Add to existing content for duplicate detection of subsequent items
      existingContent.push(`${item.title} ${item.content}`)

      processed.push(processedItem)
    }

    return processed
  }
}
