import { useSyncExternalStore } from 'react'
import { clientsStore } from './clientsStore'

export const useClients = () => useSyncExternalStore(clientsStore.subscribe, clientsStore.getAll)

export const useClient = (id: string | undefined) => useClients().find((client) => client.id === id)
