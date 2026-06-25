export type NotifyEvent = 'generated' | 'review' | 'reminder' | 'published' | 'missed'

export interface NotifyBrand {
  name?: string | null
  slug?: string | null
  reviewers?: Array<{ email?: string | null }> | null
}

export interface NotifyPost {
  id: string | number
  title?: string | null
  copy: string
  platform: string
  language?: string | null
  theme?: string | null
  scheduledTime?: string | null
  status: 'draft' | 'needs-changes' | 'approved' | 'rejected'
  publish?: { state?: string | null } | null
  generationMeta?: { guardrailFlags?: string | null } | null
  notify?: {
    generatedAt?: string | null
    reviewSentAt?: string | null
    reminderSentAt?: string | null
    publishedNotifiedAt?: string | null
    missedAlertSentAt?: string | null
  } | null
  brand?: NotifyBrand | string | number | null
}

export interface NotifyConfig {
  leadDays: number
  hourEt: number
  tz: string
  teamEmails: string[]
  serverUrl: string
}
