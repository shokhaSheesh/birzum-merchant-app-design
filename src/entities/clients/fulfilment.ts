import type { Fulfilment } from './clients'

/** True when the order says where the goods go: nothing more for pickup, an address for delivery. */
export const fulfilmentValid = (fulfilment: Fulfilment) =>
  fulfilment.method === 'pickup' || fulfilment.address.trim() !== ''

/** The parts of a delivery address after the street, already labelled ("uy 12", "qavat 3"). */
const EXTRAS = ['house', 'apartment', 'entrance', 'floor'] as const

export function addressExtras(
  fulfilment: Fulfilment,
  label: (part: (typeof EXTRAS)[number], value: string) => string,
) {
  return EXTRAS.flatMap((part) => {
    const value = fulfilment[part]?.trim()
    return value ? [label(part, value)] : []
  })
}
