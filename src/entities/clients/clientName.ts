import type { Client } from './clients'

type Named = Pick<Client, 'lastName' | 'firstName' | 'middleName'>

/** "Karimova Dilnoza" */
export const shortName = (client: Named) => `${client.lastName} ${client.firstName}`

/** "Karimova Dilnoza Rustam qizi" */
export const fullName = (client: Named) => `${shortName(client)} ${client.middleName}`

/** "KD" */
export const initials = (client: Named) => `${client.lastName[0]}${client.firstName[0]}`
