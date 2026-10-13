import { getProduct } from '@/entities/catalog/products'
import { useFavorites } from '@/entities/favorites/favoritesStore'
import { useI18n } from '@/shared/i18n/useI18n'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ProductCard } from '../components/ProductCard'

/** Products the shopper liked. */
export function FavoritesPage() {
  const { t } = useI18n()
  const items = useFavorites().flatMap((id) => getProduct(id) ?? [])

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('favorites.title')} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-6">
        {items.length === 0 ? (
          <EmptyState title={t('favorites.empty.title')} hint={t('favorites.empty.hint')} />
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-5">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
