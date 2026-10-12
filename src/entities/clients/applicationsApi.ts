import type { ApplicationProduct, Term } from './clients'
import { clientsStore } from './clientsStore'
import { installmentTerms } from './installment'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Shopper side: checking out the cart files an application (ariza) that waits for the
 * merchant. It is the same record the merchant works with, in the `pending` status.
 */
export async function submitApplication(
  clientId: string,
  products: ApplicationProduct[],
  term: Term,
) {
  await delay(900)
  const client = clientsStore.get(clientId)
  if (!client) return undefined

  const total = products.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const terms = installmentTerms(total, term)
  const id = clientsStore.nextApplicationNumber()
  clientsStore.update(clientId, {
    applications: [
      {
        id,
        date: new Date(),
        status: 'pending',
        goodsTotal: total,
        installmentTotal: terms.installmentTotal,
        details: {
          products,
          downPayment: 0,
          paymentDay: 5,
          term,
          markupPercent: terms.markupPercent,
          monthlyPayment: terms.monthlyPayment,
        },
      },
      ...client.applications,
    ],
  })
  return id
}

/** Merchant side: accept a shopper's application. It moves on to being drawn up. */
export async function approveApplication(number: number) {
  await delay(900)
  clientsStore.updateApplication(number, { status: 'processing' })
}

export async function rejectApplication(number: number) {
  await delay(600)
  clientsStore.updateApplication(number, { status: 'rejected' })
}
