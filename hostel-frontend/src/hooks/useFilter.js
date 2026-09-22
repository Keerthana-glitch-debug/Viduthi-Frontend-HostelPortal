import { useMemo, useState } from 'react'

/**
 * Generic search + status-filter hook for list/table pages.
 * `searchKeys` are the fields checked against the free-text query.
 * `statusKey` is the field checked against the active status filter ('all' = no filter).
 */
export default function useFilter(items, searchKeys = [], statusKey = 'status') {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = status === 'all' || item[statusKey] === status
      if (!matchesStatus) return false
      if (!query.trim()) return true
      const haystack = searchKeys.map((k) => String(item[k] ?? '').toLowerCase()).join(' ')
      return haystack.includes(query.toLowerCase())
    })
  }, [items, query, status, searchKeys, statusKey])

  return { query, setQuery, status, setStatus, filtered }
}
