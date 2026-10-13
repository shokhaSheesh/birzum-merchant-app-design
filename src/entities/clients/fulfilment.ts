import type { Fulfilment } from './clients'

/** True when the order can be sent: an address for delivery, and a card. */
export const fulfilmentValid = (fulfilment: Fulfilment, cardId: string | null) =>
  !!cardId && (fulfilment.method === 'pickup' || fulfilment.address.trim() !== '')
