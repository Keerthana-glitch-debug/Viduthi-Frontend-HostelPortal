import { useEffect, useState } from 'react'

/**
 * Returns a debounced copy of `value`, updated `delay` ms after
 * the last change. Used for search inputs so we don't churn on every keystroke.
 */
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
