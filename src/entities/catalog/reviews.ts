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
    productName: 'Samsung Galaxy A55',
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
    text: 'Konditsionerni oʻrnatishda ham yordam berishdi. Rahmat!',
    date: new Date(2026, 8, 27),
    productName: 'Artel konditsioner',
  },
  {
    id: 'rv4',
    storeId: 's1',
    author: 'Bobur R.',
    rating: 3,
    text: 'Mahsulot yaxshi, ammo kerakli rang omborda yoʻq edi.',
    date: new Date(2026, 8, 15),
    productName: 'Samsung Galaxy A55',
  },
])
