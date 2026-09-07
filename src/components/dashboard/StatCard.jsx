export default function StatCard({ icon: Icon, label, value, delta, tone = 'teal' }) {
  return (
    <div className="stat-card card">
      <div className={`stat-icon tone-${tone}`}>
        <Icon size={19} strokeWidth={1.8} />
      </div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {delta && <span className="stat-delta">{delta}</span>}
      </div>
    </div>
  )
}
