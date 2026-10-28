import { appShoppers, seedClients, type Application, type Client } from './clients'
import { confirmDeadline } from './confirmDeadline'
import { historyOf, SYSTEM } from './history'
import { withGeneratedApplications } from './seedApplications'

// In-memory store standing in for the backend. A page refresh resets it.
let clients = [...withGeneratedApplications(seedClients), ...appShoppers]
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

/**
 * A shopper's order the shop did not confirm within 24 hours is rejected by the system, so the
 * shopper can try another shop. The backend does this; here it runs on load and every half minute.
 */
function expireUnconfirmed() {
  const now = new Date()
  let changed = false
  const expire = (application: Application): Application => {
    if (application.status !== 'pending') return application
    const deadline = confirmDeadline(application)
    if (deadline > now) return application
    changed = true
    return {
      ...application,
      status: 'rejected',
      rejection: { reason: 'timeout', comment: '' },
      history: [...historyOf(application), { status: 'rejected', at: deadline, by: SYSTEM }],
    }
  }
  const next = clients.map((client) => ({
    ...client,
    applications: client.applications.map(expire),
  }))
  if (changed) {
    clients = next
    emit()
  }
}
expireUnconfirmed()
setInterval(expireUnconfirmed, 30_000)

export const clientsStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getAll: () => clients,
  get: (id: string) => clients.find((client) => client.id === id),
  add(client: Client) {
    clients = [client, ...clients]
    emit()
  },
  update(id: string, patch: Partial<Client>) {
    clients = clients.map((client) => (client.id === id ? { ...client, ...patch } : client))
    emit()
  },
  /** The number the next application will get. The real one is issued by the backend. */
  nextApplicationNumber() {
    const numbers = clients.flatMap((c) => c.applications.map((a) => a.id))
    return Math.max(252476, ...numbers) + 1
  },
  updateApplication(number: number, patch: Partial<Application>) {
    clients = clients.map((client) =>
      client.applications.some((application) => application.id === number)
        ? {
            ...client,
            applications: client.applications.map((application) =>
              application.id === number ? { ...application, ...patch } : application,
            ),
          }
        : client,
    )
    emit()
  },
}
