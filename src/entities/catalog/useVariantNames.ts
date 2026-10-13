import { useI18n } from '@/shared/i18n/useI18n'
import { attributesStore } from './attributes'
import type { Product } from './products'

/** Turns a product's chosen value ids into what a person reads, in the current language. */
export function useVariantNames() {
  const attributes = attributesStore.useAll()
  const { tl } = useI18n()

  const valueOf = (product: Product, index: number, valueId: string) =>
    attributes
      .find((attribute) => attribute.id === product.variations[index]?.attributeId)
      ?.values.find((value) => value.id === valueId)

  return {
    attributes,
    /** Names of the chosen values, in the product's variation order, e.g. ["Qora", "256 GB"]. */
    names: (product: Product, valueIds: string[]) =>
      valueIds.map((valueId, i) => {
        const value = valueOf(product, i, valueId)
        return value ? tl(value.name) : valueId
      }),
    /** The color of the chosen color value, if the product has a color variation. */
    color: (product: Product, valueIds: string[]) =>
      valueIds.map((valueId, i) => valueOf(product, i, valueId)?.swatch).find(Boolean),
  }
}
