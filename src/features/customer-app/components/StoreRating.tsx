import { Star } from 'lucide-react'
import type { Store } from '@/entities/catalog/products'
import { useI18n } from '@/shared/i18n/useI18n'

/** A shop's rating: a star, the score, and how many reviews it is based on. */
export function StoreRating({ store }: { store: Store }) {
  const { t } = useI18n()

  return (
    <p className="flex items-center gap-1 text-sm text-ink-muted">
      <Star size={16} className="fill-warning text-warning" aria-hidden />
      <span className="font-semibold text-ink">{store.rating.toFixed(1)}</span>
      <span>· {t('stores.reviews', { count: String(store.reviews) })}</span>
    </p>
  )
}
