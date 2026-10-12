// Stand-in for the real client API.
// - Any 6-digit code works except "000000".
// - MyID always succeeds: the face capture after a short wait, the QR route after a few seconds.
// - The real service will return the client's name, photo and passport dates from MyID;
//   here fixed invented values are used.

import {
  type Application,
  type Client,
  type Contact,
  type MaritalStatus,
  type PaymentCard,
  type Term,
} from '@/entities/clients/clients'
import { clientsStore } from '@/entities/clients/clientsStore'
import { installmentTerms, type InstallmentTerms } from '@/entities/clients/installment'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const newId = () => String(Date.now())

async function checkCode(code: string) {
  await delay(700)
  if (code === '000000') throw new Error('invalid_code')
}

const toCard = (cardNumber: string): PaymentCard => ({
  id: newId(),
  first4: cardNumber.slice(0, 4),
  last4: cardNumber.slice(-4),
})

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

export async function sendCardCode(_cardNumber: string, _expiry: string) {
  await delay(700)
}

export const verifyCardCode = (_cardNumber: string, code: string) => checkCode(code)

export type NewClient = {
  phone: string
  passport: string
  birthDate: Date
  maritalStatus: MaritalStatus
  monthlyIncome: number
  cardNumber: string
  cardExpiry: string
}

export async function createClient({ cardNumber, cardExpiry: _expiry, ...data }: NewClient) {
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
    cards: [toCard(cardNumber)],
    contacts: [],
    applications: [],
  }
  clientsStore.add(client)
  return client
}

export async function addCard(clientId: string, cardNumber: string) {
  await delay(400)
  const client = clientsStore.get(clientId)
  if (client) clientsStore.update(clientId, { cards: [...client.cards, toCard(cardNumber)] })
}

export async function addContact(clientId: string, contact: Omit<Contact, 'id'>) {
  await delay(400)
  const client = clientsStore.get(clientId)
  if (client) {
    clientsStore.update(clientId, { contacts: [...client.contacts, { ...contact, id: newId() }] })
  }
}

export { calculateLimit } from '@/entities/clients/limitsApi'

/** Works out the installment terms for the amount being financed. */
export async function calculateTerms(financed: number, term: Term): Promise<InstallmentTerms> {
  await delay(700)
  return installmentTerms(financed, term)
}

export const nextApplicationNumber = () => clientsStore.nextApplicationNumber()

export async function createApplication(
  clientId: string,
  application: Pick<Application, 'id' | 'goodsTotal' | 'installmentTotal' | 'details'>,
) {
  await delay(700)
  const client = clientsStore.get(clientId)
  if (!client) return
  const created: Application = { ...application, date: new Date(), status: 'processing' }
  clientsStore.update(clientId, { applications: [created, ...client.applications] })
}
