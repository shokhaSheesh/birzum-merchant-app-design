import { TERMS, type Application, type ApplicationStatus, type Client } from './clients'
import { installmentTerms } from './installment'

// Fills the last few weeks with invented applications so the home screen has something to
// chart. Dates are relative to today; everything else is fixed by the seed, so the same
// data appears on every load. Replace with the API.

const DAYS_BACK = 45
const FIRST_NUMBER = 260_000

const CATALOG = [
  { name: 'Samsung Galaxy A55, 256 GB', price: 5_500_000 },
  { name: 'Artel konditsioner 12', price: 6_000_000 },
  { name: 'LG kir yuvish mashinasi', price: 6_900_000 },
  { name: 'Televizor 43', price: 4_200_000 },
  { name: 'Muzlatkich', price: 4_000_000 },
  { name: 'Lenovo IdeaPad noutbuk', price: 8_400_000 },
  { name: 'Changyutgich', price: 1_900_000 },
  { name: 'Gaz plita', price: 3_100_000 },
]

/** Small deterministic random number generator (mulberry32). */
function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickStatus(roll: number, recent: boolean): ApplicationStatus {
  if (recent && roll > 0.8) return 'processing'
  if (roll < 0.4) return 'handed'
  if (roll < 0.55) return 'closed'
  if (roll < 0.85) return 'rejected'
  return 'cancelled'
}

export function withGeneratedApplications(clients: Client[]): Client[] {
  const random = createRandom(20261012)
  const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)]
  const today = new Date()
  const generated = new Map<string, Application[]>()
  let number = FIRST_NUMBER

  // Oldest day first, so numbers rise with time like real ones
  for (let daysAgo = DAYS_BACK; daysAgo >= 0; daysAgo--) {
    const isToday = daysAgo === 0
    // Today always has a few, all earlier than now, so the first screen is never empty
    const perDay = isToday ? 3 : Math.floor(random() * 4)
    const minutesNow = today.getHours() * 60 + today.getMinutes()
    const times = Array.from({ length: perDay }, () =>
      isToday ? Math.floor(random() * minutesNow) : 9 * 60 + Math.floor(random() * 11 * 60),
    ).sort((a, b) => a - b)

    for (const [index, minutes] of times.entries()) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo)
      date.setMinutes(minutes)

      const client = pick(clients)
      const product = pick(CATALOG)
      // The latest one today is still being drawn up
      const roll = random()
      const status = isToday && index === perDay - 1 ? 'processing' : pickStatus(roll, daysAgo <= 1)
      const terms = installmentTerms(product.price, pick(TERMS))
      const formalised = status === 'closed' || status === 'handed' || status === 'processing'
      number += 1 + Math.floor(random() * 4)

      const application: Application = formalised
        ? {
            id: number,
            date,
            status,
            goodsTotal: product.price,
            installmentTotal: terms.installmentTotal,
            contractNumber:
              status === 'closed' || status === 'handed'
                ? `B-${number - FIRST_NUMBER + 37_100}/${String(date.getFullYear()).slice(2)}`
                : undefined,
            details: {
              products: [{ ...product, quantity: 1 }],
              downPayment: 0,
              paymentDay: 1 + Math.floor(random() * 10),
              term: terms.term,
              markupPercent: terms.markupPercent,
              monthlyPayment: terms.monthlyPayment,
            },
          }
        : { id: number, date, status, goodsTotal: 0, installmentTotal: 0 }

      generated.set(client.id, [application, ...(generated.get(client.id) ?? [])])
    }
  }

  return clients.map((client) => ({
    ...client,
    applications: [...(generated.get(client.id) ?? []), ...client.applications],
  }))
}
