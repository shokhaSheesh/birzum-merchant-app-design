// Stand-in for the real client API. Any 6-digit code works except "000000".
// The real service will return the client's name from the passport lookup;
// here a fixed invented name is used.

import { addClient, type Client, type MaritalStatus } from '../data/clients'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function sendClientCode(_phone: string) {
  await delay(700)
}

export async function verifyClientCode(_phone: string, code: string) {
  await delay(700)
  if (code === '000000') throw new Error('invalid_code')
}

export type NewClient = {
  phone: string
  passport: string
  birthDate: Date
  maritalStatus: MaritalStatus
  monthlyIncome: number
}

export async function createClient(data: NewClient) {
  await delay(700)
  const client: Client = {
    ...data,
    id: String(Date.now()),
    fullName: 'Aziza Tursunova',
    pinfl: '41503960120092',
  }
  addClient(client)
  return client
}
