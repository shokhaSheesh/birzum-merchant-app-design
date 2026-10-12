import { useClient } from '@/entities/clients/useClients'

// Which sample client is using the shopper app. Sign-in sets it when the phone number
// matches one; otherwise the first sample client stands in. Replace with the real session.
let customerId = '1'

export const setCustomerId = (id: string) => {
  customerId = id
}

export const getCustomerId = () => customerId

/** The signed-in shopper's record. */
export const useCustomer = () => useClient(customerId)
