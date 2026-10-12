export const CATEGORIES = ['phones', 'tvs', 'appliances', 'laptops'] as const
export type Category = (typeof CATEGORIES)[number]

export type Product = {
  id: string
  name: string
  category: Category
  /** In UZS. */
  price: number
  store: string
}

// Invented sample catalogue. Replace with the API.
export const products: Product[] = [
  {
    id: 'p1',
    name: 'Samsung Galaxy A55, 256 GB',
    category: 'phones',
    price: 5_500_000,
    store: 'Mega Texno',
  },
  { id: 'p2', name: 'Televizor 43', category: 'tvs', price: 4_200_000, store: 'Mega Texno' },
  {
    id: 'p3',
    name: 'LG kir yuvish mashinasi',
    category: 'appliances',
    price: 6_900_000,
    store: 'Mega Texno',
  },
  {
    id: 'p4',
    name: 'Lenovo IdeaPad noutbuk',
    category: 'laptops',
    price: 8_400_000,
    store: 'Mega Texno',
  },
  {
    id: 'p5',
    name: 'Xiaomi Redmi Note 13, 128 GB',
    category: 'phones',
    price: 3_300_000,
    store: 'Mega Texno',
  },
  { id: 'p6', name: 'Televizor 55 Smart', category: 'tvs', price: 7_800_000, store: 'Mega Texno' },
  {
    id: 'p7',
    name: 'Artel konditsioner 12',
    category: 'appliances',
    price: 6_000_000,
    store: 'Mega Texno',
  },
  { id: 'p8', name: 'HP 15 noutbuk', category: 'laptops', price: 6_500_000, store: 'Mega Texno' },
]

export const getProduct = (id: string | undefined) => products.find((p) => p.id === id)
