import { Package } from 'lucide-react'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import { getProduct, photosOf } from '@/entities/catalog/products'
import { useVariantNames } from '@/entities/catalog/useVariantNames'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import type { ApplicationProduct } from '../clients'

/** Read-only product lines, each with its picture, and a total row. */
export function ProductsSummary({ products }: { products: ApplicationProduct[] }) {
  const { t, lang } = useI18n()
  const { color } = useVariantNames()
  const count = products.reduce((sum, product) => sum + product.quantity, 0)
  const total = products.reduce((sum, product) => sum + product.price * product.quantity, 0)

  return (
    <ul className="rounded-card border border-line bg-canvas px-4">
      {products.map((line, index) => {
        const product = line.productId ? getProduct(line.productId) : undefined
        const valueIds = line.valueIds ?? []
        return (
          <li key={index} className="flex items-center gap-3 border-b border-line py-3">
            {product ? (
              <ProductPicture
                category={product.category}
                color={color(product, valueIds)}
                src={photosOf(product, lang, valueIds)[0]}
                className="w-14 shrink-0 rounded-control"
              />
            ) : (
              // A line typed by hand has no catalogue picture
              <span className="grid size-14 shrink-0 place-items-center rounded-control bg-surface text-ink-subtle">
                <Package size={24} />
              </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="font-semibold break-words">{line.name}</p>
              <p className="text-sm text-ink-muted">
                {formatSum(line.price)} × {t('common.pieces', { count: String(line.quantity) })}
              </p>
              {line.quantity > 1 && (
                <p className="font-semibold">{formatSum(line.price * line.quantity)}</p>
              )}
            </div>
          </li>
        )
      })}
      <li className="flex items-baseline justify-between gap-3 py-3">
        <p className="text-sm text-ink-muted">
          {t('contract.summary.total')} · {t('common.pieces', { count: String(count) })}
        </p>
        <p className="text-lg font-bold">{formatSum(total)}</p>
      </li>
    </ul>
  )
}
