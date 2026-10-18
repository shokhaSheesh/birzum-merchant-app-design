import { useI18n } from '@/shared/i18n/useI18n'
import { formatDateTime } from '@/shared/lib/format'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { applicationStatusTone } from '../applicationStatus'
import type { Application } from '../clients'
import { historyOf } from '../history'

/** An application's change log, newest first: the status, when, who did it, and their comment. */
export function HistoryList({ application }: { application: Application }) {
  const { t } = useI18n()
  const entries = historyOf(application).toReversed()

  if (entries.length === 0) {
    return <p className="text-sm text-ink-muted">{t('history.empty')}</p>
  }
  return (
    <ol className="rounded-card border border-line bg-canvas px-4">
      {entries.map((entry, i) => (
        <li key={i} className="flex flex-col gap-1.5 border-b border-line py-3 last:border-b-0">
          <div className="flex items-center justify-between gap-3">
            <StatusBadge tone={applicationStatusTone[entry.status]}>
              {t(`application.status.${entry.status}`)}
            </StatusBadge>
            <p className="shrink-0 text-sm text-ink-muted">{formatDateTime(entry.at)}</p>
          </div>
          <p className="text-sm">
            {entry.by.name && <span className="font-semibold">{entry.by.name} · </span>}
            <span className="text-ink-muted">{t(`history.actor.${entry.by.kind}`)}</span>
          </p>
          {entry.comment && <p className="text-sm break-words text-ink-muted">{entry.comment}</p>}
        </li>
      ))}
    </ol>
  )
}
