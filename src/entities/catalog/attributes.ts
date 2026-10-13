import type { LocalizedText } from '@/shared/i18n/dictionaries'
import { createStore } from '@/shared/lib/createStore'

/**
 * The merchant's directory of things a product can vary by: color, memory and so on.
 * Each is named once per language and reused on every product, so names stay consistent
 * and shoppers can later filter by them.
 */
export type AttributeValue = {
  id: string
  name: LocalizedText
  /** For colors: the color itself, shown as a swatch. */
  swatch?: string
}
export type Attribute = {
  id: string
  name: LocalizedText
  color: boolean
  values: AttributeValue[]
}

// Colors a merchant can give a color value. Data, not theme: they describe the product.
export const SWATCH_PRESETS = [
  '#2b3440',
  '#f4f5f6',
  '#b9c1c7',
  '#3f74b8',
  '#5aa277',
  '#8468c4',
  '#c9484a',
  '#d6b36a',
]

const same = (text: string): LocalizedText => ({ uz: text, ru: text })

// Invented sample directory. Replace with the API.
export const seedAttributes: Attribute[] = [
  {
    id: 'color',
    name: { uz: 'Rang', ru: 'Цвет' },
    color: true,
    values: [
      { id: 'black', name: { uz: 'Qora', ru: 'Чёрный' }, swatch: '#2b3440' },
      { id: 'white', name: { uz: 'Oq', ru: 'Белый' }, swatch: '#f4f5f6' },
      { id: 'silver', name: { uz: 'Kumush', ru: 'Серебристый' }, swatch: '#b9c1c7' },
      { id: 'blue', name: { uz: 'Koʻk', ru: 'Синий' }, swatch: '#3f74b8' },
      { id: 'green', name: { uz: 'Yashil', ru: 'Зелёный' }, swatch: '#5aa277' },
      { id: 'violet', name: { uz: 'Binafsha', ru: 'Фиолетовый' }, swatch: '#8468c4' },
      { id: 'red', name: { uz: 'Qizil', ru: 'Красный' }, swatch: '#c9484a' },
    ],
  },
  {
    id: 'memory',
    name: { uz: 'Xotira', ru: 'Память' },
    color: false,
    values: [
      { id: '128', name: same('128 GB') },
      { id: '256', name: same('256 GB') },
      { id: '512', name: same('512 GB') },
    ],
  },
  {
    id: 'ram',
    name: { uz: 'Operativ xotira', ru: 'Оперативная память' },
    color: false,
    values: [
      { id: 'ram8', name: same('8 GB') },
      { id: 'ram16', name: same('16 GB') },
    ],
  },
  {
    id: 'load',
    name: { uz: 'Sigʻimi', ru: 'Загрузка' },
    color: false,
    values: [
      { id: 'kg7', name: { uz: '7 kg', ru: '7 кг' } },
      { id: 'kg9', name: { uz: '9 kg', ru: '9 кг' } },
    ],
  },
  {
    id: 'power',
    name: { uz: 'Quvvati', ru: 'Мощность' },
    color: false,
    values: [
      { id: 'btu12', name: same('12') },
      { id: 'btu18', name: same('18') },
    ],
  },
]

export const attributesStore = createStore<Attribute>(seedAttributes)
