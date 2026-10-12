import { Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { clientPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
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
import { TextField } from '@/shared/ui/TextField'
import { calculateTerms, createApplication, nextApplicationNumber } from '../api/mockClients'
import { InstallmentTermsCard } from '@/shared/ui/InstallmentTermsCard'
import { TERMS, type Term } from '@/entities/clients/clients'
import { MIN_APPLICATION_TOTAL, type InstallmentTerms } from '@/entities/clients/installment'
import { ProductsSummary } from '@/entities/clients/ui/ProductsSummary'
import { useClient } from '@/entities/clients/useClients'

type Product = { id: number; name: string; price: number | null; quantity: number }

const PAYMENT_DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const emptyProduct = (id: number): Product => ({ id, name: '', price: null, quantity: 1 })

/**
 * New installment contract for a client. The form collects term, products, down payment
 * and payment day; "Davom etish" first reveals the installment terms, then opens a review
 * step, and confirming the review creates the application.
 */
export function NewContractPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const client = useClient(id)

  const requestedTerm = Number(searchParams.get('term')) as Term
  const [term, setTerm] = useState<Term>(TERMS.includes(requestedTerm) ? requestedTerm : 12)
  const [products, setProducts] = useState<Product[]>([emptyProduct(1)])
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
  const total = products.reduce((sum, product) => sum + (product.price ?? 0) * product.quantity, 0)
  const financed = Math.max(0, total - (downPayment ?? 0))

  // Terms are only valid for the numbers they were calculated from
  const inputs = JSON.stringify([term, products.map((p) => [p.price, p.quantity]), downPayment])
  const terms = calculated?.inputs === inputs ? calculated.terms : null

  const productsValid = products.every((product) => product.name.trim() !== '' && product.price)
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

  const updateProduct = (productId: number, patch: Partial<Product>) =>
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
        products: products.map((p) => ({
          name: p.name.trim(),
          price: p.price ?? 0,
          quantity: p.quantity,
        })),
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
          <ProductsSummary
            products={products.map((p) => ({
              name: p.name,
              price: p.price ?? 0,
              quantity: p.quantity,
            }))}
          />
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
        {products.map((product, index) => (
          <div key={product.id} className="flex flex-col gap-3 rounded-card bg-surface p-4">
            <div className="flex min-h-10 items-center justify-between">
              <p className="font-semibold">{t('contract.product', { n: String(index + 1) })}</p>
              {products.length > 1 && (
                <button
                  type="button"
                  aria-label={t('contract.products.remove')}
                  onClick={() => setProducts((list) => list.filter((p) => p.id !== product.id))}
                  className="-mr-2 grid size-10 place-items-center rounded-full text-danger active:bg-danger-soft"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            <TextField
              label={t('field.productName')}
              autoComplete="off"
              value={product.name}
              onChange={(e) => updateProduct(product.id, { name: e.target.value })}
              error={submitted && product.name.trim() === '' ? t('error.required') : undefined}
            />
            <NumberField
              label={t('field.unitPrice')}
              value={product.price}
              onChange={(price) => updateProduct(product.id, { price })}
              suffix={t('common.currency')}
              maxDigits={10}
              error={submitted && !product.price ? t('error.price') : undefined}
            />
            <QuantityField
              label={t('field.quantity')}
              value={product.quantity}
              onChange={(quantity) => updateProduct(product.id, { quantity })}
            />
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <p className="text-sm text-ink-muted">{t('contract.lineTotal')}</p>
              <p className="font-semibold">{formatSum((product.price ?? 0) * product.quantity)}</p>
            </div>
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
