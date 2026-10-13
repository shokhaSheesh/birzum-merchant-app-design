import { Check, ChevronRight, Share2, ShoppingCart, Store as StoreIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { cartKey, cartStore, useCart } from '@/entities/cart/cartStore'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import {
  getProduct,
  getStore,
  stockOf,
  useCatalog,
  type Product,
} from '@/entities/catalog/products'
import { TERMS, type Term } from '@/entities/clients/clients'
import { installmentTerms } from '@/entities/clients/installment'
import { useCustomer } from '@/entities/session/customer'
import { customerStorePath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { InstallmentTermsCard } from '@/shared/ui/InstallmentTermsCard'
import { QuantityStepper } from '@/shared/ui/QuantityField'
import { Section } from '@/shared/ui/Section'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { TermPicker } from '@/shared/ui/TermPicker'
import { LikeButton } from '../components/LikeButton'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ProductCard } from '../components/ProductCard'
import { StoreRating } from '../components/StoreRating'
import { VariationPicker } from '../components/VariationPicker'

export function ProductPage() {
  const { id } = useParams()
  const product = getProduct(id)

  if (!product) return <Navigate to={ROUTES.customerHome} replace />
  // Keyed, so the chosen options start fresh when a similar product is opened
  return <ProductDetails key={product.id} product={product} />
}

function ProductDetails({ product }: { product: Product }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const customer = useCustomer()
  const { lines } = useCart()
  const [term, setTerm] = useState<Term>(12)
  /** The picked option of each variation, by position. */
  const [picked, setPicked] = useState<number[]>(() => product.variations.map(() => 0))
  const [copied, setCopied] = useState(false)

  /** Opens the phone's share sheet; where there is none, copies the link instead. */
  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }
    } catch {
      // The shopper closed the share sheet, or the browser refused: nothing to do
    }
  }

  const store = getStore(product.storeId)
  const options = product.variations.map((variation, i) => variation.options[picked[i]])
  const variant = options.map((option) => option.label)
  const color = options.find((option) => option.swatch)?.swatch
  const unitPrice = product.price + options.reduce((sum, o) => sum + (o.priceDelta ?? 0), 0)
  const line = lines.find((l) => l.key === cartKey(product.id, variant))
  const hasLimit = !!customer?.limits
  const stock = stockOf(product, variant)
  const inStock = stock > 0
  const similar = useCatalog().filter((p) => p.category === product.category && p.id !== product.id)

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        end={
          <>
            <LikeButton productId={product.id} className="active:bg-surface" />
            <button
              type="button"
              aria-label={t('product.share')}
              onClick={() => void share()}
              className="grid size-10 place-items-center rounded-full text-brand active:bg-surface"
            >
              {copied ? <Check size={22} /> : <Share2 size={22} />}
            </button>
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pb-4">
        <ProductPicture
          category={product.category}
          color={color}
          src={product.images[0]}
          className="aspect-[1/0.8]! rounded-card"
        />

        <div className="flex flex-col items-start gap-2">
          <StatusBadge tone={inStock ? 'success' : 'danger'}>
            {inStock ? t('product.stock.in', { count: String(stock) }) : t('product.stock.out')}
          </StatusBadge>
          <h1 className="text-xl leading-tight font-bold">{product.name}</h1>
          <p className="text-2xl font-bold">{formatSum(unitPrice)}</p>
        </div>

        {product.variations.map((variation, i) => (
          <VariationPicker
            key={variation.name}
            variation={variation}
            category={product.category}
            value={picked[i]}
            onChange={(index) => setPicked((list) => list.map((v, at) => (at === i ? index : v)))}
          />
        ))}

        <Section title={t('contract.conditions')}>
          <TermPicker terms={TERMS} value={term} onChange={setTerm} />
          <InstallmentTermsCard terms={installmentTerms(unitPrice, term)} showMarkup={false} />
        </Section>

        {store && (
          <Section title={t('product.store')}>
            <Link
              to={customerStorePath(store.id)}
              className="flex items-center gap-3 rounded-card bg-surface p-4 active:bg-navy-100"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-canvas text-brand">
                <StoreIcon size={22} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate font-semibold">{store.name}</p>
                <StoreRating store={store} />
              </div>
              <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
            </Link>
          </Section>
        )}

        <Section title={t('product.description')}>
          <p className="text-ink-muted">{product.description}</p>
        </Section>

        <Section title={t('product.specs')}>
          <InfoList>
            {product.specs.map(([label, value]) => (
              <InfoRow key={label} label={label} value={value} />
            ))}
          </InfoList>
        </Section>

        {similar.length > 0 && (
          <Section title={t('product.similar')}>
            <div className="-mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-1">
              {similar.map((item) => (
                <div key={item.id} className="w-40 shrink-0 snap-start">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      <footer className="flex shrink-0 flex-col gap-3 border-t border-line px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {!hasLimit && inStock && <Alert message={t('product.needLimit')} />}
        {line ? (
          // Once it is in the cart: change the quantity here, or go to the cart
          <div className="flex gap-3">
            <div className="w-36 shrink-0">
              <QuantityStepper
                label={t('field.quantity')}
                value={line.quantity}
                min={0}
                max={stock}
                onChange={(quantity) => cartStore.setQuantity(line.key, quantity)}
              />
            </div>
            <Button block className="min-w-0 flex-1" onClick={() => navigate(ROUTES.customerCart)}>
              <ShoppingCart size={20} />
              <span className="truncate">{t('product.inCart')}</span>
            </Button>
          </div>
        ) : (
          <Button
            block
            disabled={!hasLimit || !inStock}
            onClick={() => cartStore.add(product, variant, unitPrice, color)}
          >
            <ShoppingCart size={20} />
            {inStock ? t('product.addToCart') : t('product.stock.out')}
          </Button>
        )}
      </footer>
    </div>
  )
}
