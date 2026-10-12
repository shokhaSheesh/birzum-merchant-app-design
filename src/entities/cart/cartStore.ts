import { useSyncExternalStore } from 'react'
import { getProduct, type Product } from '@/entities/catalog/products'

export type CartLine = { product: Product; quantity: number }

// The shopper's cart, kept in memory. A page refresh empties it.
let quantities: Record<string, number> = {}
const listeners = new Set<() => void>()
const change = (next: Record<string, number>) => {
  quantities = next
  listeners.forEach((listener) => listener())
}

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  get: () => quantities,
  add: (productId: string) =>
    change({ ...quantities, [productId]: (quantities[productId] ?? 0) + 1 }),
  setQuantity: (productId: string, quantity: number) =>
    change({ ...quantities, [productId]: quantity }),
  remove(productId: string) {
    const rest = { ...quantities }
    delete rest[productId]
    change(rest)
  },
  clear: () => change({}),
}

export function useCart() {
  const current = useSyncExternalStore(cartStore.subscribe, cartStore.get)
  const lines: CartLine[] = Object.entries(current).flatMap(([productId, quantity]) => {
    const product = getProduct(productId)
    return product ? [{ product, quantity }] : []
  })
  return {
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    total: lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  }
}
