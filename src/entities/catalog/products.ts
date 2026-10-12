export const CATEGORIES = ['phones', 'tvs', 'appliances', 'laptops'] as const
export type Category = (typeof CATEGORIES)[number]

export type Store = { id: string; name: string; address: string }

/** A choice the shopper makes on a product, e.g. memory or color. An option may change the price. */
export type Variation = { name: string; options: { label: string; priceDelta?: number }[] }

export type Product = {
  id: string
  name: string
  category: Category
  /** Base price in UZS, before variation price changes. */
  price: number
  storeId: string
  /** Pieces available. Zero means out of stock. */
  stock: number
  description: string
  variations: Variation[]
  /** Label and value pairs, in display order. */
  specs: [string, string][]
}

// Invented sample shops and catalogue. Replace with the API.
export const stores: Store[] = [
  { id: 's1', name: 'Mega Texno', address: 'Toshkent, Chilonzor' },
  { id: 's2', name: 'Texno Dunyo', address: 'Toshkent, Yunusobod' },
  { id: 's3', name: 'Elektro Market', address: 'Samarqand, Registon koʻchasi' },
]

const colors = (...labels: string[]): Variation => ({
  name: 'Rang',
  options: labels.map((label) => ({ label })),
})

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Samsung Galaxy A55',
    category: 'phones',
    price: 5_500_000,
    storeId: 's1',
    stock: 12,
    description:
      'Katta AMOLED ekranli, suvga chidamli smartfon. 50 MP asosiy kamera va bir kunga yetadigan batareya.',
    variations: [
      { name: 'Xotira', options: [{ label: '128 GB' }, { label: '256 GB', priceDelta: 600_000 }] },
      colors('Qora', 'Koʻk', 'Binafsha'),
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
    price: 6_900_000,
    storeId: 's2',
    stock: 3,
    description:
      'Bugʻ bilan yuvish rejimiga ega avtomat mashina. Jim ishlaydi va elektr energiyasini tejaydi.',
    variations: [
      { name: 'Sigʻimi', options: [{ label: '7 kg' }, { label: '9 kg', priceDelta: 1_100_000 }] },
      colors('Oq', 'Kumush'),
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
    price: 3_300_000,
    storeId: 's3',
    stock: 20,
    description: 'Hamyonbop smartfon: 120 Gts ekran, tez quvvatlash va 108 MP kamera.',
    variations: [
      { name: 'Xotira', options: [{ label: '128 GB' }, { label: '256 GB', priceDelta: 400_000 }] },
      colors('Qora', 'Yashil'),
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
    price: 6_500_000,
    storeId: 's3',
    stock: 4,
    description: 'Kundalik ishlar uchun ishonchli noutbuk. Katta ekran va qulay klaviatura.',
    variations: [
      {
        name: 'Operativ xotira',
        options: [{ label: '8 GB' }, { label: '16 GB', priceDelta: 800_000 }],
      },
      colors('Kumush', 'Qora'),
    ],
    specs: [
      ['Ekran', '15,6 dyuym, Full HD'],
      ['Protsessor', 'Intel Core i3'],
      ['SSD', '256 GB'],
      ['Kafolat', '12 oy'],
    ],
  },
]

export const getProduct = (id: string | undefined) => products.find((p) => p.id === id)
export const getStore = (id: string | undefined) => stores.find((s) => s.id === id)
