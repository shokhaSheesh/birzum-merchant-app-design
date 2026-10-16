import type { LocalizedText } from '@/shared/i18n/dictionaries'
import type { Category } from './products'

/**
 * A subcategory under one of the categories, one level deep. The super admin creates them;
 * a merchant must pick one when the product's category has any.
 */
export type Subcategory = { id: string; parent: Category; name: LocalizedText }

// Mirrors the admin panel's sample categories. Replace with the API.
export const SUBCATEGORIES: Subcategory[] = [
  { id: 'smartphones', parent: 'phones', name: { uz: 'Smartfonlar', ru: 'Смартфоны' } },
  {
    id: 'feature-phones',
    parent: 'phones',
    name: { uz: 'Tugmali telefonlar', ru: 'Кнопочные телефоны' },
  },
  {
    id: 'washers',
    parent: 'appliances',
    name: { uz: 'Kir yuvish mashinalari', ru: 'Стиральные машины' },
  },
  { id: 'fridges', parent: 'appliances', name: { uz: 'Muzlatgichlar', ru: 'Холодильники' } },
  {
    id: 'air-conditioners',
    parent: 'appliances',
    name: { uz: 'Konditsionerlar', ru: 'Кондиционеры' },
  },
]

export const subcategoriesOf = (category: Category | null) =>
  SUBCATEGORIES.filter((sub) => sub.parent === category)

export const getSubcategory = (id: string | undefined) => SUBCATEGORIES.find((sub) => sub.id === id)
