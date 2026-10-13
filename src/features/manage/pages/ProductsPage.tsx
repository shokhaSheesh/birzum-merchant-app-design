import { useState } from 'react'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import { OWN_STORE_ID, productsStore, stockOf } from '@/entities/catalog/products'
import { managePath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { SearchField } from '@/shared/ui/SearchField'
import { ListRow, ListScreen } from '../components/ListScreen'

/** The merchant's own products, visible or hidden. */
export function ProductsPage() {
  const { t, tl } = useI18n()
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const products = productsStore
    .useAll()
    .filter((product) => product.storeId === OWN_STORE_ID)
    .filter((product) => `${tl(product.name)} ${product.brand}`.toLowerCase().includes(needle))

  return (
    <ListScreen
      title={t('manage.products')}
      createTo={managePath('products', 'new')}
      empty={products.length === 0}
      toolbar={
        <SearchField
          label={t('catalog.search')}
          placeholder={t('catalog.search')}
          value={query}
          onChange={setQuery}
        />
      }
    >
      <ul className="rounded-card bg-surface px-3">
        {products.map((product) => (
          <ListRow
            key={product.id}
            to={managePath('products', product.id)}
            leading={
              <ProductPicture
                category={product.category}
                src={product.images[0]}
                className="w-14 shrink-0 rounded-control"
              />
            }
            title={tl(product.name)}
            lines={[
              `${product.brand} · ${t(`catalog.category.${product.category}`)}`,
              `${formatSum(product.price)} · ${t('product.totalStock', {
                count: String(stockOf(product)),
              })}`,
            ]}
            inactiveLabel={product.active ? undefined : t('product.hidden')}
          />
        ))}
      </ul>
    </ListScreen>
  )
}
