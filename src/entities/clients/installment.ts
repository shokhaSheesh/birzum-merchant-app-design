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

// Rates as shown by the web calculator. The real ones come from the backend.
const MARKUP_PERCENT: Record<Term, number> = { 3: 15, 6: 25, 9: 30, 12: 38, 18: 55, 24: 72 }

export function installmentTerms(financed: number, term: Term): InstallmentTerms {
  const markupPercent = MARKUP_PERCENT[term]
  const installmentTotal = Math.round(financed * (1 + markupPercent / 100))
  return {
    term,
    markupPercent,
    installmentTotal,
    monthlyPayment: Math.floor(installmentTotal / term),
  }
}

/** Terms for every available term, shortest first. */
export const allInstallmentTerms = (financed: number) =>
  TERMS.map((term) => installmentTerms(financed, term))
