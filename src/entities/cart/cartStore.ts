import { useSyncExternalStore } from 'react'
import { variantKey, type Product } from '@/entities/catalog/products'

export type CartLine = {
  key: string
  product: Product
  /** Value ids of the chosen variant, in the product's variation order. */
  valueIds: string[]
  /** Price of one piece of that variant, in UZS. */
  unitPrice: number
  quantity: number
}

/** The same product in a different variant is a different line. */
export const cartKey = (productId: string, valueIds: string[]) =>
  `${productId}/${variantKey(valueIds)}`

// The shopper's cart, kept in memory. A page refresh empties it.
let lines: CartLine[] = []
const listeners = new Set<() => void>()
const change = (next: CartLine[]) => {
  lines = next
  listeners.forEach((listener) => listener())
}

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  get: () => lines,
  add(product: Product, valueIds: string[], unitPrice: number) {
    const key = cartKey(product.id, valueIds)
    if (lines.some((line) => line.key === key)) return
    change([...lines, { key, product, valueIds, unitPrice, quantity: 1 }])
  },
  /** Setting the quantity to zero removes the line. */
  setQuantity(key: string, quantity: number) {
    change(
      quantity <= 0
        ? lines.filter((line) => line.key !== key)
        : lines.map((line) => (line.key === key ? { ...line, quantity } : line)),
    )
  },
  remove: (key: string) => change(lines.filter((line) => line.key !== key)),
  clear: () => change([]),
}

export function useCart() {
  const current = useSyncExternalStore(cartStore.subscribe, cartStore.get)
  return {
    lines: current,
    count: current.reduce((sum, line) => sum + line.quantity, 0),
    total: current.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
  }
}
