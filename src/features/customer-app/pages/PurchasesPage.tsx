import { applicationStatusTone } from '@/entities/clients/applicationStatus'
import { RejectionNote } from '@/entities/clients/ui/RejectionNote'
import { useCustomer } from '@/entities/session/customer'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDateTime, formatSum, groupDigits } from '@/shared/lib/format'
import { EmptyState } from '@/shared/ui/EmptyState'
import { StatusBadge } from '@/shared/ui/StatusBadge'

/** The shopper's own arizalar and where each one stands. */
export function PurchasesPage() {
  const { t } = useI18n()
  const applications = useCustomer()?.applications ?? []

  return (
    <div className="flex min-h-full flex-col gap-4 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="flex min-h-10 items-center text-2xl font-bold">
        {t('customer.nav.purchases')}
      </h1>

      {applications.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center">
          <EmptyState title={t('purchases.empty.title')} hint={t('purchases.empty.hint')} />
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {applications.map((application) => (
            <li key={application.id} className="flex flex-col gap-2 rounded-card bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <p className="font-semibold">
                    {t('review.number', { number: groupDigits(application.id) })}
                  </p>
                  <p className="text-sm text-ink-muted">{formatDateTime(application.date)}</p>
                </div>
                <StatusBadge tone={applicationStatusTone[application.status]}>
                  {t(`application.status.${application.status}`)}
                </StatusBadge>
              </div>
              {application.rejection && <RejectionNote rejection={application.rejection} />}
              {application.details && (
                <>
                  <p className="text-sm text-ink-muted">
                    {application.details.products
                      .map((item) => `${item.name} × ${item.quantity}`)
                      .join(', ')}
                  </p>
                  <div className="flex items-baseline justify-between border-t border-line pt-2">
                    <p className="text-sm text-ink-muted">
                      {t('term.months', { count: String(application.details.term) })} ·{' '}
                      {formatSum(application.details.monthlyPayment)}
                    </p>
                    <p className="font-bold">{formatSum(application.installmentTotal)}</p>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
