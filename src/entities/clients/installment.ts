import { TERMS, type Term } from './clients'

/** The smallest application total the service accepts, in UZS. */
export const MIN_APPLICATION_TOTAL = 100_000

export type InstallmentTerms = {
  term: Term
  markupPercent: number
  /** Financed amount plus markup, in UZS. */
  installmentTotal: number
  monthlyPayment: number
}

/** The shop's tariff, set by FlexSoft when the merchant is signed. It decides the markup. */
export const TARIFFS = ['A', 'B', 'C'] as const
export type Tariff = (typeof TARIFFS)[number]

// Mock rates per tariff; A is the web calculator's. The real ones come from FlexSoft.
const MARKUP_PERCENT: Record<Tariff, Record<Term, number>> = {
  A: { 3: 15, 6: 25, 9: 30, 12: 38, 18: 55, 24: 72 },
  B: { 3: 12, 6: 22, 9: 27, 12: 34, 18: 50, 24: 66 },
  C: { 3: 10, 6: 19, 9: 24, 12: 30, 18: 45, 24: 60 },
}

export function installmentTerms(
  financed: number,
  term: Term,
  tariff: Tariff = 'A',
): InstallmentTerms {
  const markupPercent = MARKUP_PERCENT[tariff][term]
  const installmentTotal = Math.round(financed * (1 + markupPercent / 100))
  return {
    term,
    markupPercent,
    installmentTotal,
    monthlyPayment: Math.floor(installmentTotal / term),
  }
}

/** Terms for every available term, shortest first. */
export const allInstallmentTerms = (financed: number, tariff: Tariff = 'A') =>
  TERMS.map((term) => installmentTerms(financed, term, tariff))
