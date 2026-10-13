import { createStore } from '@/shared/lib/createStore'

/** One of the merchant's shops. Stock is kept per location and staff are assigned to them. */
export type Location = {
  id: string
  name: string
  address: string
  /** Nine digits after +998. */
  phone: string
  /** Free text, e.g. "09:00–20:00, har kuni". */
  hours: string
  active: boolean
}

// Invented sample shops of the signed-in merchant. Replace with the API.
export const locationsStore = createStore<Location>([
  {
    id: 'l1',
    name: 'Chilonzor filiali',
    address: 'Toshkent, Chilonzor 9-kvartal, 12-uy',
    phone: '712001122',
    hours: '09:00–20:00, har kuni',
    active: true,
  },
  {
    id: 'l2',
    name: 'Yunusobod filiali',
    address: 'Toshkent, Yunusobod 4-mavze, 7-uy',
    phone: '712003344',
    hours: '10:00–21:00, har kuni',
    active: true,
  },
  {
    id: 'l3',
    name: 'Samarqand filiali',
    address: 'Samarqand, Registon koʻchasi, 5-uy',
    phone: '662005566',
    hours: '09:00–19:00, dushanba–shanba',
    active: false,
  },
])
