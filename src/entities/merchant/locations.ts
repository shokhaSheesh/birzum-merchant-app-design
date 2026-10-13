import type { LocalizedText } from '@/shared/i18n/dictionaries'
import { createStore } from '@/shared/lib/createStore'

/** One of the merchant's shops. Stock is kept per location and staff are assigned to them. */
export type Location = {
  id: string
  name: LocalizedText
  address: LocalizedText
  /** Nine digits after +998. */
  phone: string
  /** Entered once, e.g. "09:00–20:00". */
  hours: string
  active: boolean
}

// Invented sample shops of the signed-in merchant. Replace with the API.
export const locationsStore = createStore<Location>([
  {
    id: 'l1',
    name: { uz: 'Chilonzor filiali', ru: 'Филиал Чиланзар' },
    address: {
      uz: 'Toshkent, Chilonzor 9-kvartal, 12-uy',
      ru: 'Ташкент, Чиланзар, 9-й квартал, 12',
    },
    phone: '712001122',
    hours: '09:00–20:00',
    active: true,
  },
  {
    id: 'l2',
    name: { uz: 'Yunusobod filiali', ru: 'Филиал Юнусабад' },
    address: { uz: 'Toshkent, Yunusobod 4-mavze, 7-uy', ru: 'Ташкент, Юнусабад, 4-й массив, 7' },
    phone: '712003344',
    hours: '10:00–21:00',
    active: true,
  },
  {
    id: 'l3',
    name: { uz: 'Samarqand filiali', ru: 'Филиал Самарканд' },
    address: { uz: 'Samarqand, Registon koʻchasi, 5-uy', ru: 'Самарканд, улица Регистан, 5' },
    phone: '662005566',
    hours: '09:00–19:00',
    active: false,
  },
])
