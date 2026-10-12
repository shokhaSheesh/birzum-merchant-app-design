// Stand-in for the shopper's auth API. There is one entry for sign-in and sign-up:
// the backend decides which it is from the phone number.
// - Any 6-digit code works except "000000".
// - A phone number that belongs to one of the sample clients counts as already registered.
// - The QR code is "found" after a few seconds, and the face check always succeeds
//   and returns the same invented name.

import { clientsStore } from '@/entities/clients/clientsStore'
import type { MaritalStatus } from '@/entities/clients/clients'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const QR_SCAN_MOCK_MS = 3500

export async function sendCustomerCode(_phone: string) {
  await delay(700)
}

/** Rejects on a wrong code. Resolves with whether this number already has an account. */
export async function verifyCustomerCode(phone: string, code: string) {
  await delay(700)
  if (code === '000000') throw new Error('invalid_code')
  const client = clientsStore.getAll().find((c) => c.phone === phone)
  return { registered: !!client, clientId: client?.id }
}

export type CustomerDetails = {
  passport: string
  birthDate: Date
  maritalStatus: MaritalStatus
  monthlyIncome: number
}

export async function registerCustomer(_phone: string, _details: CustomerDetails) {
  await delay(700)
}

/** Checks the captured face against MyID, which answers with the person's full name. */
export async function verifyCustomerFace() {
  await delay(1800)
  return { fullName: 'Tursunova Aziza Farhod qizi' }
}
