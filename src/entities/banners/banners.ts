import type { Category } from '@/entities/catalog/products'
import type { Lang, LocalizedText } from '@/shared/i18n/dictionaries'

/**
 * Where a banner leads. The super admin picks exactly one kind: several products, several
 * categories, several shops, or the shops nearest to the shopper (the backend finds those).
 */
export type BannerTarget =
  | { kind: 'products'; ids: string[] }
  | { kind: 'categories'; ids: Category[] }
  | { kind: 'stores'; ids: string[] }
  | { kind: 'nearest' }

/**
 * A banner in the carousel on the client's Bosh sahifa, managed in the admin's Tanishtiruv
 * ("Bosh sahifa bannerlari"). The admin uploads a picture per language with the text in it;
 * the seeded ones have none and are drawn by the app from `title`, `action` and `tone`.
 */
export type Banner = {
  id: string
  image?: Partial<Record<Lang, string>>
  title: LocalizedText
  action: LocalizedText
  tone: 'navy' | 'green'
  target: BannerTarget
  visible: boolean
  /** Shown from and until these days, both included. Either may be left open. */
  startsOn?: string
  endsOn?: string
}

/** Texts 1 and 2 come from the client; 3 and 4 are placeholders until they send theirs. */
export const banners: Banner[] = [
  {
    id: 'b1',
    title: {
      uz: 'Sizga eng yaqin doʻkondan xarid qiling',
      ru: 'Покупайте в ближайшем к вам магазине',
    },
    action: { uz: 'Doʻkonlarni koʻrish', ru: 'Смотреть магазины' },
    tone: 'navy',
    target: { kind: 'nearest' },
    visible: true,
  },
  {
    id: 'b2',
    title: {
      uz: 'Xaridni amalga oshiring va toʻlovni boʻlib toʻlang',
      ru: 'Совершите покупку и платите частями',
    },
    action: { uz: 'Boshlash', ru: 'Начать' },
    tone: 'green',
    target: { kind: 'products', ids: ['p1', 'p2', 'p3', 'p4'] },
    visible: true,
  },
  {
    id: 'b3',
    title: { uz: 'Telefon va noutbuklar nasiyaga', ru: 'Телефоны и ноутбуки в рассрочку' },
    action: { uz: 'Tanlash', ru: 'Выбрать' },
    tone: 'navy',
    target: { kind: 'categories', ids: ['phones', 'laptops'] },
    visible: true,
  },
  {
    id: 'b4',
    title: {
      uz: 'Mediapark va iSpace doʻkonlaridan xarid qiling',
      ru: 'Покупайте в магазинах Mediapark и iSpace',
    },
    action: { uz: 'Doʻkonlarga oʻtish', ru: 'К магазинам' },
    tone: 'green',
    target: { kind: 'stores', ids: ['s1', 's2'] },
    visible: true,
  },
]

const today = () => new Date().toISOString().slice(0, 10)

/** The banners the app shows now: switched on and inside their dates. */
export const liveBanners = () =>
  banners.filter(
    (banner) =>
      banner.visible &&
      (!banner.startsOn || banner.startsOn <= today()) &&
      (!banner.endsOn || banner.endsOn >= today()),
  )
