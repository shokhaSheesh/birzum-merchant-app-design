import { mockPortrait } from '@/shared/lib/mockPortrait'

// Invented sample merchant user. Replace with the signed-in user from the API.
export const currentUser = {
  photoUrl: mockPortrait({
    hair: 'short',
    hairColor: '#2b2118',
    skin: '#e0ac82',
    shirt: '#0b3d57',
    background: '#e7f4cd',
  }),
  firstName: 'Aziz',
  lastName: 'Karimov',
  login: 'aziz.karimov',
  /** Nine digits after +998. */
  phone: '901112233',
  store: 'Mega Texno',
  branch: 'Chilonzor filiali',
}
