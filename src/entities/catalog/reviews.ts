import { createStore } from '@/shared/lib/createStore'

/** What a shopper said about a shop after buying from it. */
export type Review = {
  id: string
  storeId: string
  author: string
  /** 1 to 5. */
  rating: number
  text: string
  date: Date
  productName: string
}

// Invented sample reviews of the signed-in merchant's shop. Replace with the API.
export const reviewsStore = createStore<Review>([
  {
    id: 'rv1',
    storeId: 's1',
    author: 'Dilnoza K.',
    rating: 5,
    text: 'Telefonni oʻsha kuniyoq oldim, sotuvchi hammasini tushuntirib berdi.',
    date: new Date(2026, 9, 9),
    productName: 'iPhone 18 Pro',
  },
  {
    id: 'rv2',
    storeId: 's1',
    author: 'Jasur T.',
    rating: 4,
    text: 'Narxi yaxshi, lekin rasmiylashtirish biroz choʻzildi.',
    date: new Date(2026, 9, 4),
    productName: 'Televizor 43',
  },
  {
    id: 'rv3',
    storeId: 's1',
    author: 'Malika Y.',
    rating: 5,
    text: 'Kir yuvish mashinasini oʻrnatishda ham yordam berishdi. Rahmat!',
    date: new Date(2026, 8, 27),
    productName: 'Artel kir yuvish mashinasi',
  },
  {
    id: 'rv4',
    storeId: 's1',
    author: 'Bobur R.',
    rating: 3,
    text: 'Mahsulot yaxshi, ammo kerakli rang omborda yoʻq edi.',
    date: new Date(2026, 8, 15),
    productName: 'iPhone 18 Pro',
  },
  {
    id: 'rv5',
    storeId: 's2',
    author: 'Otabek E.',
    rating: 5,
    text: 'Kir yuvish mashinasini ertasi kuni yetkazib berishdi.',
    date: new Date(2026, 9, 2),
    productName: 'LG kir yuvish mashinasi',
  },
  {
    id: 'rv6',
    storeId: 's2',
    author: 'Sevara N.',
    rating: 4,
    text: 'Noutbuk yaxshi, sumkasini ham sovgʻa qilishdi.',
    date: new Date(2026, 8, 20),
    productName: 'Lenovo IdeaPad noutbuk',
  },
  {
    id: 'rv7',
    storeId: 's3',
    author: 'Sardor Q.',
    rating: 5,
    text: 'Samarqandda eng yaxshi narx shu yerda ekan.',
    date: new Date(2026, 8, 30),
    productName: 'iPhone 18',
  },
  {
    id: 'rv8',
    storeId: 's3',
    author: 'Gulnora A.',
    rating: 4,
    text: 'Televizor zoʻr, lekin navbat uzun edi.',
    date: new Date(2026, 8, 11),
    productName: 'Televizor 55 Smart',
  },
])
