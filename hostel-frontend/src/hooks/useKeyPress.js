import { useEffect } from 'react'

/**
 * Calls `handler` whenever `targetKey` is pressed anywhere in the document.
 * Used for "Esc closes the modal" and "/ focuses search" shortcuts.
 */
export default function useKeyPress(targetKey, handler, deps = []) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === targetKey) handler(event)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey, ...deps])
}
