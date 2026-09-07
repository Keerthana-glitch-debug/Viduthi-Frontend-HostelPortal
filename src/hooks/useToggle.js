import { useState, useCallback } from 'react'

/**
 * Simple boolean toggle hook.
 * Used across the app for theme switching, sidebar collapse, and modal visibility.
 */
export default function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue((v) => !v), [])
  return [value, toggle, setValue]
}
