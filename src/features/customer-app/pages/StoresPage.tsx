import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog, stores } from '@/entities/catalog/products'
import { customerStorePath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { EmptyState } from '@/shared/ui/EmptyState'
import { SearchField } from '@/shared/ui/SearchField'
import { StoreLogo } from '../components/StoreLogo'
import { StoreRating } from '../components/StoreRating'

/** The shops whose products can be bought on nasiya. */
export function StoresPage() {
  const { t } = useI18n()
  const products = useCatalog()
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const found = stores.filter(
    (store) =>
      needle === '' ||
      store.name.toLowerCase().includes(needle) ||
      store.address.toLowerCase().includes(needle),
  )

  return (
    <div className="flex min-h-full flex-col gap-4 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="flex min-h-10 items-center text-2xl font-bold">{t('customer.nav.stores')}</h1>
      <SearchField
        label={t('stores.search')}
        placeholder={t('stores.search')}
        value={query}
        onChange={setQuery}
      />
      {found.length === 0 && <EmptyState title={t('stores.notFound')} />}
      <ul className="rounded-card bg-surface px-4 empty:hidden">
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
              <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
