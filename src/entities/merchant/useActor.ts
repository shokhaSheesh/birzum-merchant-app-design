import type { Actor } from '@/entities/clients/clients'
import { currentStaffId, staffStore } from './staff'

/** The signed-in staff member, as the author of a change to an application. */
export function useActor(): Actor {
  const me = staffStore.useAll().find((member) => member.id === currentStaffId())
  return { kind: 'staff', name: me ? `${me.firstName} ${me.lastName}` : '' }
}
