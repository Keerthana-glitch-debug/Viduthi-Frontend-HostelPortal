/**
 * Universal CSV Export Helper for Vidudhi Hostel Portal
 * Exports array of records into a downloadable .csv file with UTF-8 BOM (for Excel compatibility).
 */

export function exportToCsv(filename, data, columnMapping = null) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('[exportToCsv] No data available for export')
    return false
  }

  // Determine headers and accessors
  let headers = []
  let accessors = []

  if (columnMapping && typeof columnMapping === 'object') {
    accessors = Object.keys(columnMapping)
    headers = Object.values(columnMapping)
  } else {
    accessors = Object.keys(data[0])
    headers = accessors.map((k) =>
      k
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim()
    )
  }

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""'
    let str = typeof val === 'object' ? JSON.stringify(val) : String(val)
    str = str.replace(/"/g, '""')
    str = str.replace(/(\r\n|\n|\r)/gm, ' ')
    return `"${str}"`
  }

  const csvRows = []
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','))

  for (const row of data) {
    const rowValues = accessors.map((key) => escapeCell(row[key]))
    csvRows.push(rowValues.join(','))
  }

  const csvContent = '\uFEFF' + csvRows.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const cleanFilename = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', cleanFilename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return true
}
