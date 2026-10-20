// Stand-in for the real client API.
// - Any 6-digit code works except "000000".
// - MyID always succeeds: the face capture after a short wait, the QR route after a few seconds.
// - The real service will return the client's name, photo and passport dates from MyID;
//   here fixed invented values are used.

import {
  type Actor,
  type Application,
  type Client,
  type Contact,
  type MaritalStatus,
  type Term,
} from '@/entities/clients/clients'
import { BIRZUM, takeStockFor } from '@/entities/clients/applicationsApi'
import { toCard } from '@/entities/clients/cardsApi'
import { clientsStore } from '@/entities/clients/clientsStore'
import { shopperCode } from '@/entities/clients/shopperCode'
import { installmentTerms, type InstallmentTerms } from '@/entities/clients/installment'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const newId = () => String(Date.now())

async function checkCode(code: string) {
  await delay(700)
  if (code === '000000') throw new Error('invalid_code')
}

export async function sendClientCode(_phone: string) {
  await delay(700)
}

export const verifyClientCode = (_phone: string, code: string) => checkCode(code)

/** Checks the captured face against MyID. */
export async function verifyFace() {
  await delay(1800)
}

/** Placeholder link for the QR code. The real one comes from the MyID session. */
export const MYID_QR_URL = 'https://birzum.example/myid/session/demo'
export const MYID_QR_MOCK_WAIT_MS = 8000

export type NewClient = {
  phone: string
  passport: string
  birthDate: Date
  maritalStatus: MaritalStatus
  monthlyIncome: number
  cardNumber: string
  cardExpiry: string
}

export async function createClient({ cardNumber, cardExpiry, ...data }: NewClient) {
  await delay(700)
  const client: Client = {
    ...data,
    id: newId(),
    lastName: 'Tursunova',
    firstName: 'Aziza',
    middleName: 'Farhod qizi',
    pinfl: '41503960120092',
    passportIssuedOn: new Date(2021, 4, 18),
    passportExpiresOn: new Date(2031, 4, 18),
    limits: null,
    cards: [toCard(cardNumber, cardExpiry)],
    contacts: [],
    applications: [],
  }
  clientsStore.add(client)
  return client
}

export async function addContact(clientId: string, contact: Omit<Contact, 'id'>) {
  await delay(400)
  const client = clientsStore.get(clientId)
  if (client) {
    clientsStore.update(clientId, { contacts: [...client.contacts, { ...contact, id: newId() }] })
  }
}

export async function updateContact(clientId: string, contact: Contact) {
  await delay(400)
  const client = clientsStore.get(clientId)
  if (client) {
    clientsStore.update(clientId, {
      contacts: client.contacts.map((item) => (item.id === contact.id ? contact : item)),
    })
  }
}

export function removeContact(clientId: string, contactId: string) {
  const client = clientsStore.get(clientId)
  if (client) {
    clientsStore.update(clientId, {
      contacts: client.contacts.filter((item) => item.id !== contactId),
    })
  }
}

export { addCard, sendCardCode, verifyCardCode } from '@/entities/clients/cardsApi'
export { calculateLimit } from '@/entities/clients/limitsApi'

/** Works out the installment terms for the amount being financed. */
export async function calculateTerms(financed: number, term: Term): Promise<InstallmentTerms> {
  await delay(700)
  return installmentTerms(financed, term)
}

export const nextApplicationNumber = () => clientsStore.nextApplicationNumber()

export async function createApplication(
  clientId: string,
  application: Pick<
    Application,
    'id' | 'goodsTotal' | 'installmentTotal' | 'details' | 'locationId'
  >,
  by: Actor,
) {
  await delay(700)
  const client = clientsStore.get(clientId)
  if (!client) return
  const now = new Date()
  // FlexSoft checked it first (checkApplication); its approval starts the contract
  const created: Application = {
    ...application,
    date: now,
    status: 'processing',
    history: [
      { status: 'checking', at: new Date(now.getTime() - 3000), by },
      { status: 'processing', at: now, by: BIRZUM },
    ],
  }
  takeStockFor(application.details?.products ?? [], application.locationId)
  clientsStore.update(clientId, { applications: [created, ...client.applications] })
}

/**
 * Mock: Birzum's check of an ariza made in the shop, before its contract is drawn up. The
 * real one answers in seconds from the rules, or waits for an admin; here it always approves.
 */
export async function checkApplication() {
  await delay(2800)
  return { approved: true }
}

export const SHOPPER_SCAN_MOCK_MS = 3000

/**
 * Mock: the camera "reads" a shopper's QR code after a few seconds. It finds a shopper who is
 * not a client yet while there is one, then the first sample client, who already is.
 */
export async function scanShopper() {
  await delay(SHOPPER_SCAN_MOCK_MS)
  const all = clientsStore.getAll()
  return all.find((client) => client.listed === false) ?? all[0]
}

/** The shopper with this six-digit code, for when the camera cannot read the screen. */
export async function findShopper(code: string) {
  await delay(600)
  const client = clientsStore.getAll().find((c) => shopperCode(c) === code)
  if (!client) throw new Error('not_found')
  return client
}

/** Puts a shopper into this merchant's clients. */
export async function addToMyClients(id: string) {
  await delay(600)
  clientsStore.update(id, { listed: true })
}
