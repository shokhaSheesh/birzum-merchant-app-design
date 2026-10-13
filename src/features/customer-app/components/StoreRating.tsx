import { Star } from 'lucide-react'
import type { Store } from '@/entities/catalog/products'
import { reviewsStore } from '@/entities/catalog/reviews'
import { useI18n } from '@/shared/i18n/useI18n'

/** A shop's rating, worked out from its reviews: a star, the average, and how many there are. */
export function StoreRating({ store }: { store: Store }) {
  const { t } = useI18n()
  const reviews = reviewsStore.useAll().filter((review) => review.storeId === store.id)
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / (reviews.length || 1)

  if (reviews.length === 0) {
    return <p className="text-sm text-ink-muted">{t('stores.noReviews')}</p>
  }
  return (
    <p className="flex items-center gap-1 text-sm text-ink-muted">
      <Star size={16} className="fill-warning text-warning" aria-hidden />
      <span className="font-semibold text-ink">{average.toFixed(1)}</span>
      <span>· {t('stores.reviews', { count: String(reviews.length) })}</span>
    </p>
  )
}
