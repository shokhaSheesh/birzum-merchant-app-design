import { useState } from 'react'
import { CATEGORIES, products, type Category } from '@/entities/catalog/products'
import { useI18n } from '@/shared/i18n/useI18n'
import { EmptyState } from '@/shared/ui/EmptyState'
import { FilterChips } from '@/shared/ui/FilterChips'
import { SearchField } from '@/shared/ui/SearchField'
import { ProductCard } from '../components/ProductCard'

type Filter = 'all' | Category

export function CatalogPage() {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const needle = query.trim().toLowerCase()
  const items = products.filter(
    (product) =>
      (filter === 'all' || product.category === filter) &&
      product.name.toLowerCase().includes(needle),
  )

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-4 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-3">
        <h1 className="flex min-h-10 items-center text-2xl font-bold">
          {t('customer.nav.catalog')}
        </h1>
        <SearchField
          label={t('catalog.search')}
          placeholder={t('catalog.search')}
          value={query}
          onChange={setQuery}
        />
        <FilterChips
          label={t('customer.nav.catalog')}
          options={[
            { value: 'all', label: t('catalog.all') },
            ...CATEGORIES.map((category) => ({
              value: category,
              label: t(`catalog.category.${category}`),
            })),
          ]}
          value={filter}
          onChange={setFilter}
        />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-1 pb-tabbar">
        {items.length === 0 ? (
          <EmptyState title={t('catalog.empty.title')} hint={t('applications.empty.hint')} />
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
