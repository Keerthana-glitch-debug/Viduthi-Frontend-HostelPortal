import { useEffect, useRef } from 'react'

/**
 * A declarative setInterval. Pass `delay = null` to pause it.
 * Used to tick the register clock in the top bar every second.
 */
export default function useInterval(callback, delay) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return undefined
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}
