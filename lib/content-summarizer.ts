// Content summarization service
export interface SummaryResult {
  summary: string
  keyPoints: string[]
  readingTime: number // in minutes
  wordCount: number
}

export class ContentSummarizer {
  // Extract key sentences based on word frequency and position
  static extractKeySentences(text: string, maxSentences = 3): string[] {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10)

    if (sentences.length <= maxSentences) {
      return sentences.map((s) => s.trim())
    }

    // Simple scoring based on sentence length and position
    const scoredSentences = sentences.map((sentence, index) => {
      const words = sentence.trim().split(/\s+/)
      let score = 0

      // Longer sentences get higher scores (up to a point)
      score += Math.min(words.length / 20, 1)

      // Earlier sentences get slight boost
      score += ((sentences.length - index) / sentences.length) * 0.3

      // Sentences with numbers or capitals get boost
      if (/\d/.test(sentence)) score += 0.2
      if (/[A-Z]{2,}/.test(sentence)) score += 0.1

      return { sentence: sentence.trim(), score, index }
    })

    return scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .sort((a, b) => a.index - b.index)
      .map((item) => item.sentence)
  }

  // Extract key points from content
  static extractKeyPoints(text: string): string[] {
    const keyPhrases: string[] = []

    // Look for bullet points or numbered lists
    const bulletPoints = text.match(/[•\-*]\s*([^\n]+)/g)
    if (bulletPoints) {
      keyPhrases.push(...bulletPoints.map((point) => point.replace(/^[•\-*]\s*/, "").trim()))
    }

    // Look for numbered points
    const numberedPoints = text.match(/\d+\.\s*([^\n]+)/g)
    if (numberedPoints) {
      keyPhrases.push(...numberedPoints.map((point) => point.replace(/^\d+\.\s*/, "").trim()))
    }

    // If no structured points found, extract from key sentences
    if (keyPhrases.length === 0) {
      const keySentences = this.extractKeySentences(text, 5)
      keyPhrases.push(...keySentences)
    }

    return keyPhrases.slice(0, 5) // Limit to 5 key points
  }

  // Calculate reading time (average 200 words per minute)
  static calculateReadingTime(text: string): number {
    const wordCount = text.split(/\s+/).length
    return Math.ceil(wordCount / 200)
  }

  // Generate summary
  static generateSummary(text: string): SummaryResult {
    const wordCount = text.split(/\s+/).length
    const readingTime = this.calculateReadingTime(text)
    const keySentences = this.extractKeySentences(text, 3)
    const keyPoints = this.extractKeyPoints(text)

    return {
      summary: keySentences.join(". ") + ".",
      keyPoints,
      readingTime,
      wordCount,
    }
  }
}
