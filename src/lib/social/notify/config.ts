import type { NotifyConfig } from './types'

function num(v: string | undefined, fallback: number): number {
  const n = Number(v)
  return v !== undefined && v !== '' && Number.isFinite(n) ? n : fallback
}

export function loadNotifyConfig(env: NodeJS.ProcessEnv = process.env): NotifyConfig {
  return {
    leadDays: num(env.SOCIAL_REVIEW_LEAD_DAYS, 2),
    hourEt: num(env.SOCIAL_NOTIFY_HOUR_ET, 9),
    tz: 'America/New_York',
    teamEmails: (env.SOCIAL_TEAM_EMAILS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    serverUrl: (env.NEXT_PUBLIC_SERVER_URL ?? '').replace(/\/+$/, ''),
  }
}
