import { useSyncExternalStore } from 'react'

// Products the shopper liked, kept in memory. A page refresh clears them.
let ids: string[] = []
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function toggleFavorite(productId: string) {
  ids = ids.includes(productId) ? ids.filter((id) => id !== productId) : [productId, ...ids]
  listeners.forEach((listener) => listener())
}

/** Liked product ids, most recently liked first. */
export const useFavorites = () => useSyncExternalStore(subscribe, () => ids)
