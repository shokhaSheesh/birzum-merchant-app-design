import { Check, ChevronRight, Share2, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { cartKey, cartStore, useCart } from '@/entities/cart/cartStore'
import {
  getProduct,
  getStore,
  galleryOf,
  priceOf,
  soldCombos,
  stockOf,
  useCatalog,
  variantKey,
  type Product,
} from '@/entities/catalog/products'
import { useVariantNames } from '@/entities/catalog/useVariantNames'
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
import { PageHeader } from '@/shared/ui/PageHeader'
import { QuantityStepper } from '@/shared/ui/QuantityField'
import { Section } from '@/shared/ui/Section'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { TermPicker } from '@/shared/ui/TermPicker'
import { LikeButton } from '../components/LikeButton'
import { ProductCard } from '../components/ProductCard'
import { ProductGallery } from '../components/ProductGallery'
import { usePickupPoints } from '@/entities/merchant/usePickupPoints'
import { StoreLogo } from '../components/StoreLogo'
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
  const { t, tl, lang } = useI18n()
  const pickupPoints = usePickupPoints()
  const navigate = useNavigate()
  const customer = useCustomer()
  const { lines } = useCart()
  const { attributes, color: colorOf } = useVariantNames()
  const [term, setTerm] = useState<Term>(12)
  const [copied, setCopied] = useState(false)
  const combos = soldCombos(product)
  /** The chosen value of each variation, by position. Always a combination that is sold. */
  const [picked, setPicked] = useState<string[]>(() => combos[0] ?? [])

  const isSold = (valueIds: string[]) => variantKey(valueIds) in product.variants
  const swap = (index: number, valueId: string) =>
    picked.map((current, at) => (at === index ? valueId : current))

  /** Picks a value; if it is not sold with the other choices, moves to a combination that has it. */
  const pick = (index: number, valueId: string) => {
    const wanted = swap(index, valueId)
    const next = isSold(wanted) ? wanted : combos.find((combo) => combo[index] === valueId)
    if (next) setPicked(next)
  }

  /** Opens the phone's share sheet; where there is none, copies the link instead. */
  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: tl(product.name), url })
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
  const unitPrice = priceOf(product, picked)
  const color = colorOf(product, picked)
  const line = lines.find((l) => l.key === cartKey(product.id, picked))
  const hasLimit = !!customer?.limits
  const stock = stockOf(product, picked)
  const inStock = stock > 0
  const points = pickupPoints(product.storeId)
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
        <ProductGallery
          key={variantKey(picked)}
          images={galleryOf(product, lang, picked)}
          category={product.category}
          color={color}
        />

        <div className="flex flex-col items-start gap-2">
          <StatusBadge tone={inStock ? 'success' : 'danger'}>
            {inStock ? t('product.stock.in', { count: String(stock) }) : t('product.stock.out')}
          </StatusBadge>
          <h1 className="text-xl leading-tight font-bold">{tl(product.name)}</h1>
          <p className="text-2xl font-bold">{formatSum(unitPrice)}</p>
        </div>

        {product.variations.map((variation, i) => {
          const attribute = attributes.find((a) => a.id === variation.attributeId)
          return (
            attribute && (
              <VariationPicker
                key={variation.attributeId}
                attribute={attribute}
                valueIds={variation.valueIds.filter((valueId) =>
                  combos.some((combo) => combo[i] === valueId),
                )}
                category={product.category}
                value={picked[i]}
                onChange={(valueId) => pick(i, valueId)}
                isAvailable={(valueId) => isSold(swap(i, valueId))}
                imageOf={(valueId) => product.valueImages[valueId]?.[0]}
              />
            )
          )
        })}

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
              <StoreLogo />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate font-semibold">{store.name}</p>
                <StoreRating store={store} />
              </div>
              <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
            </Link>
          </Section>
        )}

        {points.length > 1 && (
          <Section title={t('product.availability')}>
            <ul className="rounded-card bg-surface px-4">
              {points.map((point) => {
                const count = stockOf(product, picked, point.id)
                return (
                  <li
                    key={point.id}
                    className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <p className="font-semibold">{point.name}</p>
                      <p className="text-sm text-ink-muted">{point.address}</p>
                    </div>
                    <StatusBadge tone={count > 0 ? 'success' : 'neutral'}>
                      {count > 0
                        ? t('common.pieces', { count: String(count) })
                        : t('product.stock.out')}
                    </StatusBadge>
                  </li>
                )
              })}
            </ul>
          </Section>
        )}

        {tl(product.description) !== '' && (
          <Section title={t('product.description')}>
            <p className="text-ink-muted">{tl(product.description)}</p>
          </Section>
        )}

        {product.specs.length > 0 && (
          <Section title={t('product.specs')}>
            <InfoList>
              {product.specs.map((spec, i) => (
                <InfoRow key={i} label={tl(spec.label)} value={tl(spec.value)} />
              ))}
            </InfoList>
          </Section>
        )}

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
            onClick={() => cartStore.add(product, picked, unitPrice)}
          >
            <ShoppingCart size={20} />
            {inStock ? t('product.addToCart') : t('product.stock.out')}
          </Button>
        )}
      </footer>
    </div>
  )
}
