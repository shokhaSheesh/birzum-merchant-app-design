import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { cartStore, useCart } from '@/entities/cart/cartStore'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import { getProduct } from '@/entities/catalog/products'
import { TERMS, type Term } from '@/entities/clients/clients'
import { installmentTerms } from '@/entities/clients/installment'
import { useCustomer } from '@/entities/session/customer'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { ChoiceGrid } from '@/shared/ui/ChoiceGrid'
import { InstallmentTermsCard } from '@/shared/ui/InstallmentTermsCard'

export function ProductPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const product = getProduct(id)
  const customer = useCustomer()
  const { lines } = useCart()
  const [term, setTerm] = useState<Term>(12)

  if (!product) return <Navigate to={ROUTES.customerCatalog} replace />
  const inCart = lines.some((line) => line.product.id === product.id)
  const hasLimit = !!customer?.limits

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t('common.back')}
          className="-ml-2 grid size-10 place-items-center rounded-full text-brand active:bg-surface"
        >
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-4">
        <ProductPicture category={product.category} className="aspect-[1/0.8]! rounded-card" />
        <div className="flex flex-col gap-1">
          <p className="text-sm text-ink-muted">{product.store}</p>
          <h1 className="text-xl leading-tight font-bold">{product.name}</h1>
          <p className="text-ink-muted">
            {t('product.price')}:{' '}
            <span className="font-bold text-ink">{formatSum(product.price)}</span>
          </p>
        </div>
        <ChoiceGrid
          label={t('cart.term')}
          columns={6}
          options={TERMS.map((value) => ({
            value,
            label: String(value),
            description: t('common.months'),
          }))}
          value={term}
          onChange={setTerm}
        />
        <InstallmentTermsCard terms={installmentTerms(product.price, term)} />
      </div>

      <footer className="flex shrink-0 flex-col gap-3 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {!hasLimit && <Alert message={t('product.needLimit')} />}
        {inCart ? (
          <Button variant="secondary" block onClick={() => navigate(ROUTES.customerCart)}>
            <ShoppingCart size={20} />
            {t('product.inCart')}
          </Button>
        ) : (
          <Button block disabled={!hasLimit} onClick={() => cartStore.add(product.id)}>
            <ShoppingCart size={20} />
            {t('product.addToCart')}
          </Button>
        )}
      </footer>
    </div>
  )
}
