import { Link } from 'react-router-dom'
import { galleryOf, getStore, tariffOf, type Product } from '@/entities/catalog/products'
import { PhotoSwiper } from '@/entities/catalog/ui/PhotoSwiper'
import { installmentTerms } from '@/entities/clients/installment'
import { customerProductPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum, groupDigits } from '@/shared/lib/format'
import { LikeButton } from './LikeButton'
import { StoreLogo } from './StoreLogo'

/**
 * A product in a two-column grid: its photos to swipe through with a heart on top, the name,
 * two lines of description, the price, the lowest monthly payment and the shop selling it.
 */
export function ProductCard({ product }: { product: Product }) {
  const { t, tl, lang } = useI18n()
  const store = getStore(product.storeId)
  const lowestMonthly = installmentTerms(
    product.price,
    24,
    tariffOf(product.storeId),
  ).monthlyPayment

  return (
    <div className="relative min-w-0 rounded-card border border-line bg-canvas p-2">
      <Link to={customerProductPath(product.id)} className="flex min-w-0 flex-col gap-1.5">
        <PhotoSwiper
          images={galleryOf(product, lang)}
          category={product.category}
          tileClassName="rounded-control"
          size="sm"
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate leading-tight font-semibold">{tl(product.name)}</p>
          {tl(product.description) && (
            <p className="line-clamp-2 text-sm leading-snug text-ink-muted">
              {tl(product.description)}
            </p>
          )}
        </div>
        <p className="font-bold">{formatSum(product.price)}</p>
        <p className="self-start rounded-full bg-green-200 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
          {t('catalog.perMonth', { amount: groupDigits(lowestMonthly) })}
        </p>
        {store && (
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-sm text-ink-muted">
            <StoreLogo store={store} size="xs" />
            <span className="truncate">{store.name}</span>
          </p>
        )}
      </Link>
      <LikeButton productId={product.id} className="absolute top-1.5 right-1.5 bg-canvas/85" />
    </div>
  )
}
