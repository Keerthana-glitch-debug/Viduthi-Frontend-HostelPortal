const STATUS_MAP = {
  Open: 'info', 'In Progress': 'warn', Resolved: 'ok',
  Pending: 'warn', 'Pending Approval': 'warn', Approved: 'ok', Rejected: 'bad',
  Available: 'ok', Full: 'bad', Maintenance: 'warn',
  'Checked In': 'ok', 'Checked Out': 'info',
  High: 'bad', Medium: 'warn', Low: 'info',
  Issued: 'warn', Returned: 'ok', Completed: 'ok',
  Operational: 'ok', Busy: 'warn', Critical: 'bad',
  Active: 'bad', Dispatched: 'warn',
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
