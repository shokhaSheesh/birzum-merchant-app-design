import { Clock, Map, MapPin, Phone } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getStore, useCatalog } from '@/entities/catalog/products'
import { usePickupPoints } from '@/entities/merchant/usePickupPoints'
import { customerProductsPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'
import { ProductCard } from '../components/ProductCard'
import { StoreLogo } from '../components/StoreLogo'
import { StoreRating } from '../components/StoreRating'

const pill =
  'flex h-9 items-center gap-1.5 rounded-full bg-surface px-3 text-sm font-semibold text-brand active:bg-navy-100'

/** How many products the shop page shows before "Hammasi" opens the full listing. */
const PREVIEW = 4

/** One shop: who it is, where its filials are, and a first look at what it sells. */
export function StorePage() {
  const { t } = useI18n()
  const products = useCatalog()
  const pickupPoints = usePickupPoints()
  const { id } = useParams()
  const store = getStore(id)

  if (!store) return <Navigate to={ROUTES.customerStores} replace />
  const items = products.filter((product) => product.storeId === store.id)
  const points = pickupPoints(store.id)

  return (
    <div className="flex h-full flex-col">
      <PageHeader />
      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 pb-6">
        <div className="flex items-center gap-4">
          <StoreLogo store={store} size="lg" />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-2xl leading-tight font-bold">{store.name}</h1>
            <StoreRating store={store} />
          </div>
        </div>

        <Section title={t('manage.locations')}>
          <ul className="rounded-card border border-line bg-canvas px-4">
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
                <div className="mt-1 flex flex-wrap gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={pill}
                  >
                    <Map size={16} className="shrink-0" />
                    {t('stores.map')}
                  </a>
                  {point.phone && (
                    <a href={`tel:+998${point.phone}`} className={pill}>
                      <Phone size={16} className="shrink-0" />
                      {formatPhone(point.phone)}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title={`${t('manage.products')} · ${items.length}`}
          action={
            <Link
              to={customerProductsPath({ store: store.id })}
              className="text-sm font-semibold text-brand"
            >
              {t('catalog.all')}
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-x-3 gap-y-5">
            {items.slice(0, PREVIEW).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
