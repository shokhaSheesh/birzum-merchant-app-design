import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'

/** "Nasiya shartlari": monthly payment and term up top, markup and total below. */
type Terms = {
  /** Months. */
  term: number
  markupPercent: number
  installmentTotal: number
  monthlyPayment: number
}

export function InstallmentTermsCard({ terms }: { terms: Terms }) {
  const { t } = useI18n()

  return (
    <div className="overflow-hidden rounded-card bg-surface">
      <div className="flex items-end justify-between gap-4 bg-green-200 p-4">
        <div className="flex min-w-0 flex-col">
          <p className="text-sm text-navy-700">{t('contract.monthly')}</p>
          <p className="text-2xl font-bold">{formatSum(terms.monthlyPayment)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <p className="text-sm text-navy-700">{t('contract.term')}</p>
          <p className="text-2xl font-bold">{t('term.months', { count: String(terms.term) })}</p>
        </div>
      </div>
      <dl className="px-4">
        <div className="flex items-baseline justify-between gap-4 border-b border-line py-3">
          <dt className="text-sm text-ink-muted">{t('contract.markup')}</dt>
          <dd className="font-semibold">{terms.markupPercent}%</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-sm text-ink-muted">{t('contract.installmentTotal')}</dt>
          <dd className="font-semibold">{formatSum(terms.installmentTotal)}</dd>
        </div>
      </dl>
    </div>
  )
}
