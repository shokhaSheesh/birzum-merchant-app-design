import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CATEGORIES, products, type Category } from '@/entities/catalog/products'
import { useI18n } from '@/shared/i18n/useI18n'
import { EmptyState } from '@/shared/ui/EmptyState'
import { FilterChips } from '@/shared/ui/FilterChips'
import { SearchField } from '@/shared/ui/SearchField'
import { PageHeader } from '../components/PageHeader'
import { ProductCard } from '../components/ProductCard'

type Filter = 'all' | Category

/** Product search on its own screen. A home category opens it with that category chosen. */
export function SearchPage() {
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const requested = searchParams.get('category') as Category
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>(CATEGORIES.includes(requested) ? requested : 'all')

  const needle = query.trim().toLowerCase()
  const items = products.filter(
    (product) =>
      (filter === 'all' || product.category === filter) &&
      product.name.toLowerCase().includes(needle),
  )

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('search.title')} />
      <div className="flex shrink-0 flex-col gap-4 px-5 pb-3">
        <SearchField
          label={t('catalog.search')}
          placeholder={t('catalog.search')}
          value={query}
          onChange={setQuery}
          autoFocus={!requested}
        />
        <FilterChips
          label={t('chome.categories')}
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
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-1 pb-6">
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
