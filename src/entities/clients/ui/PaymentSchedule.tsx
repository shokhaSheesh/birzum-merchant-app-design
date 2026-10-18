import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum } from '@/shared/lib/format'
import { Alert } from '@/shared/ui/Alert'
import { StatusBadge, type StatusTone } from '@/shared/ui/StatusBadge'
import type { Application } from '../clients'
import { paymentSchedule, type PaymentState } from '../payments'

const tones: Record<PaymentState, StatusTone> = {
  paid: 'success',
  due: 'neutral',
  overdue: 'danger',
}

/** An application's payments: how far along it is, what is overdue, then every installment. */
export function PaymentSchedule({ application }: { application: Application }) {
  const { t } = useI18n()
  const payments = paymentSchedule(application)
  const paid = payments.filter((payment) => payment.state === 'paid')
  const overdue = payments
    .filter((payment) => payment.state === 'overdue')
    .reduce((sum, payment) => sum + payment.amount, 0)
  const remaining = payments
    .filter((payment) => payment.state !== 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="flex flex-col gap-3">
      {overdue > 0 && (
        <Alert message={t('payments.overdueAlert', { amount: formatSum(overdue) })} />
      )}
      <div className="flex flex-col gap-2 rounded-card border border-line bg-canvas p-4">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={payments.length}
          aria-valuenow={paid.length}
          className="h-2 overflow-hidden rounded-full bg-navy-200"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(paid.length / payments.length) * 100}%` }}
          />
        </div>
        <div className="flex items-baseline justify-between gap-3 text-sm text-ink-muted">
          <p>
            {t('payments.progress', {
              paid: String(paid.length),
              total: String(payments.length),
            })}
          </p>
          <p>
            {t('payments.remaining')}:{' '}
            <span className="font-semibold text-ink">{formatSum(remaining)}</span>
          </p>
        </div>
      </div>
      <ul className="rounded-card border border-line bg-canvas px-4">
        {payments.map((payment) => (
          <li
            key={payment.number}
            className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0"
          >
            <div className="flex flex-col gap-0.5">
              <p className="font-semibold">{formatDate(payment.dueDate)}</p>
              <p className="text-sm text-ink-muted">{formatSum(payment.amount)}</p>
            </div>
            <StatusBadge tone={tones[payment.state]}>{t(`payments.${payment.state}`)}</StatusBadge>
          </li>
        ))}
      </ul>
    </div>
  )
}
