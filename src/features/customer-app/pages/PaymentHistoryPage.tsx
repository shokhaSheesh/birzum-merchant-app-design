import { Link } from 'react-router-dom'
import { getStore, OWN_STORE_ID } from '@/entities/catalog/products'
import { cardLabel } from '@/entities/clients/cardBrand'
import type { Application } from '@/entities/clients/clients'
import { hasSchedule, paymentSchedule } from '@/entities/clients/payments'
import { useCustomer } from '@/entities/session/customer'
import { customerPurchasePath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum, groupDigits } from '@/shared/lib/format'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'

/** Every installment the shopper has paid, across all purchases, newest first. */
export function PaymentHistoryPage() {
  const { t } = useI18n()
  const customer = useCustomer()

  // One row per purchase and day: a nasiya closed early pays its remaining months at once
  const rows = new Map<string, { application: Application; paidOn: Date; amount: number }>()
  for (const application of (customer?.applications ?? []).filter(hasSchedule)) {
    for (const payment of paymentSchedule(application)) {
      if (!payment.paidOn) continue
      const key = `${application.id}-${formatDate(payment.paidOn)}`
      const row = rows.get(key) ?? { application, paidOn: payment.paidOn, amount: 0 }
      rows.set(key, { ...row, amount: row.amount + payment.amount })
    }
  }
  const payments = [...rows.values()].sort((a, b) => b.paidOn.getTime() - a.paidOn.getTime())
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('payhistory.title')} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
        {payments.length === 0 ? (
          <EmptyState title={t('payhistory.empty')} />
        ) : (
          <>
            <div className="flex flex-col rounded-card bg-surface p-4">
              <p className="text-sm text-ink-muted">{t('payhistory.total')}</p>
              <p className="text-2xl font-bold">{formatSum(total)}</p>
              <p className="text-sm text-ink-muted">
                {t('payhistory.count', { count: String(payments.length) })}
              </p>
            </div>
            <ul className="rounded-card bg-surface px-4">
              {payments.map(({ application, paidOn, amount }) => {
                const card = customer?.cards.find((item) => item.id === application.details?.cardId)
                return (
                  <li
                    key={`${application.id}-${paidOn.getTime()}`}
                    className="border-b border-line last:border-b-0"
                  >
                    <Link
                      to={customerPurchasePath(application.id)}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <p className="font-semibold">{formatDate(paidOn)}</p>
                        <p className="truncate text-sm text-ink-muted">
                          {getStore(application.storeId ?? OWN_STORE_ID)?.name} · №{' '}
                          {groupDigits(application.id)}
                        </p>
                        {card && <p className="text-sm text-ink-muted">{cardLabel(card)}</p>}
                      </div>
                      <p className="shrink-0 font-bold">{formatSum(amount)}</p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
