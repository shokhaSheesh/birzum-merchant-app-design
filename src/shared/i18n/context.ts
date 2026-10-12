import { createContext } from 'react'
import type { Lang, TranslationKey } from './dictionaries'

export type I18nValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
}

export const I18nContext = createContext<I18nValue | null>(null)
