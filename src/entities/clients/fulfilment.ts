import type { Fulfilment } from './clients'

/** True when the order says where the goods go: nothing more for pickup, an address for delivery. */
export const fulfilmentValid = (fulfilment: Fulfilment) =>
  fulfilment.method === 'pickup' || fulfilment.address.trim() !== ''
