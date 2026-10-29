import type { RoleId } from './roles'
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
  email?: string
  /** JSHSHIR: 14 digits. */
  pinfl?: string
  /**
   * True when the password was set by whoever created the account: FlexSoft asks for a new one
   * at the first sign-in. The password itself goes to FlexSoft and is never kept here.
   */
  temporaryPassword?: boolean
  roleId: RoleId
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
    email: 'aziz.karimov@mediapark.uz',
    pinfl: '30111991012001',
    roleId: 'admin',
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
    email: 'madina.sobirova@mediapark.uz',
    pinfl: '30211992022001',
    roleId: 'admin',
    locationIds: ['l1'],
    active: true,
  },
  {
    id: 'u3',
    firstName: 'Sherzod',
    lastName: 'Umarov',
    phone: '977203090',
    login: 'sherzod.umarov',
    email: 'sherzod.umarov@mediapark.uz',
    pinfl: '30311993032001',
    roleId: 'seller',
    locationIds: ['l2'],
    active: true,
  },
  {
    id: 'u4',
    firstName: 'Nodira',
    lastName: 'Aliyeva',
    phone: '901458899',
    login: 'nodira.aliyeva',
    email: 'nodira.aliyeva@mediapark.uz',
    pinfl: '30411994042001',
    roleId: 'seller',
    locationIds: ['l1'],
    active: false,
  },
])
