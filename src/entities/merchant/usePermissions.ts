import type { Permission } from './roles'
import { rolesStore } from './roles'
import { CURRENT_STAFF_ID, staffStore } from './staff'

/** What the signed-in staff member's role allows. */
export function usePermissions() {
  const me = staffStore.useAll().find((member) => member.id === CURRENT_STAFF_ID)
  const role = rolesStore.useAll().find((r) => r.id === me?.roleId)
  return { can: (permission: Permission) => !!role?.permissions.includes(permission), role, me }
}
