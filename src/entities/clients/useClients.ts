import { useSyncExternalStore } from 'react'
import { clientsStore } from './clientsStore'

export const useClients = () => useSyncExternalStore(clientsStore.subscribe, clientsStore.getAll)

export const useClient = (id: string | undefined) => useClients().find((client) => client.id === id)

/** The merchant's own clients: everyone except shoppers not added yet. */
export const useListedClients = () => useClients().filter((client) => client.listed !== false)
