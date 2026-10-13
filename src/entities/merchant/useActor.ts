import type { Actor } from '@/entities/clients/clients'
import { CURRENT_STAFF_ID, staffStore } from './staff'

/** The signed-in staff member, as the author of a change to an application. */
export function useActor(): Actor {
  const me = staffStore.useAll().find((member) => member.id === CURRENT_STAFF_ID)
  return { kind: 'staff', name: me ? `${me.firstName} ${me.lastName}` : '' }
}
