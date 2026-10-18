import { SlidersHorizontal } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BRANDS,
  CATEGORIES,
  getStore,
  stores,
  useCatalog,
  type Category,
  type Product,
} from '@/entities/catalog/products'
import { useI18n } from '@/shared/i18n/useI18n'
import { useLoaded } from '@/shared/lib/useLoaded'
import { SkeletonGrid } from '@/shared/ui/Skeleton'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { NumberField } from '@/shared/ui/NumberField'
import { RangeSlider } from '@/shared/ui/RangeSlider'
import { Select } from '@/shared/ui/Select'
import { Sheet } from '@/shared/ui/Sheet'
import { PageHeader } from '@/shared/ui/PageHeader'
import { getSubcategory, subcategoriesOf } from '@/entities/catalog/subcategories'
import { ProductCard } from '../components/ProductCard'

const ALL = 'all'
const PRICE_STEP = 100_000

type Filters = {
  category: 'all' | Category
  /** A subcategory id of the chosen category, or "all". */
  sub: string
  brand: string
  /** A shop id, or "all". */
  store: string
  priceFrom: number
  priceTo: number
}

const matches = (product: Product, name: string, needle: string, filters: Filters) =>
  (!needle ||
    name.toLowerCase().includes(needle) ||
    product.brand.toLowerCase().includes(needle)) &&
  (filters.category === ALL || product.category === filters.category) &&
  (filters.sub === ALL || product.subcategory === filters.sub) &&
  (filters.brand === ALL || product.brand === filters.brand) &&
  (filters.store === ALL || product.storeId === filters.store) &&
  product.price >= filters.priceFrom &&
  product.price <= filters.priceTo

/** The product listing. It opens from a category, a search result or "Hammasi", and can be filtered. */
export function ProductsPage() {
  const { t, tl } = useI18n()
  const loaded = useLoaded()
  const [searchParams] = useSearchParams()
  const products = useCatalog()
  // The slider runs from the cheapest to the dearest product, rounded out to whole steps
  const prices = products.map((p) => p.price)
  const PRICE_MIN = Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP
  const PRICE_MAX = Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP
  const clampPrice = (value: number | null, fallback: number) =>
    Math.min(PRICE_MAX, Math.max(PRICE_MIN, value ?? fallback))
  const query = searchParams.get('q')?.trim() ?? ''
  const requestedCategory = searchParams.get('category') as Category
  const requestedSub = searchParams.get('sub') ?? ''
  const requestedBrand = searchParams.get('brand') ?? ''
  const requestedStore = searchParams.get('store') ?? ''

  const [filters, setFilters] = useState<Filters>({
    category: CATEGORIES.includes(requestedCategory) ? requestedCategory : ALL,
    sub: getSubcategory(requestedSub)?.parent === requestedCategory ? requestedSub : ALL,
    brand: BRANDS.includes(requestedBrand) ? requestedBrand : ALL,
    store: getStore(requestedStore) ? requestedStore : ALL,
    priceFrom: PRICE_MIN,
    priceTo: PRICE_MAX,
  })
  const [draft, setDraft] = useState(filters)
  const [open, setOpen] = useState(false)

  const needle = query.toLowerCase()
  const items = products.filter((product) => matches(product, tl(product.name), needle, filters))
  // What "Qoʻllash" would show, so the shopper sees the effect before applying
  const draftCount = products.filter((product) =>
    matches(product, tl(product.name), needle, draft),
  ).length
  const activeCount = [
    filters.category !== ALL,
    filters.brand !== ALL,
    filters.store !== ALL,
    filters.priceFrom > PRICE_MIN || filters.priceTo < PRICE_MAX,
  ].filter(Boolean).length

  const title = query
    ? t('search.results', { query })
    : filters.sub !== ALL
      ? tl(getSubcategory(filters.sub)!.name)
      : filters.category !== ALL
        ? t(`catalog.category.${filters.category}`)
        : filters.brand !== ALL
          ? filters.brand
          : filters.store !== ALL
            ? (getStore(filters.store)?.name ?? '')
            : t('catalog.popular')

  const apply = (e: FormEvent) => {
    e.preventDefault()
    setFilters(draft)
    setOpen(false)
  }

  const clear = () => {
    setFilters({
      category: ALL,
      sub: ALL,
      brand: ALL,
      store: ALL,
      priceFrom: PRICE_MIN,
      priceTo: PRICE_MAX,
    })
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
              : 'border border-line bg-canvas text-brand active:bg-navy-100',
          )}
        >
          <SlidersHorizontal size={18} />
          {t('filter.title')}
          {activeCount > 0 && ` · ${activeCount}`}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-1 pb-6">
        {!loaded ? (
          <SkeletonGrid count={6} />
        ) : items.length === 0 ? (
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
            onChange={(category) => setDraft({ ...draft, category, sub: ALL })}
          />
          {draft.category !== ALL && subcategoriesOf(draft.category).length > 0 && (
            <Select
              label={t('filter.subcategory')}
              options={[
                { value: ALL, label: t('catalog.all') },
                ...subcategoriesOf(draft.category).map((sub) => ({
                  value: sub.id,
                  label: tl(sub.name),
                })),
              ]}
              value={draft.sub}
              onChange={(sub) => setDraft({ ...draft, sub })}
            />
          )}
          <Select
            label={t('filter.brand')}
            options={[
              { value: ALL, label: t('catalog.all') },
              ...BRANDS.map((brand) => ({ value: brand, label: brand })),
            ]}
            value={draft.brand}
            onChange={(brand) => setDraft({ ...draft, brand })}
          />
          <Select
            label={t('profile.store')}
            options={[
              { value: ALL, label: t('catalog.all') },
              ...stores.map((store) => ({ value: store.id, label: store.name })),
            ]}
            value={draft.store}
            onChange={(store) => setDraft({ ...draft, store })}
          />

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1.5 text-sm font-medium text-ink-muted">
              {t('filter.price')}, {t('common.currency')}
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label={t('filter.from')}
                value={draft.priceFrom}
                onChange={(value) =>
                  setDraft({
                    ...draft,
                    priceFrom: Math.min(clampPrice(value, PRICE_MIN), draft.priceTo),
                  })
                }
                maxDigits={10}
              />
              <NumberField
                label={t('filter.to')}
                value={draft.priceTo}
                onChange={(value) =>
                  setDraft({
                    ...draft,
                    priceTo: Math.max(clampPrice(value, PRICE_MAX), draft.priceFrom),
                  })
                }
                maxDigits={10}
              />
            </div>
            <RangeSlider
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={[draft.priceFrom, draft.priceTo]}
              onChange={([priceFrom, priceTo]) => setDraft({ ...draft, priceFrom, priceTo })}
              labels={[t('filter.priceFrom'), t('filter.priceTo')]}
            />
          </fieldset>

          <div className="mt-2 flex flex-col gap-1">
            <Button variant="ghost" block onClick={clear}>
              {t('common.clear')}
            </Button>
            <Button type="submit" block disabled={draftCount === 0}>
              {draftCount === 0
                ? t('filter.showNone')
                : t('filter.show', { count: String(draftCount) })}
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  )
}
