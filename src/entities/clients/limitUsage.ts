import type { Client, Term } from './clients'
import { paymentSchedule } from './payments'

/**
 * How much of the limit the client's open purchases take. Each term has its own limit, so a
 * purchase uses a share of the limit of its term; the shares add up. Running purchases count
 * only what is still unpaid. Mock rule; the backend will decide.
 */
export function usedShare(client: Client) {
  const limits = client.limits
  if (!limits) return 0
  return Math.min(
    1,
    client.applications.reduce((share, application) => {
      const details = application.details
      if (!details) return share
      const open =
        application.status === 'pending' ||
        application.status === 'creating' ||
        application.status === 'processing' ||
        application.status === 'received'
      const running = application.status === 'handed'
      if (!open && !running) return share
      const financed = application.goodsTotal - details.downPayment
      const left = running
        ? paymentSchedule(application).filter((payment) => payment.state !== 'paid').length /
          details.term
        : 1
      return share + (financed * left) / limits[details.term]
    }, 0),
  )
}

/** What the client can still spend at one term. */
export const availableLimit = (client: Client, term: Term) =>
  client.limits ? Math.max(0, Math.round(client.limits[term] * (1 - usedShare(client)))) : 0
