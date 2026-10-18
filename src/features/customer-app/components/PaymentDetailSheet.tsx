import { Check, ReceiptText } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDateTime, formatSum, groupDigits } from '@/shared/lib/format'
import { Button } from '@/shared/ui/Button'
import { FiscalReceipt } from '@/shared/ui/FiscalReceipt'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { Sheet } from '@/shared/ui/Sheet'

// Birzum takes the installments, so its name is on the cheque. Placeholder STIR until given.
const SELLER = { name: 'Birzum', tin: '300000000' }

/** One row of Toʻlovlar tarixi: a day's payment on one purchase, maybe several months at once. */
export type PaidRow = {
  purchaseId: number
  store: string
  card?: string
  paidOn: Date
  amount: number
  /** Installment numbers this payment covered, in order. */
  months: number[]
}

/** A payment's details, and its fiscal cheque one tap away in the same sheet. */
export function PaymentDetailSheet({ row, onClose }: { row: PaidRow; onClose: () => void }) {
  const { t } = useI18n()
  const [receipt, setReceipt] = useState(false)
  const first = row.months[0]
  const last = row.months.at(-1)!
  const months =
    first === last
      ? t('payhistory.month', { n: String(first) })
      : t('payhistory.monthRange', { from: String(first), to: String(last) })

  if (receipt)
    return (
      <Sheet open onClose={onClose} title={t('receipt.title')}>
        <div className="flex flex-col gap-3 overflow-y-auto pb-2">
          <FiscalReceipt
            receipt={{
              seller: SELLER.name,
              tin: SELLER.tin,
              title: t('payhistory.line', { store: row.store, months }),
              amount: row.amount,
              at: row.paidOn,
              card: row.card ?? '',
              seed: `${row.purchaseId}-${row.paidOn.getTime()}`,
            }}
          />
          <Button variant="ghost" block onClick={() => setReceipt(false)}>
            {t('common.back')}
          </Button>
        </div>
      </Sheet>
    )

  return (
    <Sheet open onClose={onClose} title={t('payhistory.detail')}>
      <div className="flex flex-col gap-5 overflow-y-auto pb-2">
        <div className="flex flex-col items-center gap-2 pt-1 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-success-soft text-success">
            <Check size={28} strokeWidth={2.5} />
          </span>
          <span className="text-3xl font-bold tabular-nums">{formatSum(row.amount)}</span>
          <span className="text-sm text-ink-muted">{row.store}</span>
        </div>
        <InfoList>
          <InfoRow label={t('payhistory.status')} value={t('payhistory.status.paid')} />
          <InfoRow label={t('payhistory.date')} value={formatDateTime(row.paidOn)} />
          <InfoRow label={t('payhistory.months')} value={months} />
          <InfoRow label={t('payhistory.store')} value={row.store} />
          <InfoRow label={t('payhistory.purchase')} value={`№ ${groupDigits(row.purchaseId)}`} />
          {row.card && <InfoRow label={t('payhistory.card')} value={row.card} />}
        </InfoList>
        <Button variant="secondary" block onClick={() => setReceipt(true)}>
          <ReceiptText size={20} />
          {t('receipt.show')}
        </Button>
      </div>
    </Sheet>
  )
}
