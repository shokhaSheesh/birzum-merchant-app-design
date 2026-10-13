import { useMemo } from 'react'
import photo1 from '@/shared/assets/products/product-1.jpg'
import photo2 from '@/shared/assets/products/product-2.jpg'
import photo3 from '@/shared/assets/products/product-3.jpg'
import photo4 from '@/shared/assets/products/product-4.jpg'
import photo5 from '@/shared/assets/products/product-5.jpg'
import photo6 from '@/shared/assets/products/product-6.jpg'
import photo7 from '@/shared/assets/products/product-7.jpg'
import photo9 from '@/shared/assets/products/product-9.jpg'
import photo10 from '@/shared/assets/products/product-10.jpg'
import type { Lang, LocalizedText } from '@/shared/i18n/dictionaries'
import { createStore } from '@/shared/lib/createStore'
import { seedAttributes } from './attributes'

export const CATEGORIES = ['phones', 'tvs', 'appliances', 'laptops'] as const
export type Category = (typeof CATEGORIES)[number]

export type Store = {
  id: string
  name: string
  address: string
}

/** One option group on a product: an attribute from the directory and which of its values apply. */
export type ProductVariation = { attributeId: string; valueIds: string[] }

export type Product = {
  id: string
  name: LocalizedText
  category: Category
  brand: string
  /** The price shown on cards: the product's own price, or its cheapest variant's. In UZS. */
  price: number
  storeId: string
  description: LocalizedText
  variations: ProductVariation[]
  /**
   * The combinations that are actually sold, by variant key (see `variantKey`), each with its
   * own price. A product without variations has none and sells at `price`.
   */
  variants: Record<string, { price: number }>
  /**
   * Pieces on hand: location id, then variant key, then the count. A missing entry means zero.
   */
  stock: Record<string, Record<string, number>>
  /** Characteristics, in display order. */
  specs: { label: LocalizedText; value: LocalizedText }[]
  /** Photo URLs per language (a photo may carry text), first one is the cover. Empty until the merchant adds some. */
  images: Record<Lang, string[]>
  /** Extra photos for a variant value (usually a color), by value id. They replace `images` while it is chosen. */
  valueImages: Record<string, string[]>
  /** Hidden products stay in the merchant's list but not in the client app. */
  active: boolean
}

// Invented sample shops and catalogue. Replace with the API.
export const stores: Store[] = [
  { id: 's1', name: 'Mega Texno', address: 'Toshkent, Chilonzor' },
  { id: 's2', name: 'Texno Dunyo', address: 'Toshkent, Yunusobod' },
  { id: 's3', name: 'Elektro Market', address: 'Samarqand, Registon koʻchasi' },
]

// The samples are written in a short form (Uzbek names, a price difference per option) and
// expanded into the real model below.
type SeedVariation = { name: string; options: { label: string; priceDelta?: number }[] }
type SeedProduct = {
  id: string
  name: string
  category: Category
  brand: string
  price: number
  storeId: string
  stock: number
  description: string
  variations: SeedVariation[]
  specs: [string, string][]
  /** The product's own photos, cover first. Without any, a drawn stand-in is shown. */
  photos?: string[]
  /** Photos of one color, by the color's name. They replace `photos` while it is chosen. */
  colorPhotos?: Record<string, string[]>
}

const colors = (...labels: string[]): SeedVariation => ({
  name: 'Rang',
  options: labels.map((label) => ({ label })),
})

const RUSSIAN_NAMES: Record<string, string> = {
  p2: 'Телевизор 43',
  p3: 'Стиральная машина LG',
  p4: 'Ноутбук Lenovo IdeaPad',
  p6: 'Телевизор 55 Smart',
  p7: 'Стиральная машина Artel',
  p8: 'Ноутбук HP 15',
}

const seedProducts: SeedProduct[] = [
  {
    id: 'p1',
    name: 'iPhone 18 Pro',
    category: 'phones',
    brand: 'Apple',
    price: 16_900_000,
    storeId: 's1',
    stock: 12,
    description:
      'Titan korpusli flagman smartfon. 48 MP uch kamerali tizim, yorqin OLED ekran va bir kunga yetadigan batareya.',
    variations: [
      colors('Oq', 'Qora'),
      {
        name: 'Xotira',
        options: [{ label: '256 GB' }, { label: '512 GB', priceDelta: 2_500_000 }],
      },
    ],
    specs: [
      ['Ekran', '6,3 dyuym, OLED'],
      ['Kamera', '48 MP'],
      ['Protsessor', 'A19 Pro'],
      ['Kafolat', '12 oy'],
    ],
    photos: [photo1, photo4],
    colorPhotos: { Oq: [photo1], Qora: [photo4] },
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
    photos: [photo9],
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
    photos: [photo7, photo5],
    colorPhotos: { Oq: [photo7], Kumush: [photo5] },
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
    name: 'iPhone 18',
    category: 'phones',
    brand: 'Apple',
    price: 12_900_000,
    storeId: 's3',
    stock: 20,
    description:
      'Alyuminiy korpusli yengil smartfon: 120 Gts ekran, ikki kamerali tizim va tez quvvatlash.',
    variations: [
      colors('Binafsha'),
      {
        name: 'Xotira',
        options: [{ label: '128 GB' }, { label: '256 GB', priceDelta: 1_400_000 }],
      },
    ],
    specs: [
      ['Ekran', '6,1 dyuym, OLED'],
      ['Kamera', '48 MP'],
      ['Protsessor', 'A19'],
      ['Kafolat', '12 oy'],
    ],
    photos: [photo3],
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
    photos: [photo10],
  },
  {
    id: 'p7',
    name: 'Artel kir yuvish mashinasi',
    category: 'appliances',
    brand: 'Artel',
    price: 6_000_000,
    storeId: 's1',
    stock: 9,
    description:
      'Invertor motorli avtomat kir yuvish mashinasi. Tez yuvish rejimi va bolalardan himoya bor.',
    variations: [
      colors('Qora'),
      { name: 'Sigʻimi', options: [{ label: '7 kg' }, { label: '9 kg', priceDelta: 1_800_000 }] },
    ],
    specs: [
      ['Aylanish', '1400 ayl/daq'],
      ['Energiya sinfi', 'A+++'],
      ['Dasturlar', '16 ta'],
      ['Kafolat', '36 oy'],
    ],
    photos: [photo6],
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
    name: 'iPhone 18 Pro Max',
    category: 'phones',
    brand: 'Apple',
    price: 19_900_000,
    storeId: 's2',
    stock: 6,
    description:
      'Eng katta ekranli flagman: kuchli protsessor, uzoq ishlaydigan batareya va tungi suratga olish.',
    variations: [
      colors('Qizil'),
      {
        name: 'Xotira',
        options: [{ label: '256 GB' }, { label: '512 GB', priceDelta: 2_500_000 }],
      },
    ],
    specs: [
      ['Ekran', '6,9 dyuym, OLED'],
      ['Kamera', '48 MP'],
      ['Protsessor', 'A19 Pro'],
      ['Kafolat', '12 oy'],
    ],
    photos: [photo2],
  },
  {
    id: 'p10',
    name: 'iPhone 18 Pro',
    category: 'phones',
    brand: 'Apple',
    price: 17_200_000,
    storeId: 's3',
    stock: 15,
    description: 'Titan korpusli flagman smartfon. 48 MP uch kamerali tizim va yorqin OLED ekran.',
    variations: [colors('Qora', 'Oq')],
    specs: [
      ['Ekran', '6,3 dyuym, OLED'],
      ['Kamera', '48 MP'],
      ['Xotira', '256 GB'],
      ['Kafolat', '12 oy'],
    ],
    photos: [photo4, photo1],
    colorPhotos: { Qora: [photo4], Oq: [photo1] },
  },
]

/** Brands come from the Birzum admin panel; a merchant picks from them and cannot add one. */
export const BRANDS = ['Apple', 'Artel', 'HP', 'Huawei', 'Lenovo', 'LG', 'Samsung', 'Xiaomi']

/** The shop the signed-in merchant belongs to. Its products are the ones it can manage. */
export const OWN_STORE_ID = 's1'

/** Identifies one combination by its value ids, e.g. "black|256". Empty for a product without variations. */
export const variantKey = (valueIds: string[]) => valueIds.join('|')
export const variantIds = (key: string) => (key === '' ? [] : key.split('|'))

/** Every possible combination of the chosen values, as lists of value ids. */
export function allCombos(variations: ProductVariation[]): string[][] {
  return variations.reduce<string[][]>(
    (combos, variation) =>
      combos.flatMap((combo) => variation.valueIds.map((valueId) => [...combo, valueId])),
    [[]],
  )
}

/** The combinations a product is actually sold in. One empty list if it has no variations. */
export const soldCombos = (product: Product) =>
  product.variations.length === 0 ? [[]] : Object.keys(product.variants).map(variantIds)

export const priceOf = (product: Product, valueIds: string[]) =>
  product.variants[variantKey(valueIds)]?.price ?? product.price

/** Pieces on hand across all locations: of one variant, or of every variant that is sold. */
export function stockOf(product: Product, valueIds?: string[], locationId?: string) {
  const keys = (valueIds ? [valueIds] : soldCombos(product)).map(variantKey)
  const shops = locationId ? [product.stock[locationId] ?? {}] : Object.values(product.stock)
  return shops.reduce(
    (sum, byVariant) => sum + keys.reduce((n, key) => n + (byVariant[key] ?? 0), 0),
    0,
  )
}

function fromSeed(seed: SeedProduct): Product {
  const text = (uz: string, ru = ''): LocalizedText => ({ uz, ru })
  const attributes = seed.variations.map((variation) =>
    seedAttributes.find((attribute) => attribute.name.uz === variation.name)!,
  )
  const variations = seed.variations.map((variation, i) => ({
    attributeId: attributes[i].id,
    valueIds: variation.options.map(
      (option) => attributes[i].values.find((value) => value.name.uz === option.label)!.id,
    ),
  }))

  // In the samples every combination is sold: base price plus each option's difference
  const variants: Product['variants'] = {}
  const stockFirst: Record<string, number> = {}
  const stockSecond: Record<string, number> = {}
  for (const combo of allCombos(variations)) {
    const key = variantKey(combo)
    const extra = combo.reduce((sum, valueId, i) => {
      const at = variations[i].valueIds.indexOf(valueId)
      return sum + (seed.variations[i].options[at].priceDelta ?? 0)
    }, 0)
    if (variations.length > 0) variants[key] = { price: seed.price + extra }
    stockFirst[key] = Math.ceil(seed.stock * 0.6)
    stockSecond[key] = Math.floor(seed.stock * 0.4)
  }

  return {
    id: seed.id,
    name: text(seed.name, RUSSIAN_NAMES[seed.id] ?? seed.name),
    category: seed.category,
    brand: seed.brand,
    price: seed.price,
    storeId: seed.storeId,
    description: text(seed.description),
    variations,
    variants,
    stock:
      seed.storeId === OWN_STORE_ID
        ? { l1: stockFirst, l2: stockSecond }
        : { [`${seed.storeId}-main`]: stockFirst },
    specs: seed.specs.map(([label, value]) => ({ label: text(label), value: text(value) })),
    images: { uz: seed.photos ?? [], ru: [] },
    // Each color's photos, keyed by the id of that color in the directory
    valueImages: Object.fromEntries(
      Object.entries(seed.colorPhotos ?? {}).map(([label, photos]) => [
        seedAttributes.flatMap((a) => a.values).find((value) => value.name.uz === label)!.id,
        photos,
      ]),
    ),
    active: true,
  }
}

export const productsStore = createStore<Product>(seedProducts.map(fromSeed))

/** Removes sold pieces from stock: from the given location first, then one after another. */
export function takeStock(
  productId: string,
  valueIds: string[],
  quantity: number,
  locationId?: string,
) {
  const product = productsStore.get(productId)
  if (!product) return
  const key = variantKey(valueIds)
  let left = quantity
  const stock = { ...product.stock }
  const order = Object.keys(stock).sort(
    (a, b) => Number(b === locationId) - Number(a === locationId),
  )
  for (const id of order) {
    const take = Math.min(stock[id][key] ?? 0, left)
    if (take > 0) {
      stock[id] = { ...stock[id], [key]: stock[id][key] - take }
      left -= take
    }
  }
  productsStore.update(productId, { stock })
}

/**
 * The photos to show for a chosen variant: its value's own, or else the product's in the
 * reader's language. A language without photos borrows the other one's.
 */
export function photosOf(product: Product, lang: Lang, valueIds: string[] = []) {
  const own = valueIds.map((valueId) => product.valueImages[valueId]).find((list) => list?.length)
  if (own) return own
  const all = [product.images[lang], ...Object.values(product.images)]
  return all.find((list) => list.length > 0) ?? []
}

/** What shoppers can see: visible products from every shop. */
export const useCatalog = () => {
  const all = productsStore.useAll()
  return useMemo(() => all.filter((product) => product.active), [all])
}

export const getProduct = (id: string | undefined) => productsStore.get(id)
export const getStore = (id: string | undefined) => stores.find((s) => s.id === id)
