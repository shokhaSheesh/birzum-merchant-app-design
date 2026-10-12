import { useSyncExternalStore } from 'react'
import type { ApplicationProduct, Term } from '@/entities/clients/clients'
import { clientsStore } from '@/entities/clients/clientsStore'
import { installmentTerms, type InstallmentTerms } from '@/entities/clients/installment'

export type OrderStatus = 'pending' | 'approved' | 'rejected'

/**
 * What a shopper sends from the cart. It waits for the merchant; approving it creates
 * the application (ariza) on that client.
 */
export type Order = {
  id: number
  clientId: string
  date: Date
  items: ApplicationProduct[]
  total: number
  terms: InstallmentTerms
  status: OrderStatus
  /** Set once the merchant approves and the application exists. */
  applicationNumber?: number
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// One sample order from another client, so the merchant's list is not empty. In memory only.
let orders: Order[] = [
  {
    id: 5012,
    clientId: '2',
    date: new Date(Date.now() - 40 * 60 * 1000),
    items: [{ name: 'Televizor 55 Smart', price: 7_800_000, quantity: 1 }],
    total: 7_800_000,
    terms: installmentTerms(7_800_000, 12),
    status: 'pending',
  },
]
const listeners = new Set<() => void>()
const change = (next: Order[]) => {
  orders = next
  listeners.forEach((listener) => listener())
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const useOrders = () => useSyncExternalStore(subscribe, () => orders)
export const useOrder = (id: number) => useOrders().find((order) => order.id === id)

/** Shopper side: send the cart to the merchant. */
export async function placeOrder(clientId: string, items: ApplicationProduct[], term: Term) {
  await delay(900)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const order: Order = {
    id: Math.max(5000, ...orders.map((o) => o.id)) + 1,
    clientId,
    date: new Date(),
    items,
    total,
    terms: installmentTerms(total, term),
    status: 'pending',
  }
  change([order, ...orders])
  return order
}

/** Merchant side: approve the order, which creates the application on the client. */
export async function approveOrder(id: number) {
  await delay(900)
  const order = orders.find((o) => o.id === id)
  const client = order && clientsStore.get(order.clientId)
  if (!order || !client) return undefined

  const applicationNumber = clientsStore.nextApplicationNumber()
  clientsStore.update(client.id, {
    applications: [
      {
        id: applicationNumber,
        date: new Date(),
        status: 'processing',
        goodsTotal: order.total,
        installmentTotal: order.terms.installmentTotal,
        details: {
          products: order.items,
          downPayment: 0,
          paymentDay: 5,
          term: order.terms.term,
          markupPercent: order.terms.markupPercent,
          monthlyPayment: order.terms.monthlyPayment,
        },
      },
      ...client.applications,
    ],
  })
  change(orders.map((o) => (o.id === id ? { ...o, status: 'approved', applicationNumber } : o)))
  return applicationNumber
}

export async function rejectOrder(id: number) {
  await delay(600)
  change(orders.map((o) => (o.id === id ? { ...o, status: 'rejected' } : o)))
}
