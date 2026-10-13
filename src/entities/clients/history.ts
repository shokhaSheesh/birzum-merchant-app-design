import type { Actor, Application, HistoryEntry } from './clients'

export const SYSTEM: Actor = { kind: 'system', name: '' }
// The sample applications were all handled by the same seller
const SAMPLE_STAFF: Actor = { kind: 'staff', name: 'Aziz Karimov' }

const HOUR = 60 * 60 * 1000
const later = (date: Date, hours: number) => new Date(date.getTime() + hours * HOUR)

/**
 * An application's change log, oldest first. Applications changed in the app carry their
 * own; for the samples it is worked out from the status they ended in.
 */
export function historyOf(application: Application): HistoryEntry[] {
  if (application.history) return application.history

  const { status, date } = application
  if (status === 'pending') return []
  const log: HistoryEntry[] = [{ status: 'processing', at: date, by: SAMPLE_STAFF }]
  if (status === 'handed' || status === 'closed') {
    log.push({ status: 'handed', at: later(date, 2), by: SAMPLE_STAFF })
  }
  if (status === 'closed') {
    log.push({
      status: 'closed',
      at: later(date, 24 * 30 * (application.details?.term ?? 1)),
      by: SYSTEM,
    })
  }
  if (status === 'rejected' || status === 'cancelled') {
    log.push({ status, at: later(date, 1), by: SAMPLE_STAFF, comment: application.cancelComment })
  }
  return log
}
