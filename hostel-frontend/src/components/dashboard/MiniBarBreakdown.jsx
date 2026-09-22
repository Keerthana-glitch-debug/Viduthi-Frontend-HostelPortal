const TONE_VAR = { pink: 'var(--accent-border)', blue: 'var(--blue-border)', teal: 'var(--teal-border)' }

export default function MiniBarBreakdown({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <div className="bar-breakdown">
      {rows.map((row) => (
        <div className="bar-row" key={row.label}>
          <span className="bar-row-label">{row.label}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(row.value / max) * 100}%`, background: TONE_VAR[row.tone] || 'var(--blue-border)' }}
            />
          </div>
          <span className="bar-row-value mono">{row.value}</span>
        </div>
      ))}
    </div>
  )
}
