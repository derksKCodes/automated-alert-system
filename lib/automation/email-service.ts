// Email notification service
export interface EmailNotification {
  to: string[]
  subject: string
  body: string
  priority: "low" | "normal" | "high"
  alertId?: number
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  bodyTemplate: string
}

export class EmailService {
  private queue: EmailNotification[] = []
  private templates: Map<string, EmailTemplate> = new Map()
  private isProcessing = false

  constructor() {
    // Initialize default templates
    this.initializeTemplates()

    // Start processing queue
    this.startProcessing()
  }

  private initializeTemplates() {
    const templates: EmailTemplate[] = [
      {
        id: "critical-alert",
        name: "Critical Alert",
        subject: "🚨 Critical Alert: {{title}}",
        bodyTemplate: `
          <h2>Critical Alert Detected</h2>
          <p><strong>Title:</strong> {{title}}</p>
          <p><strong>Category:</strong> {{category}}</p>
          <p><strong>Urgency:</strong> {{urgency}}/5</p>
          <p><strong>Time:</strong> {{timestamp}}</p>
          
          <h3>Content:</h3>
          <p>{{content}}</p>
          
          <h3>Keywords Matched:</h3>
          <ul>{{keywords}}</ul>
          
          <p><a href="{{url}}">View in Dashboard</a></p>
        `,
      },
      {
        id: "daily-summary",
        name: "Daily Summary",
        subject: "📊 Daily Alert Summary - {{date}}",
        bodyTemplate: `
          <h2>Daily Alert Summary</h2>
          <p><strong>Date:</strong> {{date}}</p>
          
          <h3>Statistics:</h3>
          <ul>
            <li>Total Alerts: {{totalAlerts}}</li>
            <li>Critical Alerts: {{criticalAlerts}}</li>
            <li>New Categories: {{newCategories}}</li>
          </ul>
          
          <h3>Top Alerts:</h3>
          {{topAlerts}}
          
          <p><a href="{{dashboardUrl}}">View Full Dashboard</a></p>
        `,
      },
      {
        id: "system-health",
        name: "System Health Alert",
        subject: "⚠️ System Health Alert",
        bodyTemplate: `
          <h2>System Health Alert</h2>
          <p><strong>Status:</strong> {{status}}</p>
          <p><strong>Time:</strong> {{timestamp}}</p>
          
          <h3>Issues Detected:</h3>
          {{issues}}
          
          <h3>System Metrics:</h3>
          <ul>
            <li>Error Rate: {{errorRate}}%</li>
            <li>Memory Usage: {{memoryUsage}}%</li>
            <li>Response Time: {{responseTime}}ms</li>
          </ul>
        `,
      },
    ]

    templates.forEach((template) => {
      this.templates.set(template.id, template)
    })
  }

  // Add email to queue
  queueEmail(notification: EmailNotification) {
    this.queue.push(notification)
    console.log(`Email queued: ${notification.subject}`)
  }

  // Send email using template
  queueTemplateEmail(
    templateId: string,
    to: string[],
    variables: Record<string, string>,
    priority: "low" | "normal" | "high" = "normal",
  ) {
    const template = this.templates.get(templateId)
    if (!template) {
      console.error(`Template not found: ${templateId}`)
      return
    }

    const subject = this.replaceVariables(template.subject, variables)
    const body = this.replaceVariables(template.bodyTemplate, variables)

    this.queueEmail({
      to,
      subject,
      body,
      priority,
    })
  }

  // Replace template variables
  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value)
    })
    return result
  }

  // Start processing email queue
  private startProcessing() {
    setInterval(() => {
      if (!this.isProcessing && this.queue.length > 0) {
        this.processQueue()
      }
    }, 5000) // Process every 5 seconds
  }

  // Process email queue
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true

    try {
      // Sort by priority
      this.queue.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })

      // Process up to 5 emails at a time
      const batch = this.queue.splice(0, 5)

      for (const email of batch) {
        await this.sendEmail(email)
      }
    } catch (error) {
      console.error("Error processing email queue:", error)
    } finally {
      this.isProcessing = false
    }
  }

  // Send individual email (mock implementation)
  private async sendEmail(notification: EmailNotification): Promise<void> {
    // Mock email sending - in production would use actual email service
    console.log("📧 Sending email:", {
      to: notification.to,
      subject: notification.subject,
      priority: notification.priority,
    })

    // Simulate sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("✅ Email sent successfully")
  }

  // Get queue status
  getQueueStatus() {
    return {
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
      priorityBreakdown: {
        high: this.queue.filter((e) => e.priority === "high").length,
        normal: this.queue.filter((e) => e.priority === "normal").length,
        low: this.queue.filter((e) => e.priority === "low").length,
      },
    }
  }

  // Get available templates
  getTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values())
  }
}

// Global email service instance
export const globalEmailService = new EmailService()
