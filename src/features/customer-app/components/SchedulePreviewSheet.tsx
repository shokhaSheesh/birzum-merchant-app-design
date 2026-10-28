import { useState } from 'react'
import type { Term } from '@/entities/clients/clients'
import { installmentTerms, type Tariff } from '@/entities/clients/installment'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum } from '@/shared/lib/format'
import { Sheet } from '@/shared/ui/Sheet'

type Props = {
  title: string
  /** The goods sum being bought on nasiya, in UZS. */
  amount: number
  term: Term
  /** The shop's tariff, which sets the markup. */
  tariff: Tariff
  onClose: () => void
}

/** Every payment a purchase would bring, before it is made: date and amount, then the total. */
export function SchedulePreviewSheet({ title, amount, term, tariff, onClose }: Props) {
  const { t } = useI18n()
  const plan = installmentTerms(amount, term, tariff)
  const [today] = useState(() => new Date())
  // The first payment falls a month after the shop hands the goods over; shown from today
  const payments = Array.from({ length: term }, (_, i) => {
    const last = i === term - 1
    return {
      date: new Date(today.getFullYear(), today.getMonth() + 1 + i, Math.min(today.getDate(), 28)),
      // Rounding leftovers go into the last payment
      amount: last ? plan.installmentTotal - plan.monthlyPayment * (term - 1) : plan.monthlyPayment,
    }
  })

  return (
    <Sheet open onClose={onClose} title={t('schedule.title')}>
      <div className="flex flex-col gap-4 pt-1 pb-1">
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-ink-muted">
            {t('term.months', { count: String(term) })} · {t('schedule.hint')}
          </p>
        </div>
        <ol className="rounded-card border border-line bg-canvas px-4">
          {payments.map((payment, i) => (
            <li
              key={i}
              className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface text-xs font-bold text-ink-muted">
                {i + 1}
              </span>
              <span className="flex-1">{formatDate(payment.date)}</span>
              <span className="font-semibold">{formatSum(payment.amount)}</span>
            </li>
          ))}
        </ol>
        <div className="flex items-baseline justify-between gap-3 rounded-card bg-green-200 px-4 py-3">
          <p className="text-sm text-navy-700">{t('contract.installmentTotal')}</p>
          <p className="text-lg font-bold">{formatSum(plan.installmentTotal)}</p>
        </div>
      </div>
    </Sheet>
  )
}
