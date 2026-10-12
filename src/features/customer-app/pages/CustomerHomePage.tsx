import { Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { products } from '@/entities/catalog/products'
import { initials } from '@/entities/clients/clientName'
import { calculateLimit } from '@/entities/clients/limitsApi'
import { useCustomer } from '@/entities/session/customer'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { Section } from '@/shared/ui/Section'
import { ProductCard } from '../components/ProductCard'

const POPULAR = 4

/** Shopper home: their limit first, since nothing can be bought without one, then products. */
export function CustomerHomePage() {
  const { t } = useI18n()
  const customer = useCustomer()
  const [loading, setLoading] = useState(false)

  if (!customer) return null
  const highestLimit = customer.limits && Math.max(...Object.values(customer.limits))

  const getLimit = async () => {
    setLoading(true)
    await calculateLimit(customer.id)
    setLoading(false)
  }

  return (
    <div className="flex min-h-full flex-col gap-6 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-tabbar">
      <header className="flex items-center gap-3">
        <Avatar initials={initials(customer)} photoUrl={customer.photoUrl} />
        <p className="truncate text-lg font-bold">
          {t('home.greeting', { name: customer.firstName })}
        </p>
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

      <Link
        to={ROUTES.customerCatalog}
        className="flex h-13 items-center gap-2 rounded-control bg-surface px-4 text-ink-subtle"
      >
        <Search size={20} />
        {t('catalog.search')}
      </Link>

      <Section
        title={t('catalog.popular')}
        action={
          <Link to={ROUTES.customerCatalog} className="text-sm font-semibold text-brand">
            {t('catalog.all')}
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-x-3 gap-y-5">
          {products.slice(0, POPULAR).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Section>
    </div>
  )
}
