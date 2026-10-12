import type { PaymentCard } from '@/entities/clients/clients'

/** Uzbek card schemes by their number prefix. */
export function cardBrand(card: PaymentCard) {
  if (card.first4.startsWith('9860')) return 'Humo'
  if (card.first4.startsWith('8600') || card.first4.startsWith('5614')) return 'Uzcard'
  return ''
}
