// Duplicate content detection service
export interface DuplicateResult {
  isDuplicate: boolean
  similarity: number
  matchedContent?: string
}

export class DuplicateDetector {
  // Simple text similarity using Jaccard similarity
  static calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/))
    const words2 = new Set(text2.toLowerCase().split(/\s+/))

    const intersection = new Set([...words1].filter((word) => words2.has(word)))
    const union = new Set([...words1, ...words2])

    return intersection.size / union.size
  }

  // Check for duplicates against existing content
  static checkForDuplicates(newContent: string, existingContent: string[]): DuplicateResult {
    let maxSimilarity = 0
    let matchedContent = ""

    for (const existing of existingContent) {
      const similarity = this.calculateSimilarity(newContent, existing)
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity
        matchedContent = existing
      }
    }

    return {
      isDuplicate: maxSimilarity > 0.7, // 70% similarity threshold
      similarity: maxSimilarity,
      matchedContent: maxSimilarity > 0.7 ? matchedContent : undefined,
    }
  }

  // Generate content fingerprint for faster duplicate detection
  static generateFingerprint(content: string): string {
    const words = content.toLowerCase().split(/\s+/)
    const significantWords = words.filter((word) => word.length > 3)
    return significantWords.slice(0, 10).sort().join("-")
  }
}
