// Stand-in for the real client API.
// - Any 6-digit code works except "000000".
// - MyID always succeeds: the face capture after a short wait, the QR route after a few seconds.
// - The real service will return the client's name from MyID; here a fixed invented name is used.

import { addClient, type Client, type MaritalStatus } from '../data/clients'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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

export async function createClient(data: NewClient) {
  await delay(700)
  const client: Client = {
    id: String(Date.now()),
    fullName: 'Aziza Tursunova',
    pinfl: '41503960120092',
    phone: data.phone,
    passport: data.passport,
    birthDate: data.birthDate,
    maritalStatus: data.maritalStatus,
    monthlyIncome: data.monthlyIncome,
  }
  addClient(client)
  return client
}
