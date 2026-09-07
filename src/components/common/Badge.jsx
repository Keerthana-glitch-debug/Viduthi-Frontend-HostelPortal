const STATUS_MAP = {
  Open: 'info', 'In Progress': 'warn', Resolved: 'ok',
  Pending: 'warn', Approved: 'ok', Rejected: 'bad',
  Available: 'ok', Full: 'bad', Maintenance: 'warn',
  'Checked In': 'ok', 'Checked Out': 'info',
  High: 'bad', Medium: 'warn', Low: 'info',
}

export default function Badge({ children, tone }) {
  const resolved = tone || STATUS_MAP[children] || 'info'
  return (
    <span className={`badge badge-${resolved}`}>
      <span className="badge-dot" />
      {children}
    </span>
  )
}
