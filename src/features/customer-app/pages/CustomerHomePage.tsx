import { ArrowRight, Bell, ShoppingBag, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { initials } from '@/entities/clients/clientName'
import { useCustomer } from '@/entities/session/customer'
import { customerCatalogPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { BannerCarousel } from '../components/BannerCarousel'
import { LimitTile } from '../components/LimitTile'
import { NextPaymentCard } from '../components/NextPaymentCard'

const roundButton =
  'relative grid size-11 shrink-0 place-items-center rounded-full border border-line bg-canvas text-brand active:bg-navy-100'

/**
 * Bosh sahifa keeps only the main things, top to bottom: notifications, the limit,
 * "Xaridni hoziroq amalga oshiring" (opens Katalog), the next payment and the banners.
 * Categories and products live in Katalog.
 */
export function CustomerHomePage() {
  const { t } = useI18n()
  const customer = useCustomer()
  const navigate = useNavigate()

  if (!customer) return null
  const hasNews = customer.applications.length > 0

  return (
    <div className="flex min-h-full flex-col gap-4.5 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-tabbar">
      <header className="flex items-center gap-2">
        <Avatar initials={initials(customer)} photoUrl={customer.photoUrl} />
        <p className="min-w-0 flex-1 truncate pl-1 text-lg font-bold">
          {t('chome.greeting', { name: customer.firstName })}
        </p>
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

      <Link
        to={customerCatalogPath()}
        className="flex items-center gap-3.5 rounded-card border border-line bg-canvas px-4.5 py-4 text-ink active:bg-navy-100"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-green-300">
          <ShoppingBag size={24} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-lg leading-tight font-bold">{t('chome.buyNow')}</span>
          <span className="text-sm font-semibold text-navy-700">{t('chome.buyNow.hint')}</span>
        </span>
        <ArrowRight size={22} className="shrink-0" />
      </Link>

      {customer.limits !== null && <NextPaymentCard client={customer} />}

      <BannerCarousel />
    </div>
  )
}
