import type { Client } from './clients'

// The code a shopper shows a merchant so the merchant can add them: the QR code holds it, and
// it is also printed as six digits for when the camera cannot read the screen. Invented from
// the client's id here; the real one comes from the backend and changes now and then.

/** Six digits that stand for this shopper. */
export function shopperCode(client: Pick<Client, 'id' | 'pinfl'>) {
  let hash = 7
  for (const char of client.id + client.pinfl) hash = (hash * 31 + char.charCodeAt(0)) % 900_000
  return String(100_000 + hash)
}

/** "482731" as "482 731", easier to read out loud. */
export const formatShopperCode = (code: string) => `${code.slice(0, 3)} ${code.slice(3)}`

/** What the QR code holds. */
export const shopperQrValue = (code: string) => `https://birzum.example/c/${code}`
