import type { ApplicationWithClient } from './useApplications'

export type Payout = {
  id: string
  /** Transfer reference, as it appears on the bank statement. */
  reference: string
  date: Date
  amount: number
  state: 'paid' | 'processing'
  /** The sales the transfer pays for. */
  sales: ApplicationWithClient[]
}

/** What Birzum owes the merchant for one sale: the part the shopper did not pay up front. */
export const payableFor = ({ application }: ApplicationWithClient) =>
  application.goodsTotal - (application.details?.downPayment ?? 0)

const DAY = 24 * 60 * 60 * 1000

/**
 * Birzum pays merchants once a week, on Tuesday, for the goods handed over in the week before.
 * A transfer dated after today is still on its way. Mock rule; the super admin will create the
 * real transfers.
 */
export function payoutsOf(sales: ApplicationWithClient[], today = new Date()): Payout[] {
  const settled = sales.filter(
    ({ application }) => application.status === 'handed' || application.status === 'closed',
  )
  const weeks = new Map<number, ApplicationWithClient[]>()
  for (const sale of settled) {
    const date = sale.application.date
    const monday = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - ((date.getDay() + 6) % 7),
    )
    const key = monday.getTime()
    weeks.set(key, [...(weeks.get(key) ?? []), sale])
  }
  return [...weeks.entries()]
    .map(([monday, items]) => {
      const date = new Date(monday + 8 * DAY + 11 * 60 * 60 * 1000)
      const ymd = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
      return {
        id: String(monday),
        reference: `BZ-${ymd}-${String(items.length * 37 + 100).slice(-3)}`,
        date,
        amount: items.reduce((sum, sale) => sum + payableFor(sale), 0),
        state: (date <= today ? 'paid' : 'processing') as Payout['state'],
        sales: items,
      }
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}
