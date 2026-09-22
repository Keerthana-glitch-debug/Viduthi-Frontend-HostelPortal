const STATUS_MAP = {
  Open: 'info', 'In Progress': 'warn', Resolved: 'ok',
  Pending: 'warn', 'Pending Approval': 'warn', Approved: 'ok', Rejected: 'bad',
  Available: 'ok', Full: 'bad', Maintenance: 'warn',
  'Checked In': 'ok', 'Checked Out': 'info',
  High: 'priority-high',
  Medium: 'priority-med',
  Med: 'priority-med',
  Low: 'priority-low',
  Issued: 'warn', Returned: 'ok', Completed: 'ok',
  Operational: 'ok', Busy: 'warn', Critical: 'bad',
  Active: 'bad', Dispatched: 'warn',
}

export default function Badge({ children, tone }) {
  let resolved = tone || STATUS_MAP[children]
  if (!resolved && typeof children === 'string') {
    const lower = children.toLowerCase()
    if (lower.startsWith('high')) resolved = 'priority-high'
    else if (lower.startsWith('med')) resolved = 'priority-med'
    else if (lower.startsWith('low')) resolved = 'priority-low'
  }
  if (!resolved) resolved = 'info'

  return (
    <span className={`badge badge-${resolved}`}>
      <span className="badge-dot" />
      {children}
    </span>
  )
}
