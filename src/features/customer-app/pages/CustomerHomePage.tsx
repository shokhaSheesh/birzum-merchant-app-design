import { Bell, Heart, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, useCatalog } from '@/entities/catalog/products'
import { initials } from '@/entities/clients/clientName'
import { calculateLimit } from '@/entities/clients/limitsApi'
import { useCustomer } from '@/entities/session/customer'
import { customerProductsPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { Section } from '@/shared/ui/Section'
import { categoryIcons } from '../components/categoryIcons'
import { ProductCard } from '../components/ProductCard'

const roundButton =
  'relative grid size-11 shrink-0 place-items-center rounded-full bg-surface text-brand active:bg-navy-100'

/** Shopper home, top to bottom: search and notifications, the limit, categories, products. */
export function CustomerHomePage() {
  const { t } = useI18n()
  const products = useCatalog()
  const customer = useCustomer()
  const [loading, setLoading] = useState(false)

  if (!customer) return null
  const highestLimit = customer.limits && Math.max(...Object.values(customer.limits))
  const hasNews = customer.applications.length > 0

  const getLimit = async () => {
    setLoading(true)
    await calculateLimit(customer.id)
    setLoading(false)
  }

  return (
    <div className="flex min-h-full flex-col gap-6 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-tabbar">
      <header className="flex items-center gap-2">
        <Avatar initials={initials(customer)} photoUrl={customer.photoUrl} />
        <p className="min-w-0 flex-1 truncate pl-1 text-lg font-bold">
          {t('home.greeting', { name: customer.firstName })}
        </p>
        <Link to={ROUTES.customerSearch} aria-label={t('search.title')} className={roundButton}>
          <Search size={22} />
        </Link>
        <Link
          to={ROUTES.customerFavorites}
          aria-label={t('favorites.title')}
          className={roundButton}
        >
          <Heart size={22} />
        </Link>
        <Link
          to={ROUTES.customerNotifications}
          aria-label={t('notifications.title')}
          className={roundButton}
        >
          <Bell size={22} />
          {hasNews && (
            <span className="absolute top-2.5 right-2.5 size-2.5 rounded-full bg-green-500 ring-2 ring-surface" />
          )}
        </Link>
      </header>

      {highestLimit === null ? (
        <section className="flex flex-col gap-4 rounded-card bg-green-200 p-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold">{t('climit.title')}</h2>
            <p className="text-sm text-navy-700">{t('climit.none.hint')}</p>
          </div>
          <Button block loading={loading} onClick={() => void getLimit()}>
            <Sparkles size={20} />
            {t('climit.get')}
          </Button>
        </section>
      ) : (
        <section className="flex flex-col gap-1 rounded-card bg-tile p-5 text-on-tile">
          <p className="text-sm opacity-75">{t('climit.title')}</p>
          <p className="text-3xl font-bold">
            {t('climit.upTo', { amount: formatSum(highestLimit) })}
          </p>
          <p className="text-sm opacity-75">{t('climit.hint')}</p>
        </section>
      )}

      <Section
        title={t('chome.categories')}
        action={
          <Link to={ROUTES.customerCategories} className="text-sm font-semibold text-brand">
            {t('catalog.all')}
          </Link>
        }
      >
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((category) => {
            const Icon = categoryIcons[category]
            return (
              <Link
                key={category}
                to={customerProductsPath({ category })}
                className="flex min-w-0 flex-col items-center gap-1.5 text-center text-xs leading-tight font-medium"
              >
                <span className="grid aspect-square w-full place-items-center rounded-card bg-surface text-brand active:bg-navy-100">
                  <Icon size={28} />
                </span>
                {t(`catalog.category.${category}`)}
              </Link>
            )
          })}
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
    </div>
  )
}
