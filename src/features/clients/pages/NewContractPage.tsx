import { Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { clientPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { formatSum, groupDigits } from '@/shared/lib/format'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { ChoiceGrid } from '@/shared/ui/ChoiceGrid'
import { FormScreen } from '@/shared/ui/FormScreen'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { NumberField } from '@/shared/ui/NumberField'
import { QuantityStepper } from '@/shared/ui/QuantityField'
import { Section } from '@/shared/ui/Section'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { TermPicker } from '@/shared/ui/TermPicker'
import { Select } from '@/shared/ui/Select'
import { calculateTerms, createApplication, nextApplicationNumber } from '../api/mockClients'
import { InstallmentTermsCard } from '@/shared/ui/InstallmentTermsCard'
import { TERMS, type Fulfilment, type Term } from '@/entities/clients/clients'
import { fulfilmentValid } from '@/entities/clients/fulfilment'
import { CardSelect, FulfilmentFields } from '@/entities/clients/ui/FulfilmentFields'
import { FulfilmentRows } from '@/entities/clients/ui/FulfilmentRows'
import { MIN_APPLICATION_TOTAL, type InstallmentTerms } from '@/entities/clients/installment'
import { ProductsSummary } from '@/entities/clients/ui/ProductsSummary'
import { useClient } from '@/entities/clients/useClients'
import {
  OWN_STORE_ID,
  priceOf,
  productsStore,
  soldCombos,
  stockOf,
  variantIds,
  variantKey,
} from '@/entities/catalog/products'
import { useVariantNames } from '@/entities/catalog/useVariantNames'
import { useActor } from '@/entities/merchant/useActor'
import { useMyLocations } from '@/entities/merchant/useMyLocations'

/** A row of the form: which catalogue product, which of its variants (by key), and how many. */
type Line = {
  id: number
  productId: string | null
  variant: string | null
  quantity: number
  term: Term
}
/** The lines that share a term become one application, with these terms. */
type Plan = { term: Term; terms: InstallmentTerms }

const PAYMENT_DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const emptyProduct = (id: number, term: Term): Line => ({
  id,
  productId: null,
  variant: null,
  quantity: 1,
  term,
})

/**
 * New installment contract for a client. Each product gets its own term; the form also
 * collects the down payment and payment day. "Davom etish" first reveals the installment
 * terms, then opens a review step. An application has one term, so confirming creates one
 * application per term used.
 */
export function NewContractPage() {
  const { t, tl } = useI18n()
  const { names } = useVariantNames()
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const client = useClient(id)

  const requestedTerm = Number(searchParams.get('term')) as Term
  /** The term a new product row starts with: the one chosen on the client's limit card. */
  const startTerm: Term = TERMS.includes(requestedTerm) ? requestedTerm : 12
  const [products, setProducts] = useState<Line[]>([emptyProduct(1, startTerm)])
  const catalogue = productsStore
    .useAll()
    .filter((product) => product.storeId === OWN_STORE_ID && product.active)
  // The sale happens in one of the seller's working shops; its stock is what can be sold
  const locations = useMyLocations().filter((location) => location.active)
  const [pickedLocation, setPickedLocation] = useState<string | null>(null)
  const locationId = pickedLocation ?? (locations.length === 1 ? locations[0].id : null)
  const [nextProductId, setNextProductId] = useState(2)
  const [downPayment, setDownPayment] = useState<number | null>(null)
  const [paymentDay, setPaymentDay] = useState<number | null>(null)
  const [fulfilment, setFulfilment] = useState<Fulfilment>({ method: 'pickup', address: '' })
  const [pickedCard, setPickedCard] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [calculated, setCalculated] = useState<{ plans: Plan[]; inputs: string } | null>(null)
  const [review, setReview] = useState<{ number: number } | null>(null)
  const me = useActor()
  const scrollIntoView = useCallback(
    (el: HTMLElement | null) => el?.scrollIntoView({ behavior: 'smooth', block: 'end' }),
    [],
  )

  if (!client) return <Navigate to={ROUTES.clients} replace />
  if (!client.limits) return <Navigate to={clientPath(client.id)} replace />

  const cardId = pickedCard ?? (client.cards.length === 1 ? client.cards[0].id : null)
  const limits = client.limits
  // Each row resolved against the catalogue: what it is called, what one costs, how many are left
  const rows = products.map((line) => {
    const product = catalogue.find((item) => item.id === line.productId)
    const needsVariant = !!product && product.variations.length > 0
    const valueIds = line.variant === null ? null : variantIds(line.variant)
    const chosen = product && (needsVariant ? valueIds : [])
    const variant = product && chosen ? names(product, chosen) : []
    return {
      line,
      product,
      needsVariant,
      valueIds: chosen ?? null,
      name: product
        ? variant.length > 0
          ? `${tl(product.name)} (${variant.join(', ')})`
          : tl(product.name)
        : '',
      price: product && chosen ? priceOf(product, chosen) : 0,
      stock: product && chosen ? stockOf(product, chosen, locationId ?? undefined) : 0,
    }
  })
  const summaryOf = (term: Term) =>
    rows
      .filter((row) => row.line.term === term)
      .map((row) => ({
        name: row.name,
        price: row.price,
        quantity: row.line.quantity,
        productId: row.product?.id,
        valueIds: row.valueIds ?? undefined,
      }))
  const total = rows.reduce((sum, row) => sum + row.price * row.line.quantity, 0)
  // One group per term in use. The down payment is shared out by each group's part of the total.
  const groups = TERMS.filter((term) => rows.some((row) => row.line.term === term)).map((term) => {
    const goods = rows
      .filter((row) => row.line.term === term)
      .reduce((sum, row) => sum + row.price * row.line.quantity, 0)
    const down = total > 0 ? Math.round(((downPayment ?? 0) * goods) / total) : 0
    return { term, goods, down, financed: Math.max(0, goods - down) }
  })
  // Each term has its own limit, so mixed terms are measured as shares of their limits
  const limitUsed = groups.reduce((share, group) => share + group.financed / limits[group.term], 0)

  // Terms are only valid for the numbers they were calculated from
  const inputs = JSON.stringify([
    products.map((p) => [p.productId, p.variant, p.quantity, p.term]),
    downPayment,
  ])
  const plans = calculated?.inputs === inputs ? calculated.plans : null

  const productsValid = rows.every(
    (row) => row.product && row.valueIds && row.line.quantity <= row.stock,
  )
  // Shown as soon as the numbers stop adding up, without waiting for the button
  const liveError =
    total > 0 && (downPayment ?? 0) >= total
      ? t('error.downPayment')
      : limitUsed > 1
        ? t('checkout.overLimit')
        : undefined
  const submitError =
    total < MIN_APPLICATION_TOTAL
      ? t('error.minTotal', { amount: formatSum(MIN_APPLICATION_TOTAL) })
      : undefined
  const formError = liveError ?? (submitted ? submitError : undefined)

  const updateProduct = (productId: number, patch: Partial<Line>) =>
    setProducts((list) =>
      list.map((product) => (product.id === productId ? { ...product, ...patch } : product)),
    )

  const addProduct = () => {
    setProducts((list) => [...list, emptyProduct(nextProductId, startTerm)])
    setNextProductId((n) => n + 1)
  }

  const backToClient = () => navigate(clientPath(client.id), { replace: true })

  const submitForm = async () => {
    setSubmitted(true)
    if (
      !locationId ||
      !productsValid ||
      liveError ||
      submitError ||
      paymentDay === null ||
      !cardId ||
      !fulfilmentValid(fulfilment)
    )
      return
    if (plans) {
      setReview({ number: nextApplicationNumber() })
      return
    }
    setLoading(true)
    const next: Plan[] = []
    for (const group of groups) {
      next.push({ term: group.term, terms: await calculateTerms(group.financed, group.term) })
    }
    setCalculated({ plans: next, inputs })
    setLoading(false)
  }

  const confirm = async () => {
    if (!plans || !review) return
    setLoading(true)
    for (const [i, plan] of plans.entries()) {
      const group = groups.find((item) => item.term === plan.term)
      if (!group) continue
      await createApplication(
        client.id,
        {
          id: review.number + i,
          goodsTotal: group.goods,
          installmentTotal: plan.terms.installmentTotal,
          locationId: locationId ?? undefined,
          details: {
            products: summaryOf(plan.term),
            downPayment: group.down,
            paymentDay: paymentDay ?? 1,
            term: plan.term,
            markupPercent: plan.terms.markupPercent,
            monthlyPayment: plan.terms.monthlyPayment,
            fulfilment: { ...fulfilment, address: fulfilment.address.trim() },
            cardId: cardId ?? undefined,
          },
        },
        me,
      )
    }
    backToClient()
  }

  /** One block per term: its products and its terms. Shown before confirming. */
  const planBlocks = (plans ?? []).map((plan) => (
    <Section
      key={plan.term}
      title={t('term.months', { count: String(plan.term) })}
      hint={
        review && plans && plans.length > 1
          ? t('review.number', {
              number: groupDigits(review.number + plans.indexOf(plan)),
            })
          : undefined
      }
    >
      <ProductsSummary products={summaryOf(plan.term)} />
      <InstallmentTermsCard terms={plan.terms} />
    </Section>
  ))

  if (review && plans) {
    return (
      <FormScreen
        onSubmit={() => void confirm()}
        onBack={() => setReview(null)}
        footer={
          <div className="flex flex-col gap-1">
            <Button variant="ghost" block disabled={loading} onClick={backToClient}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" block loading={loading}>
              {t('review.submit')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-start gap-2">
          <StatusBadge tone="info">{t('application.status.processing')}</StatusBadge>
          <h1 className="text-2xl font-bold">{t('review.title')}</h1>
          <p className="text-ink-muted">
            {plans.length > 1
              ? t('review.several', { count: String(plans.length) })
              : t('review.number', { number: groupDigits(review.number) })}
          </p>
        </div>

        {planBlocks}

        {locations.length > 1 && (
          <InfoList>
            <InfoRow
              label={t('profile.branch')}
              value={tl(
                locations.find((location) => location.id === locationId)?.name ?? {
                  uz: '',
                  ru: '',
                },
              )}
            />
          </InfoList>
        )}

        <Section title={t('contract.payment')}>
          <InfoList>
            <FulfilmentRows
              details={{ fulfilment, cardId: cardId ?? undefined }}
              cards={client.cards}
            />
            <InfoRow label={t('field.downPayment')} value={formatSum(downPayment ?? 0)} />
            <InfoRow label={t('field.paymentDay')} value={String(paymentDay)} />
          </InfoList>
        </Section>
      </FormScreen>
    )
  }

  return (
    <FormScreen
      onSubmit={() => void submitForm()}
      onBack={backToClient}
      footer={
        <div className="flex flex-col gap-3">
          {/* Lives beside the button so it stays visible while the numbers above are edited */}
          {formError && <Alert message={formError} />}
          <Button type="submit" block loading={loading}>
            {t('common.continue')}
          </Button>
        </div>
      }
    >
      <h1 className="text-2xl font-bold">{t('contract.title')}</h1>

      <FulfilmentFields
        fulfilment={fulfilment}
        onFulfilment={setFulfilment}
        showErrors={submitted}
      />

      {locations.length > 1 && (
        <Select
          label={t('profile.branch')}
          options={locations.map((location) => ({
            value: location.id,
            label: tl(location.name),
          }))}
          value={locationId}
          onChange={setPickedLocation}
          hint={t('contract.location.hint')}
          error={submitted && !locationId ? t('error.required') : undefined}
        />
      )}

      <Section title={t('contract.products')} hint={t('contract.products.hint')}>
        {rows.map(({ line, product, needsVariant, valueIds, price, stock }, index) => (
          <div key={line.id} className="flex flex-col gap-3 rounded-card bg-surface p-4">
            <div className="flex min-h-10 items-center justify-between">
              <p className="font-semibold">{t('contract.product', { n: String(index + 1) })}</p>
              {products.length > 1 && (
                <button
                  type="button"
                  aria-label={t('contract.products.remove')}
                  onClick={() => setProducts((list) => list.filter((p) => p.id !== line.id))}
                  className="-mr-2 grid size-10 place-items-center rounded-full text-danger active:bg-danger-soft"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            <Select
              label={t('contract.pickProduct')}
              options={catalogue.map((item) => ({ value: item.id, label: tl(item.name) }))}
              value={line.productId}
              onChange={(productId) => updateProduct(line.id, { productId, variant: null })}
              error={submitted && !product ? t('error.required') : undefined}
            />
            {product && needsVariant && (
              <Select
                label={t('contract.pickVariant')}
                options={soldCombos(product).map((combo) => ({
                  value: variantKey(combo),
                  label: names(product, combo).join(' · '),
                }))}
                value={line.variant}
                onChange={(variant) => updateProduct(line.id, { variant })}
                error={submitted && !valueIds ? t('error.required') : undefined}
              />
            )}
            {product && valueIds && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-col">
                    <p className="font-semibold">{formatSum(price * line.quantity)}</p>
                    <p
                      className={cn(
                        'text-sm',
                        stock < line.quantity ? 'text-danger' : 'text-ink-muted',
                      )}
                    >
                      {stock < line.quantity
                        ? t('error.outOfStock')
                        : t('contract.inStock', { count: String(stock) })}
                    </p>
                  </div>
                  <QuantityStepper
                    size="sm"
                    label={t('field.quantity')}
                    value={line.quantity}
                    max={Math.max(1, stock)}
                    onChange={(quantity) => updateProduct(line.id, { quantity })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <TermPicker
                    inset
                    terms={TERMS}
                    value={line.term}
                    onChange={(term) => updateProduct(line.id, { term })}
                  />
                  <p className="text-sm text-ink-muted">
                    {t('cart.limit', { amount: formatSum(limits[line.term]) })}
                  </p>
                </div>
              </>
            )}
          </div>
        ))}
        <Button variant="secondary" block onClick={addProduct}>
          <Plus size={20} />
          {t('contract.products.add')}
        </Button>
      </Section>

      <Section title={t('contract.payment')} hint={t('contract.payment.hint')}>
        <CardSelect
          cards={client.cards}
          cardId={cardId}
          onCard={setPickedCard}
          showErrors={submitted}
        />
        <NumberField
          label={t('field.downPayment')}
          value={downPayment}
          onChange={setDownPayment}
          suffix={t('common.currency')}
          maxDigits={10}
        />
        <ChoiceGrid
          label={t('field.paymentDay')}
          columns={5}
          options={PAYMENT_DAYS.map((value) => ({ value, label: String(value) }))}
          value={paymentDay}
          onChange={setPaymentDay}
          hint={t('contract.paymentDay.hint')}
          error={submitted && paymentDay === null ? t('error.choose') : undefined}
        />
      </Section>

      {total > 0 && (
        <p className="-mt-3 text-sm text-ink-muted">
          {t('checkout.limitUsedClient', { percent: String(Math.round(limitUsed * 100)) })}
        </p>
      )}

      {plans && (
        <div ref={scrollIntoView} className="flex flex-col gap-7">
          {plans.map((plan) => (
            <Section
              key={plan.term}
              title={`${t('contract.conditions')} · ${t('term.months', { count: String(plan.term) })}`}
            >
              <InstallmentTermsCard terms={plan.terms} />
            </Section>
          ))}
        </div>
      )}
    </FormScreen>
  )
}
