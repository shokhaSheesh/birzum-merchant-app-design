import { useMemo } from 'react'
import { createStore } from '@/shared/lib/createStore'

export const CATEGORIES = ['phones', 'tvs', 'appliances', 'laptops'] as const
export type Category = (typeof CATEGORIES)[number]

export type Store = {
  id: string
  name: string
  address: string
  /** Average of shopper ratings, 1 to 5. */
  rating: number
  reviews: number
}

/** A choice the shopper makes on a product, e.g. memory or color. An option may change the price. */
export type VariationOption = {
  label: string
  priceDelta?: number
  /** For colors: the product is drawn in this color on the option's picture. */
  swatch?: string
}
export type Variation = { name: string; options: VariationOption[] }

export type Product = {
  id: string
  name: string
  category: Category
  brand: string
  /** Base price in UZS, before variation price changes. */
  price: number
  storeId: string
  /**
   * Pieces on hand: location id, then variant key (see `variantKey`), then the count.
   * A missing entry means zero.
   */
  stock: Record<string, Record<string, number>>
  /** Photo URLs, first one is the cover. Empty until the merchant adds some. */
  images: string[]
  /** Hidden products stay in the merchant's list but not in the client app. */
  active: boolean
  description: string
  variations: Variation[]
  /** Label and value pairs, in display order. */
  specs: [string, string][]
}

// Invented sample shops and catalogue. Replace with the API.
export const stores: Store[] = [
  { id: 's1', name: 'Mega Texno', address: 'Toshkent, Chilonzor', rating: 4.9, reviews: 318 },
  { id: 's2', name: 'Texno Dunyo', address: 'Toshkent, Yunusobod', rating: 4.7, reviews: 142 },
  {
    id: 's3',
    name: 'Elektro Market',
    address: 'Samarqand, Registon koʻchasi',
    rating: 4.5,
    reviews: 86,
  },
]

const SWATCHES: Record<string, string> = {
  Qora: '#2b3440',
  Koʻk: '#3f74b8',
  Binafsha: '#8468c4',
  Oq: '#f4f5f6',
  Kumush: '#b9c1c7',
  Yashil: '#5aa277',
}

const colors = (...labels: string[]): Variation => ({
  name: 'Rang',
  options: labels.map((label) => ({ label, swatch: SWATCHES[label] })),
})

type SeedProduct = Omit<Product, 'stock' | 'images' | 'active'> & { stock: number }

const seedProducts: SeedProduct[] = [
  {
    id: 'p1',
    name: 'Samsung Galaxy A55',
    category: 'phones',
    brand: 'Samsung',
    price: 5_500_000,
    storeId: 's1',
    stock: 12,
    description:
      'Katta AMOLED ekranli, suvga chidamli smartfon. 50 MP asosiy kamera va bir kunga yetadigan batareya.',
    variations: [
      colors('Qora', 'Koʻk', 'Binafsha'),
      { name: 'Xotira', options: [{ label: '128 GB' }, { label: '256 GB', priceDelta: 600_000 }] },
    ],
    specs: [
      ['Ekran', '6,6 dyuym, AMOLED'],
      ['Kamera', '50 MP'],
      ['Batareya', '5000 mA·soat'],
      ['Kafolat', '12 oy'],
    ],
  },
  {
    id: 'p2',
    name: 'Televizor 43',
    category: 'tvs',
    brand: 'Artel',
    price: 4_200_000,
    storeId: 's1',
    stock: 5,
    description: 'Full HD tasvirli 43 dyuymli televizor. Ingichka ramka va ikkita HDMI kirish.',
    variations: [],
    specs: [
      ['Diagonal', '43 dyuym'],
      ['Tasvir', 'Full HD'],
      ['HDMI', '2 ta'],
      ['Kafolat', '24 oy'],
    ],
  },
  {
    id: 'p3',
    name: 'LG kir yuvish mashinasi',
    category: 'appliances',
    brand: 'LG',
    price: 6_900_000,
    storeId: 's2',
    stock: 3,
    description:
      'Bugʻ bilan yuvish rejimiga ega avtomat mashina. Jim ishlaydi va elektr energiyasini tejaydi.',
    variations: [
      colors('Oq', 'Kumush'),
      { name: 'Sigʻimi', options: [{ label: '7 kg' }, { label: '9 kg', priceDelta: 1_100_000 }] },
    ],
    specs: [
      ['Aylanish', '1200 ayl/daq'],
      ['Energiya sinfi', 'A+++'],
      ['Dasturlar', '14 ta'],
      ['Kafolat', '36 oy'],
    ],
  },
  {
    id: 'p4',
    name: 'Lenovo IdeaPad noutbuk',
    category: 'laptops',
    brand: 'Lenovo',
    price: 8_400_000,
    storeId: 's2',
    stock: 7,
    description: 'Oʻqish va ish uchun yengil noutbuk. Tez SSD xotira va toʻliq kunlik batareya.',
    variations: [
      {
        name: 'Operativ xotira',
        options: [{ label: '8 GB' }, { label: '16 GB', priceDelta: 900_000 }],
      },
    ],
    specs: [
      ['Ekran', '15,6 dyuym, Full HD'],
      ['Protsessor', 'Intel Core i5'],
      ['SSD', '512 GB'],
      ['Kafolat', '12 oy'],
    ],
  },
  {
    id: 'p5',
    name: 'Xiaomi Redmi Note 13',
    category: 'phones',
    brand: 'Xiaomi',
    price: 3_300_000,
    storeId: 's3',
    stock: 20,
    description: 'Hamyonbop smartfon: 120 Gts ekran, tez quvvatlash va 108 MP kamera.',
    variations: [
      colors('Qora', 'Yashil'),
      { name: 'Xotira', options: [{ label: '128 GB' }, { label: '256 GB', priceDelta: 400_000 }] },
    ],
    specs: [
      ['Ekran', '6,67 dyuym, AMOLED'],
      ['Kamera', '108 MP'],
      ['Batareya', '5000 mA·soat'],
      ['Kafolat', '12 oy'],
    ],
  },
  {
    id: 'p6',
    name: 'Televizor 55 Smart',
    category: 'tvs',
    brand: 'Samsung',
    price: 7_800_000,
    storeId: 's3',
    stock: 0,
    description: '4K tasvirli aqlli televizor. Wi-Fi, ovozli boshqaruv va ilovalar doʻkoni bor.',
    variations: [],
    specs: [
      ['Diagonal', '55 dyuym'],
      ['Tasvir', '4K UHD'],
      ['Smart TV', 'Bor'],
      ['Kafolat', '24 oy'],
    ],
  },
  {
    id: 'p7',
    name: 'Artel konditsioner',
    category: 'appliances',
    brand: 'Artel',
    price: 6_000_000,
    storeId: 's1',
    stock: 9,
    description: 'Invertorli konditsioner. Xonani tez sovitadi va qishda isitadi.',
    variations: [
      { name: 'Quvvati', options: [{ label: '12' }, { label: '18', priceDelta: 1_800_000 }] },
    ],
    specs: [
      ['Maydon', '35 m² gacha'],
      ['Turi', 'Invertor'],
      ['Isitish', 'Bor'],
      ['Kafolat', '36 oy'],
    ],
  },
  {
    id: 'p8',
    name: 'HP 15 noutbuk',
    category: 'laptops',
    brand: 'HP',
    price: 6_500_000,
    storeId: 's3',
    stock: 4,
    description: 'Kundalik ishlar uchun ishonchli noutbuk. Katta ekran va qulay klaviatura.',
    variations: [
      colors('Kumush', 'Qora'),
      {
        name: 'Operativ xotira',
        options: [{ label: '8 GB' }, { label: '16 GB', priceDelta: 800_000 }],
      },
    ],
    specs: [
      ['Ekran', '15,6 dyuym, Full HD'],
      ['Protsessor', 'Intel Core i3'],
      ['SSD', '256 GB'],
      ['Kafolat', '12 oy'],
    ],
  },
  {
    id: 'p9',
    name: 'Samsung Galaxy S24',
    category: 'phones',
    brand: 'Samsung',
    price: 11_900_000,
    storeId: 's2',
    stock: 6,
    description: 'Flagman smartfon: yorqin ekran, kuchli protsessor va tungi suratga olish.',
    variations: [
      colors('Qora', 'Kumush'),
      {
        name: 'Xotira',
        options: [{ label: '256 GB' }, { label: '512 GB', priceDelta: 1_500_000 }],
      },
    ],
    specs: [
      ['Ekran', '6,2 dyuym, AMOLED'],
      ['Kamera', '50 MP'],
      ['Batareya', '4000 mA·soat'],
      ['Kafolat', '12 oy'],
    ],
  },
  {
    id: 'p10',
    name: 'Samsung Galaxy A35',
    category: 'phones',
    brand: 'Samsung',
    price: 4_300_000,
    storeId: 's3',
    stock: 15,
    description:
      'Ishonchli oʻrta toifa smartfon: suvga chidamli korpus va uzoq ishlaydigan batareya.',
    variations: [colors('Koʻk', 'Qora')],
    specs: [
      ['Ekran', '6,6 dyuym, AMOLED'],
      ['Kamera', '50 MP'],
      ['Batareya', '5000 mA·soat'],
      ['Kafolat', '12 oy'],
    ],
  },
]

/** Brands come from the Birzum admin panel; a merchant picks from them and cannot add one. */
export const BRANDS = ['Apple', 'Artel', 'HP', 'Huawei', 'Lenovo', 'LG', 'Samsung', 'Xiaomi']

/** The shop the signed-in merchant belongs to. Its products are the ones it can manage. */
export const OWN_STORE_ID = 's1'

/** Identifies one combination of options, e.g. "Qora|256 GB". Empty for a product without variations. */
export const variantKey = (labels: string[]) => labels.join('|')

/** Every combination of a product's options, as lists of labels. One empty list if it has none. */
export function variantCombos(variations: Variation[]): string[][] {
  return variations.reduce<string[][]>(
    (combos, variation) =>
      combos.flatMap((combo) => variation.options.map((option) => [...combo, option.label])),
    [[]],
  )
}

/** Pieces on hand across all locations: of one variant, or of the whole product. */
export function stockOf(product: Product, labels?: string[]) {
  return Object.values(product.stock).reduce(
    (sum, byVariant) =>
      sum +
      (labels
        ? (byVariant[variantKey(labels)] ?? 0)
        : Object.values(byVariant).reduce((a, b) => a + b, 0)),
    0,
  )
}

// Sample stock: the seed count for every variant, split over the shop's first two locations
function seedStock(product: SeedProduct): Product['stock'] {
  const own = product.storeId === OWN_STORE_ID
  const first: Record<string, number> = {}
  const second: Record<string, number> = {}
  for (const combo of variantCombos(product.variations)) {
    first[variantKey(combo)] = Math.ceil(product.stock * 0.6)
    second[variantKey(combo)] = Math.floor(product.stock * 0.4)
  }
  return own ? { l1: first, l2: second } : { [`${product.storeId}-main`]: first }
}

export const productsStore = createStore<Product>(
  seedProducts.map((product) => ({
    ...product,
    stock: seedStock(product),
    images: [],
    active: true,
  })),
)

/** What shoppers can see: visible products from every shop. */
export const useCatalog = () => {
  const all = productsStore.useAll()
  return useMemo(() => all.filter((product) => product.active), [all])
}

export const getProduct = (id: string | undefined) => productsStore.get(id)
export const getStore = (id: string | undefined) => stores.find((s) => s.id === id)
