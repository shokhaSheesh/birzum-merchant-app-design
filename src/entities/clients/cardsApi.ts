// Stand-in for the real card API. Any 6-digit code works except "000000".
import type { PaymentCard } from './clients'
import { clientsStore } from './clientsStore'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const toCard = (cardNumber: string): PaymentCard => ({
  id: String(Date.now()),
  first4: cardNumber.slice(0, 4),
  last4: cardNumber.slice(-4),
})

export async function sendCardCode(_cardNumber: string, _expiry: string) {
  await delay(700)
}

export async function verifyCardCode(_cardNumber: string, code: string) {
  await delay(700)
  if (code === '000000') throw new Error('invalid_code')
}

export async function addCard(clientId: string, cardNumber: string) {
  await delay(400)
  const client = clientsStore.get(clientId)
  if (client) clientsStore.update(clientId, { cards: [...client.cards, toCard(cardNumber)] })
}

export function removeCard(clientId: string, cardId: string) {
  const client = clientsStore.get(clientId)
  if (client) {
    clientsStore.update(clientId, { cards: client.cards.filter((card) => card.id !== cardId) })
  }
}
