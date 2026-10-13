import type { PaymentCard } from './clients'

/** Uzbek card schemes by their number prefix. */
export function cardBrand(card: PaymentCard) {
  if (card.first4.startsWith('9860')) return 'Humo'
  if (card.first4.startsWith('8600') || card.first4.startsWith('5614')) return 'Uzcard'
  return ''
}

/** A card as one line, e.g. "Humo •••• 1671". */
export function cardLabel(card: PaymentCard) {
  return [cardBrand(card), '••••', card.last4].filter(Boolean).join(' ')
}
