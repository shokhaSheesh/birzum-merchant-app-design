import { createStore } from '@/shared/lib/createStore'

/** Everything a role can be allowed to do. A screen or button checks for one of these. */
export const PERMISSIONS = [
  'clients',
  'approve',
  'status',
  'products',
  'inventory',
  'locations',
  'staff',
  'analytics',
] as const
export type Permission = (typeof PERMISSIONS)[number]

/**
 * FlexSoft gives every staff member one of two roles at sign-in; the roles cannot be added or
 * renamed. What each one may do is set by Birzum in the admin panel («Merchant rollari»).
 */
export const ROLE_IDS = ['admin', 'seller'] as const
export type RoleId = (typeof ROLE_IDS)[number]
export type Role = { id: RoleId; permissions: Permission[] }

// The admin panel's defaults. Replace with the API.
export const rolesStore = createStore<Role>([
  { id: 'admin', permissions: [...PERMISSIONS] },
  { id: 'seller', permissions: ['clients', 'approve', 'status', 'inventory'] },
])
