import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import {
  COMMISSION_PERCENT,
  payableFor,
  payoutsOf,
  type Payout,
} from '@/entities/clients/settlements'
import { useApplications, type ApplicationWithClient } from '@/entities/clients/useApplications'
import { shortName } from '@/entities/clients/clientName'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate, formatSum, groupDigits } from '@/shared/lib/format'
import { inPeriod, type Period } from '@/shared/lib/period'
import { EmptyState } from '@/shared/ui/EmptyState'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { PageHeader } from '@/shared/ui/PageHeader'
import { PeriodPicker } from '@/shared/ui/PeriodPicker'
import { Section } from '@/shared/ui/Section'
import { Sheet } from '@/shared/ui/Sheet'
import { StatusBadge } from '@/shared/ui/StatusBadge'

const isSale = ({ application }: ApplicationWithClient) =>
  application.status === 'handed' || application.status === 'closed'

/**
 * Settlements with Birzum for a period: what was sold on nasiya, Birzum's commission, what
 * Birzum owes, how much of it has been transferred, and every transfer with the sales it covers.
 */
export function SettlementsPage() {
  const { t } = useI18n()
  const all = useApplications()
  const [period, setPeriod] = useState<Period>(() => ({ unit: 'month', anchor: new Date() }))
  const [open, setOpen] = useState<Payout | null>(null)

  const sales = all.filter((sale) => isSale(sale) && inPeriod(sale.application.date, period))
  const financed = sales.reduce(
    (sum, { application }) =>
      sum + application.goodsTotal - (application.details?.downPayment ?? 0),
    0,
  )
  const payable = sales.reduce((sum, sale) => sum + payableFor(sale), 0)
  const payouts = payoutsOf(all).filter((payout) =>
    payout.sales.some((sale) => inPeriod(sale.application.date, period)),
  )
  const paid = payouts
    .filter((payout) => payout.state === 'paid')
    .reduce((sum, payout) => sum + payout.amount, 0)

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('settle.title')} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-2 pb-8">
        <PeriodPicker value={period} onChange={setPeriod} />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col rounded-card bg-green-200 p-4">
            <p className="text-sm text-navy-700">{t('settle.left')}</p>
            <p className="text-3xl font-bold">{formatSum(Math.max(0, payable - paid))}</p>
          </div>
          <InfoList>
            <InfoRow
              label={t('settle.sales', { count: String(sales.length) })}
              value={formatSum(financed)}
            />
            <InfoRow
              label={t('settle.commission', { percent: String(COMMISSION_PERCENT) })}
              value={`− ${formatSum(financed - payable)}`}
            />
            <InfoRow label={t('settle.payable')} value={formatSum(payable)} />
            <InfoRow label={t('settle.paid')} value={formatSum(paid)} />
          </InfoList>
        </div>

        <Section title={t('settle.payouts')}>
          {payouts.length === 0 ? (
            <EmptyState title={t('settle.none')} />
          ) : (
            <ul className="rounded-card bg-surface px-4">
              {payouts.map((payout) => (
                <li key={payout.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setOpen(payout)}
                    className="flex w-full items-center gap-3 py-3 text-left"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="font-semibold">{formatDate(payout.date)}</p>
                      <p className="truncate text-sm text-ink-muted">
                        {payout.reference} ·{' '}
                        {t('settle.count', { count: String(payout.sales.length) })}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <p className="font-bold">{formatSum(payout.amount)}</p>
                      <StatusBadge tone={payout.state === 'paid' ? 'success' : 'warning'}>
                        {t(`settle.state.${payout.state}`)}
                      </StatusBadge>
                    </div>
                    <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {open && (
        <Sheet open onClose={() => setOpen(null)} title={open.reference}>
          <div className="flex flex-col gap-4 pt-1 pb-1">
            <InfoList>
              <InfoRow label={t('settle.date')} value={formatDate(open.date)} />
              <InfoRow label={t('settle.amount')} value={formatSum(open.amount)} />
            </InfoList>
            <ul className="rounded-card bg-surface px-4">
              {open.sales.map((sale) => (
                <li
                  key={sale.application.id}
                  className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-b-0"
                >
                  <div className="flex min-w-0 flex-col">
                    <p className="font-semibold">№ {groupDigits(sale.application.id)}</p>
                    <p className="truncate text-sm text-ink-muted">{shortName(sale.client)}</p>
                  </div>
                  <p className="shrink-0 font-semibold">{formatSum(payableFor(sale))}</p>
                </li>
              ))}
            </ul>
          </div>
        </Sheet>
      )}
    </div>
  )
}
