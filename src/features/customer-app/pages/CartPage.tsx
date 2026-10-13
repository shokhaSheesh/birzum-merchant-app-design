import { Check, Store, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartStore, useCart } from '@/entities/cart/cartStore'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import { getStore, photosOf, stockOf } from '@/entities/catalog/products'
import { useVariantNames } from '@/entities/catalog/useVariantNames'
import { submitApplication } from '@/entities/clients/applicationsApi'
import { TERMS, type Fulfilment, type Term } from '@/entities/clients/clients'
import { fulfilmentValid } from '@/entities/clients/fulfilment'
import { CardSelect, FulfilmentFields } from '@/entities/clients/ui/FulfilmentFields'
import { usePickupPoints } from '@/entities/merchant/usePickupPoints'
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
import { TermPicker } from '@/shared/ui/TermPicker'

type ShopChoice = { fulfilment: Fulfilment; pointId: string | null }
const noChoice: ShopChoice = { fulfilment: { method: 'pickup', address: '' }, pointId: null }

/**
 * The cart doubles as checkout. Products are grouped by shop, and each shop is asked how its
 * goods are received; the term and the card are chosen once. Sending files one ariza per shop.
 */
export function CartPage() {
  const { t, tl, lang } = useI18n()
  const { names, color } = useVariantNames()
  const pickupPoints = usePickupPoints()
  const navigate = useNavigate()
  const customer = useCustomer()
  const { lines, total } = useCart()
  const [term, setTerm] = useState<Term>(12)
  const [choices, setChoices] = useState<Record<string, ShopChoice>>({})
  const [pickedCard, setPickedCard] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
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

  // One group per shop, in the order its first product was added
  const shops = [...new Set(lines.map((line) => line.product.storeId))].map((storeId) => {
    const points = pickupPoints(storeId)
    const choice = choices[storeId] ?? noChoice
    return {
      storeId,
      points,
      choice,
      // A shop with one filial needs no question
      pointId: choice.pointId ?? (points.length === 1 ? points[0].id : null),
      lines: lines.filter((line) => line.product.storeId === storeId),
    }
  })
  const setChoice = (storeId: string, patch: Partial<ShopChoice>) =>
    setChoices((all) => ({ ...all, [storeId]: { ...(all[storeId] ?? noChoice), ...patch } }))
  const shopsValid = shops.every(
    (shop) =>
      fulfilmentValid(shop.choice.fulfilment) &&
      (shop.choice.fulfilment.method === 'delivery' || shop.pointId),
  )

  const cards = customer?.cards ?? []
  const cardId = pickedCard ?? (cards.length === 1 ? cards[0].id : null)
  const limit = customer?.limits?.[term]
  const error =
    limit === undefined
      ? t('product.needLimit')
      : total > limit
        ? t('error.overLimit', { limit: formatSum(limit) })
        : undefined

  const checkout = async () => {
    setSubmitted(true)
    if (!customer || error || !cardId || !shopsValid) return
    setLoading(true)
    for (const shop of shops) {
      const { fulfilment } = shop.choice
      await submitApplication(
        customer.id,
        shop.lines.map(({ product, valueIds, unitPrice, quantity }) => {
          const variant = names(product, valueIds)
          return {
            name:
              variant.length > 0 ? `${tl(product.name)} (${variant.join(', ')})` : tl(product.name),
            price: unitPrice,
            quantity,
            productId: product.id,
            valueIds,
          }
        }),
        term,
        { fulfilment: { ...fulfilment, address: fulfilment.address.trim() }, cardId },
        { storeId: shop.storeId, locationId: shop.pointId ?? shop.points[0]?.id },
      )
    }
    cartStore.clear()
    setSent(true)
  }

  return (
    <div className={page}>
      {title}

      {shops.map((shop) => (
        <section key={shop.storeId} className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Store size={20} className="shrink-0 text-brand" />
            {getStore(shop.storeId)?.name}
          </h2>
          <ul className="flex flex-col gap-3">
            {shop.lines.map(({ key, product, valueIds, unitPrice, quantity }) => {
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
                      <p className="font-bold">{formatSum(unitPrice * quantity)}</p>
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
          <FulfilmentFields
            fulfilment={shop.choice.fulfilment}
            onFulfilment={(fulfilment) => setChoice(shop.storeId, { fulfilment })}
            showErrors={submitted}
            points={shop.points}
            pointId={shop.pointId}
            onPoint={(pointId) => setChoice(shop.storeId, { pointId })}
          />
        </section>
      ))}

      <div className="flex flex-col gap-3">
        <TermPicker terms={TERMS} value={term} onChange={setTerm} />
        <InstallmentTermsCard terms={installmentTerms(total, term)} showMarkup={false} />
        {limit !== undefined && (
          <p className="text-sm text-ink-muted">{t('cart.limit', { amount: formatSum(limit) })}</p>
        )}
      </div>

      <CardSelect cards={cards} cardId={cardId} onCard={setPickedCard} showErrors={submitted} />

      <div className="flex flex-col gap-3">
        {error && <Alert message={error} />}
        <Button block loading={loading} disabled={!!error} onClick={() => void checkout()}>
          {t('cart.checkout')}
        </Button>
      </div>
    </div>
  )
}
