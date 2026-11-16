import { Navigate, useParams } from 'react-router-dom'
import { getProduct, getStore } from '@/entities/catalog/products'
import { useProductReviews } from '@/entities/catalog/reviews'
import { ReviewItem } from '@/entities/catalog/ui/ReviewItem'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { PageHeader } from '@/shared/ui/PageHeader'

/**
 * All reviews of one product, opened from the «Sharhlar» box on its page: every review, newest
 * first, with the shop's reply under it.
 */
export function ProductReviewsPage() {
  const { t, tl } = useI18n()
  const { id } = useParams()
  const product = getProduct(id)
  const reviews = useProductReviews(product?.id ?? '')
  if (!product) return <Navigate to={ROUTES.customerHome} replace />

  const shop = getStore(product.storeId)?.name ?? ''

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('product.reviews')} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
        <p className="-mt-1 truncate text-ink-muted">{tl(product.name)}</p>
        <ul className="rounded-card border border-line bg-canvas px-4">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} hideProduct replyLabel={shop} />
          ))}
        </ul>
      </div>
    </div>
  )
}
