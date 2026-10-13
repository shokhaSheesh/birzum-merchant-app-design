import user4Photo from '@/shared/assets/people/user-4.jpg'
import { createStore } from '@/shared/lib/createStore'

/** Someone who signs in to the merchant app: their role and the shops they work in. */
export type StaffMember = {
  id: string
  firstName: string
  lastName: string
  /** Nine digits after +998. */
  phone: string
  login: string
  roleId: string
  locationIds: string[]
  photoUrl?: string
  active: boolean
}

/** The staff record of whoever is signed in. */
export const CURRENT_STAFF_ID = 'u1'

// Invented sample staff. Replace with the API.
export const staffStore = createStore<StaffMember>([
  {
    id: 'u1',
    firstName: 'Aziz',
    lastName: 'Karimov',
    phone: '901112233',
    login: 'aziz.karimov',
    roleId: 'r1',
    locationIds: ['l1', 'l2', 'l3'],
    photoUrl: user4Photo,
    active: true,
  },
  {
    id: 'u2',
    firstName: 'Madina',
    lastName: 'Sobirova',
    phone: '935004411',
    login: 'madina.sobirova',
    roleId: 'r2',
    locationIds: ['l1'],
    active: true,
  },
  {
    id: 'u3',
    firstName: 'Sherzod',
    lastName: 'Umarov',
    phone: '977203090',
    login: 'sherzod.umarov',
    roleId: 'r3',
    locationIds: ['l2'],
    active: true,
  },
  {
    id: 'u4',
    firstName: 'Nodira',
    lastName: 'Aliyeva',
    phone: '901458899',
    login: 'nodira.aliyeva',
    roleId: 'r3',
    locationIds: ['l1'],
    active: false,
  },
])
