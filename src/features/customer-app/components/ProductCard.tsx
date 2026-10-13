import { Link } from 'react-router-dom'
import { galleryOf, type Product } from '@/entities/catalog/products'
import { PhotoSwiper } from '@/entities/catalog/ui/PhotoSwiper'
import { installmentTerms } from '@/entities/clients/installment'
import { customerProductPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum, groupDigits } from '@/shared/lib/format'
import { LikeButton } from './LikeButton'

/** A product in a two-column grid: its photos to swipe through with a heart on top, name, price and the lowest monthly payment. */
export function ProductCard({ product }: { product: Product }) {
  const { t, tl, lang } = useI18n()
  const lowestMonthly = installmentTerms(product.price, 24).monthlyPayment

  return (
    <div className="relative min-w-0">
      <Link to={customerProductPath(product.id)} className="flex min-w-0 flex-col gap-1.5">
        <PhotoSwiper
          images={galleryOf(product, lang)}
          category={product.category}
          tileClassName="rounded-card"
          size="sm"
        />
        <p className="line-clamp-2 leading-tight font-semibold">{tl(product.name)}</p>
        <p className="font-bold">{formatSum(product.price)}</p>
        <p className="self-start rounded-full bg-green-200 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
          {t('catalog.perMonth', { amount: groupDigits(lowestMonthly) })}
        </p>
      </Link>
      <LikeButton productId={product.id} className="absolute top-1.5 right-1.5 bg-canvas/85" />
    </div>
  )
}
