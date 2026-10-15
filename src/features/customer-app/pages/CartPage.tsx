import { Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cartStore, useCart } from '@/entities/cart/cartStore'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import { getStore, photosOf, stockOf, useCatalog } from '@/entities/catalog/products'
import { useVariantNames } from '@/entities/catalog/useVariantNames'
import { installmentTerms } from '@/entities/clients/installment'
import { StoreLogo } from '../components/StoreLogo'
import { useCustomer } from '@/entities/session/customer'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum, groupDigits } from '@/shared/lib/format'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { QuantityStepper } from '@/shared/ui/QuantityField'
import { Section } from '@/shared/ui/Section'
import { ProductCard } from '../components/ProductCard'

/**
 * The cart: what the shopper picked, grouped by shop, with quantities to adjust. How the
 * goods are received, the term and the card are asked on the next screen, checkout.
 */
export function CartPage() {
  const { t, tl, lang } = useI18n()
  const { names, color } = useVariantNames()
  const navigate = useNavigate()
  const customer = useCustomer()
  const { lines, total, count } = useCart()
  const catalog = useCatalog()

  const title = (
    <h1 className="flex min-h-10 items-center text-2xl font-bold">{t('customer.nav.cart')}</h1>
  )
  const page = 'flex min-h-full flex-col gap-6 px-5 pt-[max(1.5rem,env(safe-area-inset-top))]'

  if (lines.length === 0) {
    return (
      <div className={`${page} pb-tabbar`}>
        {title}
        <div className="flex flex-1 flex-col justify-center gap-4">
          <EmptyState title={t('cart.empty.title')} hint={t('cart.empty.hint')} />
          <Button variant="secondary" block onClick={() => navigate(ROUTES.customerHome)}>
            {t('cart.toCatalog')}
          </Button>
        </div>
      </div>
    )
  }

  const storeIds = [...new Set(lines.map((line) => line.product.storeId))]
  const needsLimit = !customer?.limits
  // More from the categories already in the cart
  const inCart = new Set(lines.map((line) => line.product.id))
  const categories = new Set(lines.map((line) => line.product.category))
  const similar = catalog.filter(
    (product) => categories.has(product.category) && !inCart.has(product.id),
  )
  // The longest term gives the lowest monthly payment; the real term is chosen at checkout
  const lowestMonthly = (amount: number) => installmentTerms(amount, 24).monthlyPayment

  return (
    <div className={page}>
      {title}

      {storeIds.map((storeId) => (
        <section key={storeId} className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <StoreLogo store={getStore(storeId)} size="sm" />
            {getStore(storeId)?.name}
          </h2>
          <ul className="flex flex-col gap-3">
            {lines
              .filter((line) => line.product.storeId === storeId)
              .map(({ key, product, valueIds, unitPrice, quantity }) => {
                const variant = names(product, valueIds)
                return (
                  <li key={key} className="flex gap-3 rounded-card bg-surface p-3">
                    <ProductPicture
                      category={product.category}
                      color={color(product, valueIds)}
                      src={photosOf(product, lang, valueIds)[0]}
                      className="w-20 shrink-0 rounded-control"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <p className="leading-tight font-semibold">{tl(product.name)}</p>
                          {variant.length > 0 && (
                            <p className="text-sm text-ink-muted">{variant.join(' · ')}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          aria-label={t('cart.remove')}
                          onClick={() => cartStore.remove(key)}
                          className="-mt-1.5 -mr-1.5 grid size-10 shrink-0 place-items-center rounded-full text-danger active:bg-danger-soft"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-col">
                          <p className="font-bold">{formatSum(unitPrice * quantity)}</p>
                          <p className="mt-0.5 self-start rounded-full bg-green-200 px-2 py-0.5 text-xs font-semibold whitespace-nowrap">
                            {t('cart.monthly', {
                              amount: groupDigits(lowestMonthly(unitPrice * quantity)),
                            })}
                          </p>
                        </div>
                        <QuantityStepper
                          size="sm"
                          label={t('field.quantity')}
                          value={quantity}
                          max={stockOf(product, valueIds)}
                          onChange={(value) => cartStore.setQuantity(key, value)}
                        />
                      </div>
                    </div>
                  </li>
                )
              })}
          </ul>
        </section>
      ))}

      {similar.length > 0 && (
        <Section title={t('product.similar')}>
          <div className="-mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-1">
            {similar.map((product) => (
              <div key={product.id} className="w-40 shrink-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Stays in view above the tab bar while the list scrolls under it */}
      <div className="sticky bottom-0 -mx-5 mt-auto flex flex-col gap-3 border-t border-line bg-canvas px-5 pt-3 pb-tabbar">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col">
            <p className="text-sm text-ink-muted">
              {t('contract.summary.total')} · {t('common.pieces', { count: String(count) })}
            </p>
            <p className="text-xl leading-tight font-bold">{formatSum(total)}</p>
          </div>
          <p className="rounded-full bg-green-200 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
            {t('cart.monthly', { amount: groupDigits(lowestMonthly(total)) })}
          </p>
        </div>
        {needsLimit && <Alert message={t('product.needLimit')} />}
        <Button block disabled={needsLimit} onClick={() => navigate(ROUTES.customerCheckout)}>
          {t('cart.toCheckout')}
        </Button>
      </div>
    </div>
  )
}
