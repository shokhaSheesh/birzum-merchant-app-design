import { useState } from 'react'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import {
  OWN_STORE_ID,
  isApproved,
  productsStore,
  soldCombos,
  variantKey,
  type Product,
  photosOf,
} from '@/entities/catalog/products'
import { useVariantNames } from '@/entities/catalog/useVariantNames'
import { locationsStore } from '@/entities/merchant/locations'
import {
  loadAttributes,
  loadLocations,
  loadProducts,
  saveStock,
} from '@/entities/merchant/merchantApi'
import { toastError } from '@/shared/api/client'
import { useRemote } from '@/shared/api/useRemote'
import { useI18n } from '@/shared/i18n/useI18n'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { FilterChips } from '@/shared/ui/FilterChips'
import { PageHeader } from '@/shared/ui/PageHeader'
import { SkeletonCards } from '@/shared/ui/Skeleton'
import { QuantityStepper } from '@/shared/ui/QuantityField'

const MAX_STOCK = 9999

/** Saves the count on the server; the screen shows the old count again if it is refused. */
async function setStock(product: Product, locationId: string, combo: string[], quantity: number) {
  const key = variantKey(combo)
  const before = productsStore.get(product.id)?.stock ?? product.stock
  productsStore.update(product.id, {
    stock: { ...before, [locationId]: { ...before[locationId], [key]: quantity } },
  })
  try {
    await saveStock(product, locationId, combo, quantity)
  } catch (error) {
    toastError(error)
    productsStore.update(product.id, { stock: before })
  }
}

/** Stock on hand, one shop at a time: a count for every product and every variant of it. */
export function InventoryPage() {
  const { t, tl, lang } = useI18n()
  const { names } = useVariantNames()
  const { loading, failed, reload } = useRemote(() =>
    Promise.all([loadLocations(), loadProducts(), loadAttributes()]),
  )
  const locations = locationsStore.useAll()
  const products = productsStore.useAll().filter((product) => product.storeId === OWN_STORE_ID)
  const [chosen, setChosen] = useState(locations[0]?.id ?? '')
  const locationId = locations.some((location) => location.id === chosen)
    ? chosen
    : (locations[0]?.id ?? '')

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('manage.inventory')} />
      {loading ? (
        <div className="px-5 pt-2">
          <SkeletonCards />
        </div>
      ) : failed ? (
        <ErrorState kind={failed} onAction={reload} />
      ) : locations.length === 0 ? (
        <EmptyState title={t('inventory.noLocations')} hint={t('manage.empty.hint')} />
      ) : (
        <>
          <div className="flex shrink-0 flex-col gap-3 px-5 pb-3">
            <p className="text-sm text-ink-muted">{t('inventory.hint')}</p>
            <FilterChips
              label={t('manage.locations')}
              options={locations.map((location) => ({
                value: location.id,
                label: tl(location.name),
              }))}
              value={locationId}
              onChange={setChosen}
            />
          </div>

          <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pt-1 pb-6">
            {products.map((product) => {
              const here = product.stock[locationId] ?? {}
              const combos = soldCombos(product)
              return (
                <li
                  key={product.id}
                  className="flex flex-col gap-1 rounded-card border border-line bg-canvas p-3"
                >
                  <div className="flex items-center gap-3">
                    <ProductPicture
                      category={product.category}
                      src={photosOf(product, lang)[0]}
                      className="w-12 shrink-0 rounded-control"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate font-semibold">{tl(product.name)}</p>
                      <p className="text-sm text-ink-muted">
                        {t('product.totalStock', {
                          count: String(
                            combos.reduce((n, combo) => n + (here[variantKey(combo)] ?? 0), 0),
                          ),
                        })}
                      </p>
                    </div>
                  </div>
                  {!isApproved(product) ? (
                    <p className="border-t border-line pt-2 text-sm text-ink-muted">
                      {t('moderation.stockLocked')}
                    </p>
                  ) : (
                    combos.map((combo) => {
                      const key = variantKey(combo)
                      const name =
                        combo.length > 0 ? names(product, combo).join(' · ') : t('inventory.qty')
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-3 border-t border-line pt-2 first:border-t-0"
                        >
                          <p className="min-w-0 truncate text-sm">{name}</p>
                          <QuantityStepper
                            size="sm"
                            label={`${tl(product.name)}, ${name}`}
                            value={here[key] ?? 0}
                            min={0}
                            max={MAX_STOCK}
                            onChange={(quantity) =>
                              void setStock(product, locationId, combo, quantity)
                            }
                          />
                        </div>
                      )
                    })
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
