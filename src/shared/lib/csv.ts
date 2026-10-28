/**
 * Saves rows as a CSV file Excel opens straight away: semicolons between cells and a byte-order
 * mark, so Cyrillic and oʻ/gʻ show correctly.
 */
export function downloadCsv(fileName: string, rows: (string | number)[][]) {
  const cell = (value: string | number) => {
    const text = String(value)
    return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const body = rows.map((row) => row.map(cell).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿', body], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
