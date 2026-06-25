export function canReschedule(state: string | undefined | null): boolean {
  return state !== 'sent' && state !== 'publishing'
}
