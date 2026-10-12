import { seedClients, type Application, type Client } from './clients'

// In-memory store standing in for the backend. A page refresh resets it.
let clients = seedClients
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

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
