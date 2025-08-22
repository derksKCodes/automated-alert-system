// Database utility functions for local development
// In production, this would connect to PostgreSQL/Supabase

export interface Source {
  id: number
  name: string
  url: string
  type: "rss" | "api" | "web_scraping"
  status: "active" | "inactive" | "error"
  last_checked: Date
  created_at: Date
  updated_at: Date
}

export interface Category {
  id: number
  name: string
  description: string
  color: string
  created_at: Date
}

export interface Alert {
  id: number
  raw_data_id: number
  category_id: number
  title: string
  content: string
  translated_content?: string
  sentiment_score?: number
  urgency_level: number
  keywords_matched: string[]
  url?: string
  published_at: Date
  created_at: Date
  is_read: boolean
  is_archived: boolean
}

export interface UserSettings {
  id: number
  email_notifications: boolean
  notification_frequency: "immediate" | "hourly" | "daily"
  min_urgency_level: number
  preferred_language: string
  created_at: Date
  updated_at: Date
}

// Mock data for development
export const mockCategories: Category[] = [
  { id: 1, name: "Technology", description: "Tech news and updates", color: "#3B82F6", created_at: new Date() },
  {
    id: 2,
    name: "Security",
    description: "Security alerts and vulnerabilities",
    color: "#EF4444",
    created_at: new Date(),
  },
  { id: 3, name: "Business", description: "Business and market news", color: "#10B981", created_at: new Date() },
  { id: 4, name: "Health", description: "Health and medical updates", color: "#F59E0B", created_at: new Date() },
  {
    id: 5,
    name: "Environment",
    description: "Environmental news and alerts",
    color: "#22C55E",
    created_at: new Date(),
  },
]

export const mockSources: Source[] = [
  {
    id: 1,
    name: "TechCrunch RSS",
    url: "https://techcrunch.com/feed/",
    type: "rss",
    status: "active",
    last_checked: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    name: "Security Week RSS",
    url: "https://www.securityweek.com/feed/",
    type: "rss",
    status: "active",
    last_checked: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  },
]

export const mockAlerts: Alert[] = [
  {
    id: 1,
    raw_data_id: 1,
    category_id: 1,
    title: "New AI Breakthrough in Natural Language Processing",
    content: "Researchers have developed a new AI model that significantly improves natural language understanding...",
    sentiment_score: 0.8,
    urgency_level: 3,
    keywords_matched: ["artificial intelligence", "machine learning"],
    url: "https://example.com/ai-breakthrough",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    created_at: new Date(),
    is_read: false,
    is_archived: false,
  },
  {
    id: 2,
    raw_data_id: 2,
    category_id: 2,
    title: "Critical Security Vulnerability Discovered in Popular Framework",
    content: "A critical vulnerability has been found that could allow remote code execution...",
    sentiment_score: -0.6,
    urgency_level: 5,
    keywords_matched: ["vulnerability", "security"],
    url: "https://example.com/security-alert",
    published_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    created_at: new Date(),
    is_read: false,
    is_archived: false,
  },
  {
    id: 3,
    raw_data_id: 3,
    category_id: 3,
    title: "Major Tech Company Announces Quarterly Results",
    content: "The company reported strong growth in cloud services and AI products...",
    sentiment_score: 0.4,
    urgency_level: 2,
    keywords_matched: ["business", "quarterly"],
    url: "https://example.com/earnings",
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    created_at: new Date(),
    is_read: true,
    is_archived: false,
  },
]

export const mockUserSettings: UserSettings = {
  id: 1,
  email_notifications: true,
  notification_frequency: "immediate",
  min_urgency_level: 2,
  preferred_language: "en",
  created_at: new Date(),
  updated_at: new Date(),
}

// Database operations (mock implementations)
export class DatabaseService {
  static async getAlerts(filters?: {
    category_id?: number
    is_read?: boolean
    is_archived?: boolean
    urgency_level?: number
  }): Promise<Alert[]> {
    let alerts = [...mockAlerts]

    if (filters) {
      if (filters.category_id) {
        alerts = alerts.filter((alert) => alert.category_id === filters.category_id)
      }
      if (filters.is_read !== undefined) {
        alerts = alerts.filter((alert) => alert.is_read === filters.is_read)
      }
      if (filters.is_archived !== undefined) {
        alerts = alerts.filter((alert) => alert.is_archived === filters.is_archived)
      }
      if (filters.urgency_level) {
        alerts = alerts.filter((alert) => alert.urgency_level >= filters.urgency_level)
      }
    }

    return alerts.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
  }

  static async getCategories(): Promise<Category[]> {
    return mockCategories
  }

  static async getSources(): Promise<Source[]> {
    return mockSources
  }

  static async getUserSettings(): Promise<UserSettings> {
    return mockUserSettings
  }

  static async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return { ...mockUserSettings, ...settings, updated_at: new Date() }
  }

  static async markAlertAsRead(alertId: number): Promise<void> {
    const alert = mockAlerts.find((a) => a.id === alertId)
    if (alert) {
      alert.is_read = true
    }
  }

  static async archiveAlert(alertId: number): Promise<void> {
    const alert = mockAlerts.find((a) => a.id === alertId)
    if (alert) {
      alert.is_archived = true
    }
  }
}
