import { Bell, Heart, Search, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { categoryImages } from '@/entities/catalog/categoryImages'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import { CATEGORIES, useCatalog } from '@/entities/catalog/products'
import { initials } from '@/entities/clients/clientName'
import { useCustomer } from '@/entities/session/customer'
import { customerProductsPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { Section } from '@/shared/ui/Section'
import { LimitTile } from '../components/LimitTile'
import { NextPaymentCard } from '../components/NextPaymentCard'
import { ProductCard } from '../components/ProductCard'

const roundButton =
  'relative grid size-11 shrink-0 place-items-center rounded-full bg-surface text-brand active:bg-navy-100'

/** Shopper home, top to bottom: search and notifications, the limit, categories, products. */
export function CustomerHomePage() {
  const { t } = useI18n()
  const products = useCatalog()
  const customer = useCustomer()
  const navigate = useNavigate()

  if (!customer) return null
  const hasNews = customer.applications.length > 0

  return (
    <div className="flex min-h-full flex-col gap-6 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-tabbar">
      <header className="flex items-center gap-2">
        <Avatar initials={initials(customer)} photoUrl={customer.photoUrl} />
        <p className="min-w-0 flex-1 truncate pl-1 text-lg font-bold">
          {t('chome.greeting', { name: customer.firstName })}
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

      {customer.limits === null ? (
        <section className="flex flex-col gap-4 rounded-card bg-green-200 p-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold">{t('climit.title')}</h2>
            <p className="text-sm text-navy-700">{t('climit.none.hint')}</p>
          </div>
          <Button block onClick={() => navigate(ROUTES.customerScoring)}>
            <Sparkles size={20} />
            {t('climit.get')}
          </Button>
        </section>
      ) : (
        <LimitTile client={customer} limits={customer.limits} />
      )}
      {customer.limits !== null && <NextPaymentCard client={customer} />}

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
              to={customerProductsPath({ category })}
              className="flex min-w-0 flex-col items-center gap-1.5 text-center text-xs leading-tight font-medium"
            >
              <ProductPicture
                category={category}
                src={categoryImages[category]}
                className="w-full rounded-card"
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
    </div>
  )
}
