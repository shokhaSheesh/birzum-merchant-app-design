import { TERMS, type Application, type ApplicationStatus, type Client } from './clients'
import { installmentTerms } from './installment'

// Fills the last few weeks with invented applications so the home screen has something to
// chart. Dates are relative to today; everything else is fixed by the seed, so the same
// data appears on every load. Replace with the API.

const DAYS_BACK = 45
const FIRST_NUMBER = 260_000

const CATALOG = [
  { name: 'Samsung Galaxy A55, 256 GB', price: 5_500_000, productId: 'p1' },
  { name: 'Artel konditsioner 12', price: 6_000_000, productId: 'p7' },
  { name: 'LG kir yuvish mashinasi', price: 6_900_000, productId: 'p3' },
  { name: 'Televizor 43', price: 4_200_000, productId: 'p2' },
  { name: 'Xiaomi Redmi Note 13', price: 3_400_000, productId: 'p5' },
  { name: 'Lenovo IdeaPad noutbuk', price: 8_400_000, productId: 'p4' },
  { name: 'Televizor 55 Smart', price: 7_800_000, productId: 'p6' },
  { name: 'HP 15 noutbuk', price: 7_200_000, productId: 'p8' },
]

// Which shop and which reject reason a generated application gets, by its number
const LOCATIONS = ['l1', 'l2', 'l1', 'l3', 'l2']
const ADDRESSES = [
  'Toshkent, Mirzo Ulugʻbek tumani, Buyuk Ipak Yoʻli 45, 12-xonadon',
  'Toshkent, Sergeli tumani, Yangi Sergeli 7, 31-xonadon',
]
const REASONS = ['unverified', 'limit', 'noStock', 'clientDeclined'] as const

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
              fulfilment:
                number % 3 === 0
                  ? { method: 'delivery', address: ADDRESSES[number % ADDRESSES.length] }
                  : { method: 'pickup', address: '' },
            },
          }
        : { id: number, date, status, goodsTotal: 0, installmentTotal: 0 }
      application.locationId = LOCATIONS[number % LOCATIONS.length]
      if (status === 'rejected') {
        application.rejection = { reason: REASONS[number % REASONS.length], comment: '' }
      }

      generated.set(client.id, [application, ...(generated.get(client.id) ?? [])])
    }
  }

  return clients.map((client) => ({
    ...client,
    applications: [
      ...(generated.get(client.id) ?? []),
      // The hand-written ones belong to the first shop
      ...client.applications.map((application): Application => ({
        locationId: 'l1',
        rejection:
          application.status === 'rejected' ? { reason: 'unverified', comment: '' } : undefined,
        ...application,
      })),
    ].map((application): Application => ({
      ...application,
      // Every drawn-up application says how the goods are received and which card pays
      details: application.details && {
        fulfilment: { method: 'pickup', address: '' },
        cardId: client.cards[0]?.id,
        ...application.details,
      },
    })),
  }))
}
