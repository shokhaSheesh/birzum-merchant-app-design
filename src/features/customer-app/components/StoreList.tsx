import { ChevronRight, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog, stores } from '@/entities/catalog/products'
import { customerStorePath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { EmptyState } from '@/shared/ui/EmptyState'
import { FilterChips } from '@/shared/ui/FilterChips'
import { StoreLogo } from './StoreLogo'
import { StoreRating } from './StoreRating'

/** A shop's city: its address up to the first comma. */
const cityOf = (address: string) => address.split(',')[0].trim()

// Sample distances to the shopper. The backend will work out the nearest filial of each shop.
const MOCK_KM: Record<string, number> = { s1: 1.2, s2: 3.8, s3: 284 }
const kmOf = (id: string) => MOCK_KM[id] ?? Infinity

const NEAR = 'near'
const ALL = 'all'
const PICKED = 'picked'

type Props = {
  /** Katalog's search box text. */
  query: string
  /** Opened from a "nearest shops" banner: start on Yaqinimda. */
  near?: boolean
  /** Opened from a banner with picked shops: start on those. */
  picked?: string[]
}

/**
 * Katalog's Doʻkonlar tab: the shops selling on nasiya, with a chip row: Hammasi, Yaqinimda
 * (sorted by distance, each with its km) and the cities. The search box is Katalog's.
 */
export function StoreList({ query, near, picked }: Props) {
  const { t } = useI18n()
  const products = useCatalog()
  const [chip, setChip] = useState(picked?.length ? PICKED : near ? NEAR : ALL)
  const cities = [...new Set(stores.map((store) => cityOf(store.address)))]
  const needle = query.trim().toLowerCase()
  const found = stores
    .filter(
      (store) =>
        (chip === ALL ||
          chip === NEAR ||
          (chip === PICKED ? picked?.includes(store.id) : cityOf(store.address) === chip)) &&
        (needle === '' ||
          store.name.toLowerCase().includes(needle) ||
          store.address.toLowerCase().includes(needle)),
    )
    .sort((a, b) => (chip === NEAR ? kmOf(a.id) - kmOf(b.id) : 0))

  return (
    <>
      <FilterChips
        label={t('stores.city.label')}
        options={[
          ...(picked?.length ? [{ value: PICKED, label: t('stores.picked') }] : []),
          { value: ALL, label: t('catalog.all') },
          { value: NEAR, label: t('stores.near') },
          ...cities.map((name) => ({ value: name, label: name })),
        ]}
        value={chip}
        onChange={setChip}
      />
      {found.length === 0 && <EmptyState title={t('stores.notFound')} />}
      <ul className="rounded-card border border-line bg-canvas px-4 empty:hidden">
        {found.map((store) => (
          <li key={store.id} className="border-b border-line last:border-b-0">
            <Link to={customerStorePath(store.id)} className="flex items-center gap-3 py-3">
              <StoreLogo store={store} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate font-semibold">{store.name}</p>
                <p className="truncate text-sm text-ink-muted">{store.address}</p>
                <StoreRating store={store} />
                <p className="text-sm text-ink-muted">
                  {t('stores.count', {
                    count: String(products.filter((p) => p.storeId === store.id).length),
                  })}
                </p>
              </div>
              {chip === NEAR && Number.isFinite(kmOf(store.id)) && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-200 px-2.5 py-1 text-xs font-semibold text-ink">
                  <MapPin size={14} />
                  {t('stores.km', { km: kmOf(store.id).toLocaleString('ru-RU') })}
                </span>
              )}
              <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
