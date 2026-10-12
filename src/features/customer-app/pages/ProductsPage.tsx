import { SlidersHorizontal } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BRANDS, CATEGORIES, products, type Category } from '@/entities/catalog/products'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { NumberField } from '@/shared/ui/NumberField'
import { Select } from '@/shared/ui/Select'
import { Sheet } from '@/shared/ui/Sheet'
import { PageHeader } from '../components/PageHeader'
import { ProductCard } from '../components/ProductCard'

type Filters = {
  category: 'all' | Category
  brand: string
  priceFrom: number | null
  priceTo: number | null
}

const ALL = 'all'

/** The product listing. It opens from a category, a search result or "Hammasi", and can be filtered. */
export function ProductsPage() {
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const requestedCategory = searchParams.get('category') as Category
  const requestedBrand = searchParams.get('brand') ?? ''

  const [filters, setFilters] = useState<Filters>({
    category: CATEGORIES.includes(requestedCategory) ? requestedCategory : ALL,
    brand: BRANDS.includes(requestedBrand) ? requestedBrand : ALL,
    priceFrom: null,
    priceTo: null,
  })
  const [draft, setDraft] = useState(filters)
  const [open, setOpen] = useState(false)

  const needle = query.toLowerCase()
  const items = products.filter(
    (product) =>
      (!needle ||
        product.name.toLowerCase().includes(needle) ||
        product.brand.toLowerCase().includes(needle)) &&
      (filters.category === ALL || product.category === filters.category) &&
      (filters.brand === ALL || product.brand === filters.brand) &&
      (filters.priceFrom === null || product.price >= filters.priceFrom) &&
      (filters.priceTo === null || product.price <= filters.priceTo),
  )
  const activeCount = [
    filters.category !== ALL,
    filters.brand !== ALL,
    filters.priceFrom !== null || filters.priceTo !== null,
  ].filter(Boolean).length

  const title = query
    ? t('search.results', { query })
    : filters.category !== ALL
      ? t(`catalog.category.${filters.category}`)
      : filters.brand !== ALL
        ? filters.brand
        : t('catalog.popular')

  const apply = (e: FormEvent) => {
    e.preventDefault()
    setFilters(draft)
    setOpen(false)
  }

  const clear = () => {
    setFilters({ category: ALL, brand: ALL, priceFrom: null, priceTo: null })
    setOpen(false)
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={title} />
      <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3">
        <p className="text-sm text-ink-muted">
          {t('stores.count', { count: String(items.length) })}
        </p>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => {
            setDraft(filters)
            setOpen(true)
          }}
          className={cn(
            'flex h-10 shrink-0 items-center gap-1.5 rounded-full pr-4 pl-3 text-sm font-semibold transition-colors',
            activeCount > 0
              ? 'bg-primary text-on-primary'
              : 'bg-surface text-brand active:bg-navy-100',
          )}
        >
          <SlidersHorizontal size={18} />
          {t('filter.title')}
          {activeCount > 0 && ` · ${activeCount}`}
        </button>
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

      <Sheet open={open} onClose={() => setOpen(false)} title={t('filter.title')}>
        <form onSubmit={apply} noValidate className="flex flex-col gap-4 pt-1 pb-1">
          <Select
            label={t('filter.category')}
            options={[
              { value: ALL, label: t('catalog.all') },
              ...CATEGORIES.map((category) => ({
                value: category,
                label: t(`catalog.category.${category}`),
              })),
            ]}
            value={draft.category}
            onChange={(category) => setDraft({ ...draft, category })}
          />
          <Select
            label={t('filter.brand')}
            options={[
              { value: ALL, label: t('catalog.all') },
              ...BRANDS.map((brand) => ({ value: brand, label: brand })),
            ]}
            value={draft.brand}
            onChange={(brand) => setDraft({ ...draft, brand })}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={t('filter.priceFrom')}
              value={draft.priceFrom}
              onChange={(priceFrom) => setDraft({ ...draft, priceFrom })}
              maxDigits={10}
            />
            <NumberField
              label={t('filter.priceTo')}
              value={draft.priceTo}
              onChange={(priceTo) => setDraft({ ...draft, priceTo })}
              maxDigits={10}
            />
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <Button variant="ghost" block onClick={clear}>
              {t('common.clear')}
            </Button>
            <Button type="submit" block>
              {t('common.apply')}
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  )
}
