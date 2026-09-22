import { useMemo } from 'react'
import './BackgroundDecor.css'

function Sparkles() {
  const dots = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 4,
    duration: 2.5 + Math.random() * 2.5,
  })), [])
  return (
    <div className="decor decor-sparkles" aria-hidden="true">
      {dots.map((d) => (
        <span
          key={d.id}
          style={{
            top: `${d.top}%`, left: `${d.left}%`,
            width: d.size, height: d.size,
            animationDelay: `${d.delay}s`, animationDuration: `${d.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

function Bubbles() {
  const bubbles = useMemo(() => Array.from({ length: 16 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 14 + Math.random() * 34,
    delay: Math.random() * 10,
    duration: 10 + Math.random() * 10,
  })), [])
  return (
    <div className="decor decor-bubbles" aria-hidden="true">
      {bubbles.map((b) => (
        <span
          key={b.id}
          style={{
            left: `${b.left}%`,
            width: b.size, height: b.size,
            animationDelay: `${b.delay}s`, animationDuration: `${b.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

function PawPrints() {
  // A single paw SVG, tiled and lightly rotated at randomized positions —
  // reads as a subtle pattern rather than clutter.
  const paws = useMemo(() => Array.from({ length: 22 }).map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    rotate: Math.random() * 360,
    scale: 0.6 + Math.random() * 0.6,
  })), [])
  return (
    <div className="decor decor-paws" aria-hidden="true">
      {paws.map((p) => (
        <svg
          key={p.id}
          viewBox="0 0 64 64"
          className="paw-print"
          style={{ top: `${p.top}%`, left: `${p.left}%`, transform: `rotate(${p.rotate}deg) scale(${p.scale})` }}
        >
          <ellipse cx="32" cy="42" rx="14" ry="12" />
          <ellipse cx="14" cy="24" rx="7" ry="9" />
          <ellipse cx="30" cy="14" rx="7" ry="9" />
          <ellipse cx="48" cy="24" rx="7" ry="9" />
        </svg>
      ))}
    </div>
  )
}

export default function BackgroundDecor({ theme }) {
  if (theme === 'bubbles') return <Bubbles />
  if (theme === 'pawprints') return <PawPrints />
  return null
}
