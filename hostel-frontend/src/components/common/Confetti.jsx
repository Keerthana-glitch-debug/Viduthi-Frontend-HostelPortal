import { useEffect, useMemo, useState } from 'react'
import './Confetti.css'

const COLORS = ['var(--accent)', 'var(--blue)', 'var(--teal)', 'var(--accent-border)', 'var(--blue-border)']

export default function Confetti({ active, onDone }) {
  const [show, setShow] = useState(active)

  useEffect(() => {
    if (!active) return undefined
    setShow(true)
    const timer = setTimeout(() => { setShow(false); onDone?.() }, 1100)
    return () => clearTimeout(timer)
  }, [active, onDone])

  const pieces = useMemo(() => Array.from({ length: 26 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.25,
    duration: 0.9 + Math.random() * 0.6,
    rotate: Math.random() * 360,
    color: COLORS[i % COLORS.length],
  })), [active])

  if (!show) return null

  return (
    <div className="confetti-burst" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}
