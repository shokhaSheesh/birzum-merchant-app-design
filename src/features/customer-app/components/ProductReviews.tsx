import { ChevronRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ratingOf, useProductReviews } from '@/entities/catalog/reviews'
import { Stars } from '@/entities/catalog/ui/ReviewItem'
import { customerProductReviewsPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'

/**
 * The product page's «Sharhlar» box: the average, the stars and how many reviews, plus the
 * newest review's first lines. Tapping it opens all the product's reviews on their own page.
 */
export function ProductReviews({ productId }: { productId: string }) {
  const { t } = useI18n()
  const reviews = useProductReviews(productId)
  const { average, count } = ratingOf(reviews)

  if (count === 0) {
    return (
      <div className="flex items-center gap-3 rounded-card border border-line bg-canvas p-4">
        <Star size={22} className="shrink-0 text-navy-200" />
        <p className="text-sm text-ink-muted">{t('product.reviews.none')}</p>
      </div>
    )
  }
  const latest = reviews[0]
  return (
    <Link
      to={customerProductReviewsPath(productId)}
      className="flex flex-col gap-3 rounded-card border border-line bg-canvas p-4 active:bg-navy-100"
    >
      <div className="flex items-center gap-3">
        <p className="text-3xl font-bold">{average.toFixed(1)}</p>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Stars rating={average} size={16} />
          <span className="text-sm text-ink-muted">
            {t('stores.reviews', { count: String(count) })}
          </span>
        </div>
        <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
      </div>
      {latest.text && (
        <p className="line-clamp-2 border-t border-line pt-3 text-sm text-ink-muted">
          <span className="font-semibold text-ink">{latest.author}:</span> {latest.text}
        </p>
      )}
    </Link>
  )
}
