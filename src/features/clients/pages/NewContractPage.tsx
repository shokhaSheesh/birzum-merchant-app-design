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
import { QuantityField } from '@/shared/ui/QuantityField'
import { Section } from '@/shared/ui/Section'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { TermPicker } from '@/shared/ui/TermPicker'
import { Select } from '@/shared/ui/Select'
import { calculateTerms, createApplication, nextApplicationNumber } from '../api/mockClients'
import { InstallmentTermsCard } from '@/shared/ui/InstallmentTermsCard'
import { TERMS, type Term } from '@/entities/clients/clients'
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

/** A row of the form: which catalogue product, which of its variants (by key), and how many. */
type Line = { id: number; productId: string | null; variant: string | null; quantity: number }

const PAYMENT_DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const emptyProduct = (id: number): Line => ({ id, productId: null, variant: null, quantity: 1 })

/**
 * New installment contract for a client. The form collects term, products, down payment
 * and payment day; "Davom etish" first reveals the installment terms, then opens a review
 * step, and confirming the review creates the application.
 */
export function NewContractPage() {
  const { t, tl } = useI18n()
  const { names } = useVariantNames()
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const client = useClient(id)

  const requestedTerm = Number(searchParams.get('term')) as Term
  const [term, setTerm] = useState<Term>(TERMS.includes(requestedTerm) ? requestedTerm : 12)
  const [products, setProducts] = useState<Line[]>([emptyProduct(1)])
  const catalogue = productsStore
    .useAll()
    .filter((product) => product.storeId === OWN_STORE_ID && product.active)
  const [nextProductId, setNextProductId] = useState(2)
  const [downPayment, setDownPayment] = useState<number | null>(null)
  const [paymentDay, setPaymentDay] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [calculated, setCalculated] = useState<{ terms: InstallmentTerms; inputs: string } | null>(
    null,
  )
  const [review, setReview] = useState<{ number: number } | null>(null)
  const scrollIntoView = useCallback(
    (el: HTMLElement | null) => el?.scrollIntoView({ behavior: 'smooth', block: 'end' }),
    [],
  )

  if (!client) return <Navigate to={ROUTES.clients} replace />
  if (!client.limits) return <Navigate to={clientPath(client.id)} replace />

  const limit = client.limits[term]
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
      stock: product && chosen ? stockOf(product, chosen) : 0,
    }
  })
  const summary = rows.map((row) => ({
    name: row.name,
    price: row.price,
    quantity: row.line.quantity,
    productId: row.product?.id,
    valueIds: row.valueIds ?? undefined,
  }))
  const total = rows.reduce((sum, row) => sum + row.price * row.line.quantity, 0)
  const financed = Math.max(0, total - (downPayment ?? 0))

  // Terms are only valid for the numbers they were calculated from
  const inputs = JSON.stringify([
    term,
    products.map((p) => [p.productId, p.variant, p.quantity]),
    downPayment,
  ])
  const terms = calculated?.inputs === inputs ? calculated.terms : null

  const productsValid = rows.every(
    (row) => row.product && row.valueIds && row.line.quantity <= row.stock,
  )
  // Shown as soon as the numbers stop adding up, without waiting for the button
  const liveError =
    total > 0 && (downPayment ?? 0) >= total
      ? t('error.downPayment')
      : financed > limit
        ? t('error.overLimit', { limit: formatSum(limit) })
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
    setProducts((list) => [...list, emptyProduct(nextProductId)])
    setNextProductId((n) => n + 1)
  }

  const backToClient = () => navigate(clientPath(client.id), { replace: true })

  const submitForm = async () => {
    setSubmitted(true)
    if (!productsValid || liveError || submitError || paymentDay === null) return
    if (terms) {
      setReview({ number: nextApplicationNumber() })
      return
    }
    setLoading(true)
    setCalculated({ terms: await calculateTerms(financed, term), inputs })
    setLoading(false)
  }

  const confirm = async () => {
    if (!terms || !review) return
    setLoading(true)
    await createApplication(client.id, {
      id: review.number,
      goodsTotal: total,
      installmentTotal: terms.installmentTotal,
      details: {
        products: summary,
        downPayment: downPayment ?? 0,
        paymentDay: paymentDay ?? 1,
        term: terms.term,
        markupPercent: terms.markupPercent,
        monthlyPayment: terms.monthlyPayment,
      },
    })
    backToClient()
  }

  if (review && terms) {
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
            {t('review.number', { number: groupDigits(review.number) })}
          </p>
        </div>

        <Section title={t('contract.products')}>
          <ProductsSummary products={summary} />
        </Section>

        <Section title={t('contract.payment')}>
          <InfoList>
            <InfoRow label={t('field.downPayment')} value={formatSum(downPayment ?? 0)} />
            <InfoRow label={t('field.paymentDay')} value={String(paymentDay)} />
          </InfoList>
        </Section>

        <Section title={t('contract.conditions')}>
          <InstallmentTermsCard terms={terms} />
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

      <Section title={t('contract.terms')}>
        <TermPicker terms={TERMS} value={term} onChange={setTerm} />
        <p className="text-sm text-ink-muted">{t('cart.limit', { amount: formatSum(limit) })}</p>
      </Section>

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
                <QuantityField
                  label={t('field.quantity')}
                  value={line.quantity}
                  max={Math.max(1, stock)}
                  onChange={(quantity) => updateProduct(line.id, { quantity })}
                />
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
                <div className="flex items-baseline justify-between border-t border-line pt-3">
                  <p className="text-sm text-ink-muted">
                    {formatSum(price)} × {line.quantity}
                  </p>
                  <p className="font-semibold">{formatSum(price * line.quantity)}</p>
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

      {terms && (
        <div ref={scrollIntoView}>
          <Section title={t('contract.conditions')}>
            <InstallmentTermsCard terms={terms} />
          </Section>
        </div>
      )}
    </FormScreen>
  )
}
