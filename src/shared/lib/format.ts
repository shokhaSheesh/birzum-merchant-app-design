const NBSP = ' '

/** 12480000 -> "12 480 000" */
export function groupDigits(value: number | string) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
}

/** 12480000 -> "12 480 000 UZS" */
export function formatSum(amount: number, withCurrency = true) {
  const grouped = groupDigits(Math.round(amount))
  return withCurrency ? `${grouped}${NBSP}UZS` : grouped
}

/** -> "12.10.2026" */
export function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}
