import { Clock, MapPin, Phone, Store as StoreIcon } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { getStore, useCatalog } from '@/entities/catalog/products'
import { reviewsStore } from '@/entities/catalog/reviews'
import { ReviewItem } from '@/entities/catalog/ui/ReviewItem'
import { usePickupPoints } from '@/entities/merchant/usePickupPoints'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'
import { ProductCard } from '../components/ProductCard'
import { StoreRating } from '../components/StoreRating'

/** One shop: who it is, where its filials are, what shoppers say, and everything it sells. */
export function StorePage() {
  const { t } = useI18n()
  const products = useCatalog()
  const pickupPoints = usePickupPoints()
  const allReviews = reviewsStore.useAll()
  const { id } = useParams()
  const store = getStore(id)

  if (!store) return <Navigate to={ROUTES.customerStores} replace />
  const items = products.filter((product) => product.storeId === store.id)
  const points = pickupPoints(store.id)
  const reviews = allReviews
    .filter((review) => review.storeId === store.id)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="flex h-full flex-col">
      <PageHeader />
      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 pb-6">
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-card bg-tile text-on-tile">
            <StoreIcon size={30} />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-2xl leading-tight font-bold">{store.name}</h1>
            <StoreRating store={store} />
          </div>
        </div>

        <Section title={t('manage.locations')}>
          <ul className="rounded-card bg-surface px-4">
            {points.map((point) => (
              <li
                key={point.id}
                className="flex flex-col gap-1.5 border-b border-line py-3 last:border-b-0"
              >
                <p className="font-semibold">{point.name}</p>
                <p className="flex items-start gap-2 text-sm text-ink-muted">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  {point.address}
                </p>
                {point.hours && (
                  <p className="flex items-center gap-2 text-sm text-ink-muted">
                    <Clock size={16} className="shrink-0" />
                    {point.hours}
                  </p>
                )}
                {point.phone && (
                  <a
                    href={`tel:+998${point.phone}`}
                    className="flex items-center gap-2 self-start text-sm font-semibold text-brand"
                  >
                    <Phone size={16} className="shrink-0" />
                    {formatPhone(point.phone)}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Section>

        {reviews.length > 0 && (
          <Section title={t('manage.reviews')}>
            <ul className="rounded-card bg-surface px-4">
              {reviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </ul>
          </Section>
        )}

        <Section title={`${t('manage.products')} · ${items.length}`}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
