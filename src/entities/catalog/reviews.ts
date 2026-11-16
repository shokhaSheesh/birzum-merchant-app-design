import { createStore } from '@/shared/lib/createStore'

/**
 * What a shopper said about one product they bought. Shown on the product's page; the shop's
 * rating is the average of its products' reviews.
 */
export type Review = {
  id: string
  storeId: string
  productId: string
  /** The purchase (ariza) it was left from: one review per product per purchase. */
  applicationId?: number
  author: string
  /** 1 to 5. */
  rating: number
  text: string
  date: Date
  productName: string
  /** The shop's public answer, written in the merchant app. Shown under the review. */
  reply?: { text: string; date: Date }
}

/** Average stars and how many reviews, for a list of reviews. */
export function ratingOf(reviews: Review[]) {
  const count = reviews.length
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / (count || 1)
  return { average, count }
}

/** A product's reviews, newest first. */
export function useProductReviews(productId: string) {
  return reviewsStore
    .useAll()
    .filter((review) => review.productId === productId)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}

// Invented sample reviews. Replace with the API.
export const reviewsStore = createStore<Review>([
  {
    id: 'rv1',
    storeId: 's1',
    author: 'Dilnoza K.',
    rating: 5,
    text: 'Telefonni oʻsha kuniyoq oldim, sotuvchi hammasini tushuntirib berdi.',
    date: new Date(2026, 9, 9),
    productName: 'iPhone 18 Pro',
    productId: 'p1',
  },
  {
    id: 'rv2',
    storeId: 's1',
    author: 'Jasur T.',
    rating: 4,
    text: 'Narxi yaxshi, lekin rasmiylashtirish biroz choʻzildi.',
    date: new Date(2026, 9, 4),
    productName: 'Televizor 43',
    productId: 'p2',
  },
  {
    id: 'rv3',
    storeId: 's1',
    author: 'Malika Y.',
    rating: 5,
    text: 'Kir yuvish mashinasini oʻrnatishda ham yordam berishdi. Rahmat!',
    date: new Date(2026, 8, 27),
    productName: 'Artel kir yuvish mashinasi',
    productId: 'p7',
  },
  {
    id: 'rv4',
    storeId: 's1',
    author: 'Bobur R.',
    rating: 3,
    text: 'Mahsulot yaxshi, ammo kerakli rang omborda yoʻq edi.',
    reply: {
      text: 'Rahmat! Endi barcha ranglar omborda bor, keyingi safar albatta topasiz.',
      date: new Date(2026, 8, 16),
    },
    date: new Date(2026, 8, 15),
    productName: 'iPhone 18 Pro',
    productId: 'p1',
  },
  {
    id: 'rv5',
    storeId: 's2',
    author: 'Otabek E.',
    rating: 5,
    text: 'Kir yuvish mashinasini ertasi kuni yetkazib berishdi.',
    date: new Date(2026, 9, 2),
    productName: 'LG kir yuvish mashinasi',
    productId: 'p3',
  },
  {
    id: 'rv6',
    storeId: 's2',
    author: 'Sevara N.',
    rating: 4,
    text: 'Noutbuk yaxshi, sumkasini ham sovgʻa qilishdi.',
    date: new Date(2026, 8, 20),
    productName: 'Lenovo IdeaPad noutbuk',
    productId: 'p4',
  },
  {
    id: 'rv7',
    storeId: 's3',
    author: 'Sardor Q.',
    rating: 5,
    text: 'Samarqandda eng yaxshi narx shu yerda ekan.',
    date: new Date(2026, 8, 30),
    productName: 'iPhone 18',
    productId: 'p5',
  },
  {
    id: 'rv8',
    storeId: 's3',
    author: 'Gulnora A.',
    rating: 4,
    text: 'Televizor zoʻr, lekin navbat uzun edi.',
    date: new Date(2026, 8, 11),
    productName: 'Televizor 55 Smart',
    productId: 'p6',
  },
])
