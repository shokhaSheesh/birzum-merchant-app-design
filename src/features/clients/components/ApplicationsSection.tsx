import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum, groupDigits } from '@/shared/lib/format'
import { Section } from '@/shared/ui/Section'
import { StatusBadge, type StatusTone } from '@/shared/ui/StatusBadge'
import type { ApplicationStatus, Client } from '../data/clients'

const tones: Record<ApplicationStatus, StatusTone> = {
  rejected: 'danger',
  closed: 'neutral',
  cancelled: 'neutral',
}

export function ApplicationsSection({ client }: { client: Client }) {
  const { t } = useI18n()

  return (
    <Section title={t('client.applications')}>
      {client.applications.length === 0 ? (
        <p className="text-sm text-ink-muted">{t('client.applications.empty')}</p>
      ) : (
        <ul className="rounded-card bg-surface px-4">
          {client.applications.map((application) => (
            <li
              key={application.id}
              className="flex items-start justify-between gap-3 border-b border-line py-3 last:border-b-0"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="font-semibold">№ {groupDigits(application.id)}</p>
                <p className="text-sm text-ink-muted">{formatDate(application.date)}</p>
                {application.contractNumber && (
                  <p className="text-sm text-ink-muted">
                    {t('application.contract', { number: application.contractNumber })}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <StatusBadge tone={tones[application.status]}>
                  {t(`application.status.${application.status}`)}
                </StatusBadge>
                {application.installmentTotal > 0 && (
                  <p className="font-semibold">{formatSum(application.installmentTotal)}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
