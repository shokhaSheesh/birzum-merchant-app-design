import { takeStock } from '@/entities/catalog/products'
import type {
  Actor,
  Application,
  ApplicationDetails,
  ApplicationProduct,
  ApplicationStatus,
  Rejection,
  ReturnReason,
  Term,
} from './clients'
import { shortName } from './clientName'
import { FLEXSOFT, historyOf, SYSTEM } from './history'
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
  checkout: Pick<ApplicationDetails, 'fulfilment' | 'cardId'> & { downPayment?: number },
  /** Which shop the order goes to and, for pickup, which of its filials. */
  shop: { storeId: string; locationId?: string },
) {
  await delay(900)
  const client = clientsStore.get(clientId)
  if (!client) return undefined

  const total = products.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const { downPayment = 0, ...rest } = checkout
  // The down payment is paid at checkout; the nasiya covers the rest
  const terms = installmentTerms(total - downPayment, term)
  const id = clientsStore.nextApplicationNumber()
  clientsStore.update(clientId, {
    // An order makes the shopper one of this merchant's clients
    listed: true,
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
          downPayment,
          paymentDay: 5,
          term,
          markupPercent: terms.markupPercent,
          monthlyPayment: terms.monthlyPayment,
          ...rest,
        },
      },
      ...client.applications,
    ],
  })
  return id
}

/** Mock: how long FlexSoft takes to draw up a contract. In real life minutes, sometimes hours. */
export const FLEXSOFT_CONTRACT_MOCK_MS = 6000

/**
 * The application goes to FlexSoft and waits there as "Shartnoma yaratilmoqda". When FlexSoft
 * answers, the contract has its number and waits for the goods to be handed over.
 */
export function sendToFlexSoft(number: number, by: Actor) {
  move(number, 'creating', by)
  awaitFlexSoftContract(number)
}

/** Mock FlexSoft's answer for an application already in `creating`. */
export function awaitFlexSoftContract(number: number) {
  setTimeout(() => {
    if (find(number)?.status !== 'creating') return
    move(number, 'processing', FLEXSOFT, {
      contractNumber: `B-${number % 100_000}/${String(new Date().getFullYear()).slice(2)}`,
    })
  }, FLEXSOFT_CONTRACT_MOCK_MS)
}

/** Merchant side: the shop has the goods, so it confirms the order and it goes to FlexSoft. */
export async function approveApplication(number: number, by: Actor) {
  await delay(900)
  const application = find(number)
  takeStockFor(application?.details?.products ?? [], application?.locationId)
  sendToFlexSoft(number, by)
}

export async function rejectApplication(number: number, rejection: Rejection, by: Actor) {
  await delay(600)
  move(number, 'rejected', by, { rejection }, rejection.comment)
}

/** Marks the goods as given to the client. The contract gets its number and payments run from here. */
export async function handOverApplication(number: number, by: Actor, photos: string[] = []) {
  await delay(700)
  const application = find(number)
  move(number, 'handed', by, {
    handoverPhotos: photos,
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

/** Sends the client the SMS code that confirms a return. Mock: always sent. */
export async function sendReturnCode(_number: number) {
  await delay(600)
}

/**
 * The shop takes the goods back. The code the client read out from their SMS confirms it, and
 * the contract is cancelled; the down payment is the shop's to give back. Mock: "000000" is wrong.
 */
export async function returnApplication(
  number: number,
  code: string,
  reason: ReturnReason,
  comment: string,
  by: Actor,
) {
  await delay(700)
  if (code === '000000') throw new Error('invalid_code')
  move(
    number,
    'cancelled',
    by,
    { returnReason: reason, cancelComment: comment || undefined },
    comment || undefined,
  )
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
