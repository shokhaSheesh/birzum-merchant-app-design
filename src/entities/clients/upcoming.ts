import type { Application, Client } from './clients'
import { paymentSchedule, type Payment } from './payments'

export type Upcoming = { application: Application; payment: Payment; left: number }

/**
 * Across all running purchases: the next payment of each, soonest first, the total still owed
 * and how much of it is overdue. Feeds the payments overview and the card on Asosiy.
 */
export function upcomingPayments(client: Client) {
  const running = client.applications.filter((application) => application.status === 'handed')
  const items: Upcoming[] = []
  let total = 0
  let overdue = 0
  for (const application of running) {
    const open = paymentSchedule(application).filter((payment) => payment.state !== 'paid')
    total += open.reduce((sum, payment) => sum + payment.amount, 0)
    overdue += open
      .filter((payment) => payment.state === 'overdue')
      .reduce((sum, payment) => sum + payment.amount, 0)
    if (open[0]) items.push({ application, payment: open[0], left: open.length })
  }
  items.sort((a, b) => a.payment.dueDate.getTime() - b.payment.dueDate.getTime())
  return { items, total, overdue, next: items[0]?.payment }
}
