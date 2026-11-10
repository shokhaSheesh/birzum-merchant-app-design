import { currentUser } from '@/entities/session/user'
import { merchantStore } from './merchantApi'
import { currentStaffId, staffStore } from './staff'

/** Whoever is signed in: from `GET /merchant/me` once it has answered, else the sample user. */
export function useCurrentUser() {
  const me = staffStore.useAll().find((member) => member.id === currentStaffId())
  const merchant = merchantStore.useAll()[0]
  if (!me || !merchant) return currentUser
  return {
    photoUrl: me.photoUrl,
    firstName: me.firstName,
    lastName: me.lastName,
    login: me.login,
    phone: me.phone,
    store: merchant.name,
  }
}
