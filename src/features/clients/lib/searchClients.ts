import { PHONE_PREFIX } from '@/shared/lib/phone'
import type { Client } from '@/entities/clients/clients'

/** Matches on phone number, JSHSHIR, or passport series and number. Spaces, "+" and case are ignored. */
export function searchClients(clients: Client[], query: string) {
  const normalized = query.replace(/[\s+\-()]/g, '').toUpperCase()
  if (normalized === '') return clients

  const digitsOnly = /^\d+$/.test(normalized)
  const countryCode = PHONE_PREFIX.slice(1)

  return clients.filter((client) => {
    if (client.passport.includes(normalized)) return true
    if (!digitsOnly) return false
    return (countryCode + client.phone).includes(normalized) || client.pinfl.includes(normalized)
  })
}
