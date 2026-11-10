import { locationsStore } from './locations'
import { currentStaffId, staffStore } from './staff'

/** The shops the signed-in staff member is assigned to, in the merchant's order. */
export function useMyLocations() {
  const me = staffStore.useAll().find((member) => member.id === currentStaffId())
  return locationsStore.useAll().filter((location) => me?.locationIds.includes(location.id))
}
