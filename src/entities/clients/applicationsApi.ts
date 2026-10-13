import { takeStock } from '@/entities/catalog/products'
import type { ApplicationDetails, ApplicationProduct, Rejection, Term } from './clients'
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
  checkout: Pick<ApplicationDetails, 'fulfilment' | 'cardId'>,
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
        // Until the shopper picks a shop at checkout, orders go to the first one
        locationId: 'l1',
        goodsTotal: total,
        installmentTotal: terms.installmentTotal,
        details: {
          products,
          downPayment: 0,
          paymentDay: 5,
          term,
          markupPercent: terms.markupPercent,
          monthlyPayment: terms.monthlyPayment,
          ...checkout,
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
  const application = find(number)
  takeStockFor(application?.details?.products ?? [], application?.locationId)
  clientsStore.updateApplication(number, { status: 'processing' })
}

export async function rejectApplication(number: number, rejection: Rejection) {
  await delay(600)
  clientsStore.updateApplication(number, { status: 'rejected', rejection })
}

/** Marks the goods as given to the client. Payments run from here. */
export async function handOverApplication(number: number) {
  await delay(700)
  clientsStore.updateApplication(number, { status: 'handed' })
}

const find = (number: number) =>
  clientsStore
    .getAll()
    .flatMap((client) => client.applications)
    .find((application) => application.id === number)

/** Takes every catalogue line of an application out of stock. */
export function takeStockFor(products: ApplicationProduct[], locationId?: string) {
  for (const line of products) {
    if (line.productId) takeStock(line.productId, line.valueIds ?? [], line.quantity, locationId)
  }
}
