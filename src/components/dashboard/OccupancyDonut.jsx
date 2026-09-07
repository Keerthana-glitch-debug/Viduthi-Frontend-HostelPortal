export default function OccupancyDonut({ percent, label, sublabel }) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className="donut-wrap">
      <div
        className="donut"
        style={{
          background: `conic-gradient(var(--accent-border) ${clamped * 3.6}deg, var(--surface-2) 0deg)`,
        }}
      >
        <div className="donut-hole">
          <span className="donut-value">{clamped}%</span>
          <span className="donut-label">{label}</span>
        </div>
      </div>
      {sublabel && <p className="donut-sub">{sublabel}</p>}
    </div>
  )
}
