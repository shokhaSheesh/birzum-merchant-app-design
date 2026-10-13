import { getStore, OWN_STORE_ID } from '@/entities/catalog/products'
import { useI18n } from '@/shared/i18n/useI18n'
import { locationsStore } from './locations'

export type PickupPoint = {
  id: string
  name: string
  address: string
  /** Known for the signed-in merchant's filials only. */
  hours?: string
  phone?: string
}

/**
 * Where a shop's goods can be collected. The signed-in merchant's shop has its working
 * filials; the other sample shops have a single one, named after the shop.
 */
export function usePickupPoints() {
  const { tl } = useI18n()
  const locations = locationsStore.useAll()

  return (storeId: string): PickupPoint[] => {
    if (storeId === OWN_STORE_ID) {
      return locations
        .filter((location) => location.active)
        .map((location) => ({
          id: location.id,
          name: tl(location.name),
          address: tl(location.address),
          hours: location.hours,
          phone: location.phone,
        }))
    }
    const store = getStore(storeId)
    return store ? [{ id: `${storeId}-main`, name: store.name, address: store.address }] : []
  }
}
