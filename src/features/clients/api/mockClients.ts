// Stand-in for the real client API.
// - Any 6-digit code works except "000000".
// - MyID always succeeds: the face capture after a short wait, the QR route after a few seconds.
// - The real service will return the client's name, photo and passport dates from MyID;
//   here fixed invented values are used.
// - Limits are made up: five times the monthly income, lower for the shortest terms.

import {
  TERMS,
  type Application,
  type Client,
  type Contact,
  type MaritalStatus,
  type PaymentCard,
  type Term,
} from '@/entities/clients/clients'
import { clientsStore } from '@/entities/clients/clientsStore'
import { mockPortrait } from '@/shared/lib/mockPortrait'
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
    photoUrl: mockPortrait({
      hair: 'long',
      hairColor: '#1e1e1e',
      skin: '#e0ac82',
      shirt: '#3c6479',
      background: '#e7f4cd',
    }),
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

export async function calculateLimit(clientId: string) {
  await delay(1500)
  const client = clientsStore.get(clientId)
  if (!client) return
  const share: Record<Term, number> = { 3: 0.6, 6: 0.8, 9: 0.9, 12: 1, 18: 1, 24: 1 }
  const limits = Object.fromEntries(
    TERMS.map((term) => [term, Math.round(client.monthlyIncome * 5 * share[term])]),
  ) as Record<Term, number>
  clientsStore.update(clientId, { limits })
}

/** Works out the installment terms for the amount being financed. */
export async function calculateTerms(financed: number, term: Term): Promise<InstallmentTerms> {
  await delay(700)
  return installmentTerms(financed, term)
}

/** The number the next application will get. The real one is issued by the backend. */
export function nextApplicationNumber() {
  const numbers = clientsStore.getAll().flatMap((c) => c.applications.map((a) => a.id))
  return Math.max(252476, ...numbers) + 1
}

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
