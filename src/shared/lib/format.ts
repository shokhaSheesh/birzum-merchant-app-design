const NBSP = ' '

/** 12480000 -> "12 480 000 soʻm" */
export function formatSum(amount: number, withCurrency = true) {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
  return withCurrency ? `${grouped}${NBSP}soʻm` : grouped
}
