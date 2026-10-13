import { Check, Store } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { cartStore, useCart } from '@/entities/cart/cartStore'
import { getStore, stockOf } from '@/entities/catalog/products'
import { useVariantNames } from '@/entities/catalog/useVariantNames'
import { submitApplication } from '@/entities/clients/applicationsApi'
import { TERMS, type Fulfilment, type Term } from '@/entities/clients/clients'
import { fulfilmentValid } from '@/entities/clients/fulfilment'
import { installmentTerms } from '@/entities/clients/installment'
import { CardSelect, FulfilmentFields } from '@/entities/clients/ui/FulfilmentFields'
import { usePickupPoints } from '@/entities/merchant/usePickupPoints'
import { useCustomer } from '@/entities/session/customer'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { InstallmentTermsCard } from '@/shared/ui/InstallmentTermsCard'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'
import { TermPicker } from '@/shared/ui/TermPicker'

type ShopChoice = { fulfilment: Fulfilment; pointId: string | null }
const noChoice: ShopChoice = { fulfilment: { method: 'pickup', address: '' }, pointId: null }

/**
 * Checkout, the step after the cart. Each shop is asked how its goods are received; the
 * term and the card are chosen once. Sending files one ariza per shop.
 */
export function CheckoutPage() {
  const { t, tl } = useI18n()
  const { names } = useVariantNames()
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

  if (sent) {
    return (
      <div className="flex h-full flex-col gap-6 px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-green-500 text-navy-950">
            <Check size={40} strokeWidth={3} />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-bold">{t('order.sent.title')}</p>
            <p className="text-ink-muted">{t('order.sent.hint')}</p>
          </div>
        </div>
        <Button block onClick={() => navigate(ROUTES.customerPurchases, { replace: true })}>
          {t('order.sent.go')}
        </Button>
      </div>
    )
  }
  if (lines.length === 0 || !customer) return <Navigate to={ROUTES.customerCart} replace />

  const lineName = ({ product, valueIds }: (typeof lines)[number]) => {
    const variant = names(product, valueIds)
    return variant.length > 0 ? `${tl(product.name)} (${variant.join(', ')})` : tl(product.name)
  }

  // One group per shop, in the order its first product was added
  const shops = [...new Set(lines.map((line) => line.product.storeId))].map((storeId) => {
    const points = pickupPoints(storeId)
    const choice = choices[storeId] ?? noChoice
    const shopLines = lines.filter((line) => line.product.storeId === storeId)
    // A shop with one filial needs no question
    const pointId = choice.pointId ?? (points.length === 1 ? points[0].id : null)
    const pickup = choice.fulfilment.method === 'pickup'
    return {
      storeId,
      points,
      choice,
      pointId,
      lines: shopLines,
      // For pickup, everything has to be in the filial it is collected from
      short:
        pickup && pointId
          ? shopLines.filter(
              (line) => stockOf(line.product, line.valueIds, pointId) < line.quantity,
            )
          : [],
      valid: fulfilmentValid(choice.fulfilment) && (!pickup || !!pointId),
    }
  })
  const setChoice = (storeId: string, patch: Partial<ShopChoice>) =>
    setChoices((all) => ({ ...all, [storeId]: { ...(all[storeId] ?? noChoice), ...patch } }))

  const cards = customer.cards
  const cardId = pickedCard ?? (cards.length === 1 ? cards[0].id : null)
  const limit = customer.limits?.[term]
  const error =
    limit === undefined
      ? t('product.needLimit')
      : total > limit
        ? t('error.overLimit', { limit: formatSum(limit) })
        : undefined
  const shortAnywhere = shops.some((shop) => shop.short.length > 0)

  const checkout = async () => {
    setSubmitted(true)
    if (error || shortAnywhere || !cardId || !shops.every((shop) => shop.valid)) return
    setLoading(true)
    for (const shop of shops) {
      const { fulfilment } = shop.choice
      await submitApplication(
        customer.id,
        shop.lines.map((line) => ({
          name: lineName(line),
          price: line.unitPrice,
          quantity: line.quantity,
          productId: line.product.id,
          valueIds: line.valueIds,
        })),
        term,
        { fulfilment: { ...fulfilment, address: fulfilment.address.trim() }, cardId },
        { storeId: shop.storeId, locationId: shop.pointId ?? shop.points[0]?.id },
      )
    }
    cartStore.clear()
    setSent(true)
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('checkout.title')} />

      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 pt-2 pb-6">
        {shops.map((shop) => (
          <section key={shop.storeId} className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Store size={20} className="shrink-0 text-brand" />
              {getStore(shop.storeId)?.name}
            </h2>
            <ul className="rounded-card bg-surface px-4">
              {shop.lines.map((line) => (
                <li
                  key={line.key}
                  className="flex items-baseline justify-between gap-3 border-b border-line py-3 last:border-b-0"
                >
                  <p className="min-w-0 break-words">
                    {lineName(line)}
                    <span className="text-ink-muted"> × {line.quantity}</span>
                  </p>
                  <p className="shrink-0 font-semibold">
                    {formatSum(line.unitPrice * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <FulfilmentFields
              fulfilment={shop.choice.fulfilment}
              onFulfilment={(fulfilment) => setChoice(shop.storeId, { fulfilment })}
              showErrors={submitted}
              points={shop.points}
              pointId={shop.pointId}
              onPoint={(pointId) => setChoice(shop.storeId, { pointId })}
            />
            {shop.short.length > 0 && (
              <Alert
                message={t('checkout.short', { products: shop.short.map(lineName).join(', ') })}
              />
            )}
          </section>
        ))}

        <Section title={t('contract.conditions')}>
          <TermPicker terms={TERMS} value={term} onChange={setTerm} />
          <InstallmentTermsCard terms={installmentTerms(total, term)} showMarkup={false} />
          {limit !== undefined && (
            <p className="text-sm text-ink-muted">
              {t('cart.limit', { amount: formatSum(limit) })}
            </p>
          )}
        </Section>

        <CardSelect cards={cards} cardId={cardId} onCard={setPickedCard} showErrors={submitted} />
      </div>

      <footer className="flex shrink-0 flex-col gap-3 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {error && <Alert message={error} />}
        <Button
          block
          loading={loading}
          disabled={!!error || shortAnywhere}
          onClick={() => void checkout()}
        >
          {t('cart.checkout')}
        </Button>
      </footer>
    </div>
  )
}
