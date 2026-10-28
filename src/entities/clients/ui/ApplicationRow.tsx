import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { applicationPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum, groupDigits } from '@/shared/lib/format'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { applicationStatusTone } from '../applicationStatus'
import type { Application } from '../clients'
import { ConfirmCountdown } from './ConfirmCountdown'

type Props = {
  application: Application
  /** Shown when the list mixes several clients. */
  clientName?: string
}

/** One application in a list. Opens the application's detail screen. */
export function ApplicationRow({ application, clientName }: Props) {
  const { t } = useI18n()

  return (
    <li className="border-b border-line last:border-b-0">
      <Link to={applicationPath(application.id)} className="flex items-center gap-2 py-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">№ {groupDigits(application.id)}</p>
            <StatusBadge tone={applicationStatusTone[application.status]}>
              {t(`application.status.${application.status}`)}
            </StatusBadge>
          </div>
          {clientName && <p className="truncate">{clientName}</p>}
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm text-ink-muted">
              {formatDate(application.date)}
              {application.status === 'pending' && (
                <>
                  {' · '}
                  <ConfirmCountdown application={application} />
                </>
              )}
            </p>
            {application.installmentTotal > 0 && (
              <p className="font-semibold">{formatSum(application.installmentTotal)}</p>
            )}
          </div>
        </div>
        <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
      </Link>
    </li>
  )
}
