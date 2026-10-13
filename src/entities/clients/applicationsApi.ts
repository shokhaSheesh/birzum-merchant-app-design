import { takeStock } from '@/entities/catalog/products'
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
  takeStockFor(findProducts(number))
  clientsStore.updateApplication(number, { status: 'processing' })
}

export async function rejectApplication(number: number) {
  await delay(600)
  clientsStore.updateApplication(number, { status: 'rejected' })
}

/** Marks the goods as given to the client. Payments run from here. */
export async function handOverApplication(number: number) {
  await delay(700)
  clientsStore.updateApplication(number, { status: 'handed' })
}

const findProducts = (number: number) =>
  clientsStore
    .getAll()
    .flatMap((client) => client.applications)
    .find((application) => application.id === number)?.details?.products ?? []

/** Takes every catalogue line of an application out of stock. */
export function takeStockFor(products: ApplicationProduct[]) {
  for (const line of products) {
    if (line.productId) takeStock(line.productId, line.valueIds ?? [], line.quantity)
  }
}
