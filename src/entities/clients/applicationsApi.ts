import { takeStock } from '@/entities/catalog/products'
import type {
  Actor,
  Application,
  ApplicationDetails,
  ApplicationProduct,
  ApplicationStatus,
  Rejection,
  Term,
} from './clients'
import { shortName } from './clientName'
import { historyOf, SYSTEM } from './history'
import { clientsStore } from './clientsStore'
import { paymentSchedule, remainingOf } from './payments'
import { installmentTerms } from './installment'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Moves an application to a status and writes the move into its change log. */
function move(
  number: number,
  status: ApplicationStatus,
  by: Actor,
  patch: Partial<Application> = {},
  comment?: string,
) {
  const application = find(number)
  if (!application) return
  clientsStore.updateApplication(number, {
    ...patch,
    status,
    history: [...historyOf(application), { status, at: new Date(), by, comment }],
  })
}

/**
 * Shopper side: checking out the cart files an application (ariza) that waits for the
 * merchant. It is the same record the merchant works with, in the `pending` status.
 */
export async function submitApplication(
  clientId: string,
  products: ApplicationProduct[],
  term: Term,
  checkout: Pick<ApplicationDetails, 'fulfilment' | 'cardId'>,
  /** Which shop the order goes to and, for pickup, which of its filials. */
  shop: { storeId: string; locationId?: string },
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
        history: [
          {
            status: 'pending',
            at: new Date(),
            by: { kind: 'customer', name: shortName(client) },
          },
        ],
        ...shop,
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
export async function approveApplication(number: number, by: Actor) {
  await delay(900)
  const application = find(number)
  takeStockFor(application?.details?.products ?? [], application?.locationId)
  move(number, 'processing', by)
}

export async function rejectApplication(number: number, rejection: Rejection, by: Actor) {
  await delay(600)
  move(number, 'rejected', by, { rejection }, rejection.comment)
}

/** Marks the goods as given to the client. The contract gets its number and payments run from here. */
export async function handOverApplication(number: number, by: Actor) {
  await delay(700)
  const application = find(number)
  move(number, 'handed', by, {
    // The contract is drawn up at hand-over, if it was not already
    contractNumber:
      application?.contractNumber ??
      `B-${number % 100_000}/${String(new Date().getFullYear()).slice(2)}`,
  })
}

/** Either side withdraws an application, saying why. */
export async function cancelApplication(number: number, comment: string, by: Actor) {
  await delay(500)
  move(number, 'cancelled', by, { cancelComment: comment }, comment)
}

/** Merchant side: mark a running installment as fully paid. */
export function closeApplication(number: number, by: Actor) {
  move(number, 'closed', by)
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

export type PayChoice = { kind: 'next' } | { kind: 'full' } | { kind: 'amount'; amount: number }

/**
 * Shopper side: pay the next installment, close the whole nasiya, or pay an amount ahead,
 * which settles the last payments first. Paying everything that is left closes the nasiya.
 */
export async function payApplication(number: number, choice: PayChoice) {
  await delay(900)
  const application = find(number)
  if (!application) return
  if (choice.kind === 'next') {
    await payNext(application)
    return
  }
  const left = remainingOf(application)
  const amount = choice.kind === 'full' ? left : Math.min(choice.amount, left)
  const patch = {
    prepaid: (application.prepaid ?? 0) + amount,
    prepaidOn: new Date(),
  }
  if (amount >= left) move(number, 'closed', SYSTEM, patch)
  else clientsStore.updateApplication(number, patch)
}

/** Shopper side: pay the next installment. Paying the last one closes the installment. */
export async function payInstallment(number: number) {
  await delay(900)
  const application = find(number)
  if (application) await payNext(application)
}

async function payNext(application: Application) {
  const number = application.id
  const extraPaid = (application.extraPaid ?? 0) + 1
  const paid = { ...application, extraPaid }
  const done = paymentSchedule(paid).every((payment) => payment.state === 'paid')
  const patch = { extraPaid, paidDates: [...(application.paidDates ?? []), new Date()] }
  if (done) move(number, 'closed', SYSTEM, patch)
  else clientsStore.updateApplication(number, patch)
}
