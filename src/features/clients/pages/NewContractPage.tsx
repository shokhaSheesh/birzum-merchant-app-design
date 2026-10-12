import { FileSignature, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { clientPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum, groupDigits } from '@/shared/lib/format'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { ChoiceGrid } from '@/shared/ui/ChoiceGrid'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { NumberField } from '@/shared/ui/NumberField'
import { QuantityField } from '@/shared/ui/QuantityField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { Section } from '@/shared/ui/Section'
import { TextField } from '@/shared/ui/TextField'
import { TERMS, type Term } from '../data/clients'
import { useClient } from '../data/useClients'

type Product = { id: number; name: string; price: number | null; quantity: number }

const MIN_TOTAL = 100_000
const PAYMENT_DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const emptyProduct = (id: number): Product => ({ id, name: '', price: null, quantity: 1 })

/** New installment contract for a client: term, products, down payment and payment day. */
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
  const [done, setDone] = useState(false)

  if (!client) return <Navigate to={ROUTES.clients} replace />
  if (!client.limits) return <Navigate to={clientPath(client.id)} replace />

  const limit = client.limits[term]
  const count = products.reduce((sum, product) => sum + product.quantity, 0)
  const total = products.reduce((sum, product) => sum + (product.price ?? 0) * product.quantity, 0)
  const financed = Math.max(0, total - (downPayment ?? 0))

  const productsValid = products.every((product) => product.name.trim() !== '' && product.price)
  const formError =
    total < MIN_TOTAL
      ? t('error.minTotal', { amount: formatSum(MIN_TOTAL) })
      : (downPayment ?? 0) >= total
        ? t('error.downPayment')
        : financed > limit
          ? t('error.overLimit')
          : undefined

  const updateProduct = (productId: number, patch: Partial<Product>) =>
    setProducts((list) =>
      list.map((product) => (product.id === productId ? { ...product, ...patch } : product)),
    )

  const addProduct = () => {
    setProducts((list) => [...list, emptyProduct(nextProductId)])
    setNextProductId((n) => n + 1)
  }

  const submit = () => {
    setSubmitted(true)
    if (productsValid && !formError && paymentDay !== null) setDone(true)
  }

  if (done) {
    return (
      <FormScreen onSubmit={() => {}} onBack={() => setDone(false)}>
        <IconBadge icon={FileSignature} />
        <ScreenIntro
          title={t('contract.title')}
          subtitle="Keyingi qadam dizayni tasdiqlangach shu yerda yigʻiladi."
        />
      </FormScreen>
    )
  }

  return (
    <FormScreen
      onSubmit={submit}
      onBack={() => navigate(clientPath(client.id))}
      footer={
        <Button type="submit" block>
          {t('common.continue')}
        </Button>
      }
    >
      <h1 className="text-2xl font-bold">{t('contract.title')}</h1>

      <Section title={t('contract.terms')}>
        <ChoiceGrid
          label={t('contract.terms.hint')}
          columns={3}
          options={TERMS.map((value) => ({
            value,
            label: t('term.months', { count: String(value) }),
            description: groupDigits(client.limits?.[value] ?? 0),
          }))}
          value={term}
          onChange={setTerm}
        />
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

      <div className="flex flex-col gap-3">
        <InfoList>
          <InfoRow label={t('client.limit.available')} value={formatSum(limit)} />
          <InfoRow label={t('contract.summary.count')} value={String(count)} />
          <InfoRow label={t('contract.summary.total')} value={formatSum(total)} />
          <InfoRow label={t('contract.summary.financed')} value={formatSum(financed)} />
        </InfoList>
        {submitted && formError && <Alert message={formError} />}
      </div>
    </FormScreen>
  )
}
