import { Navigate, useParams } from 'react-router-dom'
import { getStore, useCatalog } from '@/entities/catalog/products'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ProductCard } from '../components/ProductCard'
import { StoreRating } from '../components/StoreRating'

/** One shop and everything it sells. */
export function StorePage() {
  const { t } = useI18n()
  const products = useCatalog()
  const { id } = useParams()
  const store = getStore(id)

  if (!store) return <Navigate to={ROUTES.customerStores} replace />
  const items = products.filter((product) => product.storeId === store.id)

  return (
    <div className="flex h-full flex-col">
      <PageHeader />
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <StoreRating store={store} />
          <p className="text-ink-muted">
            {store.address} · {t('stores.count', { count: String(items.length) })}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-5">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
