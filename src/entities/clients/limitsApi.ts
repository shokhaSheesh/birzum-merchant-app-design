import { TERMS, type Term } from './clients'
import { clientsStore } from './clientsStore'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Mock limit calculation, used by the merchant for a client and by a shopper for themselves.
 * Limits are made up: five times the monthly income, lower for the shortest terms.
 */
export async function calculateLimit(clientId: string) {
  await delay(1500)
  const client = clientsStore.get(clientId)
  if (!client) return
  const share: Record<Term, number> = { 3: 0.6, 6: 0.8, 9: 0.9, 12: 1, 18: 1, 24: 1 }
  const limits = Object.fromEntries(
    TERMS.map((term) => [term, Math.round(client.monthlyIncome * 5 * share[term])]),
  ) as Record<Term, number>
  clientsStore.update(clientId, { limits })
}
