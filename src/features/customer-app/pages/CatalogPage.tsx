import { Heart, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { categoryImages } from '@/entities/catalog/categoryImages'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import { CATEGORIES, useCatalog } from '@/entities/catalog/products'
import { subcategoriesOf } from '@/entities/catalog/subcategories'
import { customerCategoryTarget, customerProductsPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { controlClass } from '@/shared/ui/control'
import { Section } from '@/shared/ui/Section'
import { SearchField } from '@/shared/ui/SearchField'
import { SegmentedTabs } from '@/shared/ui/SegmentedTabs'
import { ProductCard } from '../components/ProductCard'
import { StoreList } from '../components/StoreList'

type Tab = 'products' | 'stores'

/**
 * Katalog, a tab of its own. On top the two tabs, Mahsulotlar and Doʻkonlar, then the search box.
 * On Mahsulotlar the box opens search and Sevimlilar sits beside it, then come the categories and
 * the products; on Doʻkonlar the box filters the shops in place. The chosen tab is kept in the address (`?tab=stores`) so links can open either one.
 */
export function CatalogPage() {
  const { t } = useI18n()
  const products = useCatalog()
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'stores' ? 'stores' : 'products'
  const [storeQuery, setStoreQuery] = useState('')

  return (
    <div className="flex min-h-full flex-col gap-4 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="sr-only">{t('customer.nav.catalog')}</h1>
      <SegmentedTabs
        label={t('catalog.tab.label')}
        options={[
          { value: 'products', label: t('catalog.tab.products') },
          { value: 'stores', label: t('catalog.tab.stores') },
        ]}
        value={tab}
        onChange={(next) =>
          setParams(next === 'stores' ? { tab: 'stores' } : {}, { replace: true })
        }
      />

      {tab === 'stores' ? (
        <SearchField
          label={t('stores.search')}
          placeholder={t('stores.search')}
          value={storeQuery}
          onChange={setStoreQuery}
        />
      ) : (
        <div className="flex items-center gap-2">
          <Link to={ROUTES.customerSearch} className={controlClass(false, 'min-w-0 flex-1')}>
            <Search size={20} className="shrink-0 text-ink-subtle" />
            <span className="truncate text-ink-subtle">{t('catalog.search')}</span>
          </Link>
          <Link
            to={ROUTES.customerFavorites}
            aria-label={t('favorites.title')}
            className="grid size-13 shrink-0 place-items-center rounded-full border border-line bg-canvas text-brand active:bg-navy-100"
          >
            <Heart size={22} />
          </Link>
        </div>
      )}

      {tab === 'stores' ? (
        <StoreList
          // A banner opening this tab again starts the chips over
          key={`${params.get('near')}-${params.get('shops')}`}
          query={storeQuery}
          near={params.get('near') === '1'}
          picked={params.get('shops')?.split(',').filter(Boolean)}
        />
      ) : (
        <>
          <Section
            title={t('chome.categories')}
            action={
              <Link to={ROUTES.customerCategories} className="text-sm font-semibold text-brand">
                {t('catalog.all')}
              </Link>
            }
          >
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((category) => (
                <Link
                  key={category}
                  to={customerCategoryTarget(category, subcategoriesOf(category).length > 0)}
                  className="flex min-w-0 flex-col items-center gap-1.5 text-center text-xs leading-tight font-medium"
                >
                  <ProductPicture
                    category={category}
                    src={categoryImages[category]}
                    className="w-full rounded-card border border-line bg-canvas!"
                  />
                  {t(`catalog.category.${category}`)}
                </Link>
              ))}
            </div>
          </Section>

          <Section
            title={t('catalog.popular')}
            action={
              <Link to={customerProductsPath()} className="text-sm font-semibold text-brand">
                {t('catalog.all')}
              </Link>
            }
          >
            <div className="grid grid-cols-2 gap-x-3 gap-y-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  )
}
