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
  'roles',
  'analytics',
] as const
export type Permission = (typeof PERMISSIONS)[number]

export type Role = { id: string; name: string; permissions: Permission[] }

// Invented sample roles. Replace with the API.
export const rolesStore = createStore<Role>([
  { id: 'r1', name: 'Egasi', permissions: [...PERMISSIONS] },
  {
    id: 'r2',
    name: 'Menejer',
    permissions: ['clients', 'approve', 'status', 'products', 'inventory', 'analytics'],
  },
  { id: 'r3', name: 'Sotuvchi', permissions: ['clients', 'approve'] },
])
