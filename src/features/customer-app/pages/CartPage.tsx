import { Check, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartStore, useCart } from '@/entities/cart/cartStore'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import { submitApplication } from '@/entities/clients/applicationsApi'
import type { Term } from '@/entities/clients/clients'
import { installmentTerms } from '@/entities/clients/installment'
import { useCustomer } from '@/entities/session/customer'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { InstallmentTermsCard } from '@/shared/ui/InstallmentTermsCard'
import { QuantityStepper } from '@/shared/ui/QuantityField'
import { TermPicker } from '../components/TermPicker'

/** The cart doubles as checkout: products, the term, what it will cost, and one button to send. */
export function CartPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const customer = useCustomer()
  const { lines, total } = useCart()
  const [term, setTerm] = useState<Term>(12)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const title = (
    <h1 className="flex min-h-10 items-center text-2xl font-bold">{t('customer.nav.cart')}</h1>
  )
  const page =
    'flex min-h-full flex-col gap-6 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar'

  if (sent) {
    return (
      <div className={page}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-green-500 text-navy-950">
            <Check size={40} strokeWidth={3} />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-bold">{t('order.sent.title')}</p>
            <p className="text-ink-muted">{t('order.sent.hint')}</p>
          </div>
        </div>
        <Button block onClick={() => navigate(ROUTES.customerPurchases)}>
          {t('order.sent.go')}
        </Button>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className={page}>
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

  const limit = customer?.limits?.[term]
  const error =
    limit === undefined
      ? t('product.needLimit')
      : total > limit
        ? t('error.overLimit', { limit: formatSum(limit) })
        : undefined

  const checkout = async () => {
    if (!customer || error) return
    setLoading(true)
    await submitApplication(
      customer.id,
      lines.map(({ product, variant, unitPrice, quantity }) => ({
        name: variant.length > 0 ? `${product.name} (${variant.join(', ')})` : product.name,
        price: unitPrice,
        quantity,
      })),
      term,
    )
    cartStore.clear()
    setSent(true)
  }

  return (
    <div className={page}>
      {title}

      <ul className="flex flex-col gap-3">
        {lines.map(({ key, product, variant, color, unitPrice, quantity }) => (
          <li key={key} className="flex gap-3 rounded-card bg-surface p-3">
            <ProductPicture
              category={product.category}
              color={color}
              className="w-20 shrink-0 rounded-control"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="leading-tight font-semibold">{product.name}</p>
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
              <p className="font-bold">{formatSum(unitPrice * quantity)}</p>
              <QuantityStepper
                label={t('field.quantity')}
                value={quantity}
                max={product.stock}
                onChange={(value) => cartStore.setQuantity(key, value)}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3">
        <TermPicker value={term} onChange={setTerm} />
        <InstallmentTermsCard terms={installmentTerms(total, term)} showMarkup={false} />
        {limit !== undefined && (
          <p className="text-sm text-ink-muted">{t('cart.limit', { amount: formatSum(limit) })}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {error && <Alert message={error} />}
        <Button block loading={loading} disabled={!!error} onClick={() => void checkout()}>
          {t('cart.checkout')}
        </Button>
      </div>
    </div>
  )
}
