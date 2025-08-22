// Language detection service
export interface LanguageDetection {
  language: string
  confidence: number
  alternatives: Array<{ language: string; confidence: number }>
}

export class LanguageDetector {
  // Common words in different languages for basic detection
  private static languagePatterns: Record<string, string[]> = {
    en: ["the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"],
    es: ["el", "la", "y", "o", "pero", "en", "con", "por", "para", "de", "que", "es"],
    fr: ["le", "la", "et", "ou", "mais", "dans", "sur", "à", "pour", "de", "avec", "par"],
    de: ["der", "die", "das", "und", "oder", "aber", "in", "auf", "zu", "für", "von", "mit"],
    it: ["il", "la", "e", "o", "ma", "in", "su", "a", "per", "di", "con", "da"],
    pt: ["o", "a", "e", "ou", "mas", "em", "sobre", "para", "de", "com", "por"],
    ru: ["и", "или", "но", "в", "на", "к", "для", "от", "с", "по"],
    zh: ["的", "和", "或", "但", "在", "上", "到", "为", "从", "与", "由"],
    ja: ["の", "と", "か", "が", "に", "で", "を", "は", "も", "から"],
    ar: ["في", "على", "إلى", "من", "مع", "عن", "كان", "هذا", "التي", "أن"],
  }

  static detectLanguage(text: string): LanguageDetection {
    const words = text.toLowerCase().split(/\s+/)
    const scores: Record<string, number> = {}

    // Initialize scores
    Object.keys(this.languagePatterns).forEach((lang) => {
      scores[lang] = 0
    })

    // Count matches for each language
    words.forEach((word) => {
      Object.entries(this.languagePatterns).forEach(([lang, patterns]) => {
        if (patterns.includes(word)) {
          scores[lang]++
        }
      })
    })

    // Calculate confidence scores
    const totalWords = words.length
    const languageScores = Object.entries(scores)
      .map(([lang, score]) => ({
        language: lang,
        confidence: totalWords > 0 ? score / totalWords : 0,
      }))
      .sort((a, b) => b.confidence - a.confidence)

    const topLanguage = languageScores[0]
    const alternatives = languageScores.slice(1, 4)

    return {
      language: topLanguage.confidence > 0.1 ? topLanguage.language : "en", // Default to English
      confidence: topLanguage.confidence,
      alternatives,
    }
  }
}
