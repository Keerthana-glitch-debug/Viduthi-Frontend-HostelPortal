import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, CheckCheck, Megaphone, Send, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import {
  selectNotifications,
  fetchNotifications,
  markRead,
  markAllRead,
  addNotification,
} from '../store/slices/notificationsSlice'
import { pushToast } from '../store/slices/uiSlice'

const TYPE_CONFIG = {
  warning: { icon: AlertTriangle, color: 'var(--accent-red)', label: 'Urgent' },
  success: { icon: CheckCircle2, color: 'var(--accent-green)', label: 'Notice' },
  info: { icon: Info, color: 'var(--accent-blue)', label: 'General' },
}

export default function Notifications() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const notifications = useSelector(selectNotifications)
  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  const [filterType, setFilterType] = useState('all')
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [draft, setDraft] = useState({
    title: '',
    message: '',
    type: 'warning',
    target: 'All Residents (Block A & B)',
  })

  const filtered = filterType === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filterType)

  const handleBroadcast = (e) => {
    e.preventDefault()
    if (!draft.title.trim() || !draft.message.trim()) {
      dispatch(pushToast('Please fill in title and circular message.', 'warn'))
      return
    }

    dispatch(
      addNotification({
        title: draft.title.trim(),
        message: draft.message.trim(),
        type: draft.type,
        target: draft.target,
        author: user?.name || 'Dr. R. Sundaram (Chief Warden)',
      })
    )
    dispatch(pushToast('Official notice successfully broadcasted to all residents.', 'ok'))
    setDraft({ title: '', message: '', type: 'warning', target: 'All Residents (Block A & B)' })
    setShowBroadcastModal(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Campus Bulletins &amp; Circulars</span>
          <h1>Notifications</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {unread > 0 && (
            <button className="btn btn-ghost" onClick={() => dispatch(markAllRead())}>
              <CheckCheck size={15} /> Mark all read ({unread})
            </button>
          )}
          {role === 'warden' && (
            <button className="btn btn-primary" onClick={() => setShowBroadcastModal(true)}>
              <Megaphone size={16} /> Broadcast Circular
            </button>
          )}
        </div>
      </div>

      {role === 'warden' && (
        <div className="panel" style={{ background: 'rgba(124, 252, 0, 0.05)', borderColor: 'rgba(124, 252, 0, 0.25)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Megaphone size={22} color="var(--accent-green)" />
            <div>
              <strong style={{ color: 'var(--accent-green)' }}>Warden Circular Console</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                You have administrative authority to draft and instantly broadcast emergency notices, maintenance schedules, or mess advisories directly to student resident devices.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="all">All notifications ({notifications.length})</option>
            <option value="warning">Urgent / Alerts</option>
            <option value="info">General Advisories</option>
            <option value="success">Operational Updates</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications here"
            message="No active bulletins or circulars in this category."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((n) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
              const IconComp = cfg.icon

              return (
                <div
                  key={n.id}
                  onClick={() => dispatch(markRead(n.id))}
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                    padding: 16,
                    borderRadius: 10,
                    border: '1px solid',
                    borderColor: n.read ? 'var(--line-weak, rgba(255,255,255,0.08))' : 'rgba(124, 252, 0, 0.35)',
                    background: n.read ? 'var(--surface)' : 'rgba(124, 252, 0, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cfg.color,
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={18} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: n.read ? 600 : 700, fontSize: '0.975rem', color: 'var(--text-main)' }}>
                          {n.title}
                        </span>
                        {!n.read && (
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)' }} />
                        )}
                      </div>
                      <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {n.date}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                      {n.message}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>
                        Issued by: <strong style={{ color: 'var(--text-main)' }}>{n.author || 'Hostel Administration'}</strong>
                      </span>
                      {n.target && (
                        <span>
                          Target: <strong style={{ color: 'var(--accent-green)' }}>{n.target}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Warden Broadcast Modal */}
      {showBroadcastModal && (
        <Modal
          title="Broadcast Warden Notice"
          subtitle="Publish an urgent announcement to all hostel resident portals"
          onClose={() => setShowBroadcastModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowBroadcastModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBroadcast}>
                <Send size={15} /> Publish &amp; Broadcast
              </button>
            </>
          }
        >
          <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Notice Headline</label>
              <input
                required
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="e.g. Scheduled Overhead Water Tank Cleaning — Block A & B"
              />
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label>Notification Severity</label>
                <select
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value })}
                >
                  <option value="warning">Urgent Advisory (Amber / Red)</option>
                  <option value="info">General Information (Blue)</option>
                  <option value="success">Operational Success / Event (Green)</option>
                </select>
              </div>

              <div style={{ flex: 1, minWidth: 160 }}>
                <label>Target Resident Cohort</label>
                <select
                  value={draft.target}
                  onChange={(e) => setDraft({ ...draft, target: e.target.value })}
                >
                  <option value="All Residents (Block A & B)">All Residents (Block A &amp; B)</option>
                  <option value="Block A Residents Only">Block A Residents Only</option>
                  <option value="Block B Residents Only">Block B Residents Only</option>
                  <option value="Mess Committee Members">Mess Committee Members</option>
                </select>
              </div>
            </div>

            <div>
              <label>Circular Announcement Body</label>
              <textarea
                rows={4}
                required
                value={draft.message}
                onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                placeholder="Details of the announcement, required resident precautions, timings, and emergency contacts..."
              />
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 10, borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Broadcast Signature: <strong>{user?.name || 'Dr. R. Sundaram'} (Chief Warden)</strong> · Time: {new Date().toLocaleTimeString()}
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
