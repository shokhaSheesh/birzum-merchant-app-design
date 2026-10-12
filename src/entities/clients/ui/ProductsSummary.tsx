import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import type { ApplicationProduct } from '../clients'

/** Read-only product lines with a total row. */
export function ProductsSummary({ products }: { products: ApplicationProduct[] }) {
  const { t } = useI18n()
  const count = products.reduce((sum, product) => sum + product.quantity, 0)
  const total = products.reduce((sum, product) => sum + product.price * product.quantity, 0)

  return (
    <ul className="rounded-card bg-surface px-4">
      {products.map((product, index) => (
        <li
          key={index}
          className="flex items-start justify-between gap-3 border-b border-line py-3"
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="font-semibold break-words">{product.name}</p>
            <p className="text-sm text-ink-muted">
              {formatSum(product.price)} × {t('common.pieces', { count: String(product.quantity) })}
            </p>
          </div>
          <p className="shrink-0 font-semibold">{formatSum(product.price * product.quantity)}</p>
        </li>
      ))}
      <li className="flex items-baseline justify-between gap-3 py-3">
        <p className="text-sm text-ink-muted">
          {t('contract.summary.total')} · {t('common.pieces', { count: String(count) })}
        </p>
        <p className="text-lg font-bold">{formatSum(total)}</p>
      </li>
    </ul>
  )
}
