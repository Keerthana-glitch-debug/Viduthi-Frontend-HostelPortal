import { useState, useEffect } from 'react'

/**
 * useState that persists to localStorage, keyed by `key`.
 * Falls back silently if storage is unavailable.
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable — no-op */
    }
  }, [key, value])

  return [value, setValue]
}
