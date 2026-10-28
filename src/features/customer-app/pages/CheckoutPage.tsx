import { CalendarDays, Check, Plus } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { cartStore, useCart } from '@/entities/cart/cartStore'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import { getStore, photosOf, stockOf, tariffOf } from '@/entities/catalog/products'
import { useVariantNames } from '@/entities/catalog/useVariantNames'
import { submitApplication } from '@/entities/clients/applicationsApi'
import { TERMS, type Fulfilment, type Term } from '@/entities/clients/clients'
import { fulfilmentValid } from '@/entities/clients/fulfilment'
import { installmentTerms } from '@/entities/clients/installment'
import { usedShare } from '@/entities/clients/limitUsage'
import { CardSelect, FulfilmentFields } from '@/entities/clients/ui/FulfilmentFields'
import { LegalConsent } from '@/entities/legal/ui/LegalConsent'
import { usePickupPoints } from '@/entities/merchant/usePickupPoints'
import { SchedulePreviewSheet } from '../components/SchedulePreviewSheet'
import { SelfCheckSheet } from '../components/SelfCheck'
import { StoreLogo } from '../components/StoreLogo'
import { useCustomer } from '@/entities/session/customer'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { NumberField } from '@/shared/ui/NumberField'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'
import { TermPicker } from '@/shared/ui/TermPicker'

type ShopChoice = { fulfilment: Fulfilment; pointId: string | null }
const noChoice: ShopChoice = { fulfilment: { method: 'pickup', address: '' }, pointId: null }

/**
 * Checkout, the step after the cart. The shop first asks how its goods are received (delivery
 * to an address picked on the map), then lists its products, each with its own term at the
 * shop's tariff. A down payment is paid in cash at the shop. The card is chosen once. Before
 * sending, the shopper confirms nobody is guiding them; one ariza is filed per term, since an
 * ariza has a single term.
 */
export function CheckoutPage() {
  const { t, tl, lang } = useI18n()
  const { names, color } = useVariantNames()
  const pickupPoints = usePickupPoints()
  const navigate = useNavigate()
  const customer = useCustomer()
  const { lines, total } = useCart()
  /** The term chosen for each cart line, by its key. Lines not touched yet are at 12 months. */
  const [terms, setTerms] = useState<Record<string, Term>>({})
  /** The cart line whose payment schedule is open, if any. */
  const [scheduleOf, setScheduleOf] = useState<string | null>(null)
  /** Down payments by cart line, and which lines have the field open. */
  const [downs, setDowns] = useState<Record<string, number | null>>({})
  const [downOpen, setDownOpen] = useState<Record<string, boolean>>({})
  const [choices, setChoices] = useState<Record<string, ShopChoice>>({})
  const [pickedCard, setPickedCard] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  /** The "I am doing this myself" sheet, shown once everything else is filled in. */
  const [selfCheck, setSelfCheck] = useState(false)
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

  const termOf = (key: string): Term => terms[key] ?? 12
  const downOf = (key: string) => downs[key] ?? 0
  const financedOf = (line: (typeof lines)[number]) =>
    Math.max(0, line.unitPrice * line.quantity - downOf(line.key))
  const planOf = (line: (typeof lines)[number]) =>
    installmentTerms(financedOf(line), termOf(line.key), tariffOf(line.product.storeId))

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
  const plans = lines.map(planOf)
  const monthlyTotal = plans.reduce((sum, plan) => sum + plan.monthlyPayment, 0)
  const installmentTotal = plans.reduce((sum, plan) => sum + plan.installmentTotal, 0)
  // Each term has its own limit, so mixed terms are measured as shares of their limits
  const limits = customer.limits
  const limitUsed = limits
    ? lines.reduce(
        (share, line) => share + financedOf(line) / limits[termOf(line.key)],
        // Purchases still being paid take their part of the limit too
        usedShare(customer),
      )
    : null
  const error =
    limitUsed === null
      ? t('product.needLimit')
      : limitUsed > 1
        ? t('checkout.overLimit')
        : undefined
  const shortAnywhere = shops.some((shop) => shop.short.length > 0)
  const downTotal = lines.reduce((sum, line) => sum + downOf(line.key), 0)
  const downTooBig = lines.some(
    (line) => downOf(line.key) > 0 && downOf(line.key) >= line.unitPrice * line.quantity,
  )

  const checkout = () => {
    setSubmitted(true)
    if (
      !agreed ||
      error ||
      shortAnywhere ||
      downTooBig ||
      !cardId ||
      !shops.every((shop) => shop.valid)
    )
      return
    setSelfCheck(true)
  }

  const send = async () => {
    if (!cardId) return
    setSelfCheck(false)
    setLoading(true)
    for (const shop of shops) {
      const { fulfilment } = shop.choice
      // An ariza has one term: lines with different terms go into separate ones
      for (const term of TERMS) {
        const group = shop.lines.filter((line) => termOf(line.key) === term)
        if (group.length === 0) continue
        await submitApplication(
          customer.id,
          group.map((line) => ({
            name: lineName(line),
            price: line.unitPrice,
            quantity: line.quantity,
            productId: line.product.id,
            valueIds: line.valueIds,
          })),
          term,
          {
            fulfilment: { ...fulfilment, address: fulfilment.address.trim() },
            cardId,
            downPayment: group.reduce((sum, line) => sum + downOf(line.key), 0),
          },
          { storeId: shop.storeId, locationId: shop.pointId ?? shop.points[0]?.id },
        )
      }
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
              <StoreLogo store={getStore(shop.storeId)} size="sm" />
              {getStore(shop.storeId)?.name}
            </h2>
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
            <ul className="flex flex-col gap-3">
              {shop.lines.map((line) => {
                const variant = names(line.product, line.valueIds)
                return (
                  <li
                    key={line.key}
                    className="flex flex-col gap-3 rounded-card border border-line bg-canvas p-3"
                  >
                    <div className="flex gap-3">
                      <ProductPicture
                        category={line.product.category}
                        color={color(line.product, line.valueIds)}
                        src={photosOf(line.product, lang, line.valueIds)[0]}
                        className="w-16 shrink-0 rounded-control"
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="leading-tight font-semibold">{tl(line.product.name)}</p>
                        <p className="text-sm text-ink-muted">
                          {[...variant, t('common.pieces', { count: String(line.quantity) })].join(
                            ' · ',
                          )}
                        </p>
                        <p className="font-bold">
                          {t('checkout.perMonth', {
                            amount: formatSum(planOf(line).monthlyPayment),
                          })}
                        </p>
                      </div>
                    </div>
                    <TermPicker
                      terms={TERMS}
                      value={termOf(line.key)}
                      onChange={(term) => setTerms((all) => ({ ...all, [line.key]: term }))}
                    />
                    <div className="-my-1 flex flex-wrap gap-x-4">
                      <button
                        type="button"
                        onClick={() => setScheduleOf(line.key)}
                        className="flex h-9 items-center gap-1.5 rounded-full px-1 text-sm font-semibold text-brand active:bg-navy-100"
                      >
                        <CalendarDays size={16} />
                        {t('schedule.open')}
                      </button>
                      {!downOpen[line.key] && (
                        <button
                          type="button"
                          onClick={() => setDownOpen((all) => ({ ...all, [line.key]: true }))}
                          className="flex h-9 items-center gap-1.5 rounded-full px-1 text-sm font-semibold text-brand active:bg-navy-100"
                        >
                          <Plus size={16} />
                          {t('field.downPayment')}
                        </button>
                      )}
                    </div>
                    {downOpen[line.key] && (
                      <NumberField
                        label={t('field.downPayment')}
                        value={downs[line.key] ?? null}
                        onChange={(value) => setDowns((all) => ({ ...all, [line.key]: value }))}
                        suffix={t('common.currency')}
                        maxDigits={10}
                        hint={t('checkout.down.hint')}
                        error={
                          downOf(line.key) >= line.unitPrice * line.quantity
                            ? t('error.downPayment')
                            : undefined
                        }
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}

        <CardSelect cards={cards} cardId={cardId} onCard={setPickedCard} showErrors={submitted} />

        <Section title={t('contract.conditions')}>
          <InfoList>
            <InfoRow label={t('application.goodsTotal')} value={formatSum(total)} />
            <InfoRow label={t('contract.installmentTotal')} value={formatSum(installmentTotal)} />
            <InfoRow label={t('checkout.monthlyTotal')} value={formatSum(monthlyTotal)} />
            {downTotal > 0 && (
              <InfoRow label={t('checkout.payToday')} value={formatSum(downTotal)} />
            )}
          </InfoList>
          {limitUsed !== null && (
            <p className="text-sm text-ink-muted">
              {t('checkout.limitUsed', { percent: String(Math.round(limitUsed * 100)) })}
            </p>
          )}
        </Section>
      </div>

      <footer className="flex shrink-0 flex-col gap-3 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <LegalConsent
          text="consent.checkout"
          documents={['offer', 'privacy']}
          checked={agreed}
          onChange={setAgreed}
          error={submitted && !agreed ? t('consent.required') : undefined}
        />
        {error && <Alert message={error} />}
        <Button block loading={loading} disabled={!!error || shortAnywhere} onClick={checkout}>
          {t('cart.checkout')}
        </Button>
      </footer>
      <SelfCheckSheet
        open={selfCheck}
        action="checkout"
        onConfirm={() => void send()}
        onCancel={() => setSelfCheck(false)}
      />
      {(() => {
        const line = lines.find((item) => item.key === scheduleOf)
        return (
          line && (
            <SchedulePreviewSheet
              title={lineName(line)}
              amount={financedOf(line)}
              term={termOf(line.key)}
              tariff={tariffOf(line.product.storeId)}
              onClose={() => setScheduleOf(null)}
            />
          )
        )
      })()}
    </div>
  )
}
