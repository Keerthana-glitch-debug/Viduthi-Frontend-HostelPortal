import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Bell, CheckCheck, Megaphone, Send, AlertTriangle, Info,
  CheckCircle2, Stethoscope, UtensilsCrossed, ShieldAlert,
} from 'lucide-react'
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
  warning: { icon: AlertTriangle, color: '#DC2626', label: 'Urgent' },
  success: { icon: CheckCircle2, color: '#059669', label: 'Notice' },
  info: { icon: Info, color: '#0284C7', label: 'General' },
}

export default function Notifications() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const notifications = useSelector(selectNotifications)

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

  // Strict Role-Based Scoping to avoid mixing common notices
  const roleScoped = notifications.filter((n) => {
    if (role === 'doctor') {
      return (
        n.roleTarget === 'doctor' ||
        n.category === 'medical' ||
        (n.target && (n.target.toLowerCase().includes('clinic') || n.target.toLowerCase().includes('health'))) ||
        (n.title && (
          n.title.toLowerCase().includes('fever') ||
          n.title.toLowerCase().includes('health') ||
          n.title.toLowerCase().includes('medical') ||
          n.title.toLowerCase().includes('clinic') ||
          n.title.toLowerCase().includes('ambulance') ||
          n.title.toLowerCase().includes('medicine') ||
          n.title.toLowerCase().includes('infirmary') ||
          n.title.toLowerCase().includes('vitals')
        ))
      )
    }

    if (role === 'mess_manager') {
      return (
        n.roleTarget === 'mess_manager' ||
        n.category === 'mess' ||
        (n.target && (n.target.toLowerCase().includes('mess') || n.target.toLowerCase().includes('kitchen') || n.target.toLowerCase().includes('dining'))) ||
        (n.title && (
          n.title.toLowerCase().includes('mess') ||
          n.title.toLowerCase().includes('food') ||
          n.title.toLowerCase().includes('dinner') ||
          n.title.toLowerCase().includes('grocery') ||
          n.title.toLowerCase().includes('kitchen') ||
          n.title.toLowerCase().includes('lpg') ||
          n.title.toLowerCase().includes('meal') ||
          n.title.toLowerCase().includes('hygiene') ||
          n.title.toLowerCase().includes('audit') ||
          n.title.toLowerCase().includes('vegetable')
        ))
      )
    }

    if (role === 'student') {
      return (
        n.roleTarget === 'student' ||
        n.category === 'student' ||
        n.roleTarget === 'all' ||
        n.target?.toLowerCase().includes('all') ||
        n.target?.toLowerCase().includes('resident') ||
        (!n.roleTarget && n.category !== 'medical' && n.category !== 'mess')
      )
    }

    // Warden & Admin see everything
    return true
  })

  const filtered = filterType === 'all'
    ? roleScoped
    : roleScoped.filter((n) => n.type === filterType)

  const unreadCount = roleScoped.filter((n) => !n.read).length

  const handleBroadcast = (e) => {
    e.preventDefault()
    if (!draft.title.trim() || !draft.message.trim()) {
      dispatch(pushToast({ message: 'Please provide both title and notice message.', tone: 'warn' }))
      return
    }

    dispatch(
      addNotification({
        title: draft.title.trim(),
        message: draft.message.trim(),
        type: draft.type,
        target: draft.target,
        author: user?.name || 'Jeyanthi (Chief Warden)',
      })
    )
    dispatch(pushToast({ message: 'Official notice published to all resident dashboards.', tone: 'ok' }))
    setDraft({ title: '', message: '', type: 'warning', target: 'All Residents (Block A & B)' })
    setShowBroadcastModal(false)
  }

  const pageTitle =
    role === 'doctor'
      ? 'Clinic & Health Notices'
      : role === 'mess_manager'
      ? 'Mess & Kitchen Circulars'
      : role === 'student'
      ? 'Hostel Bulletins & Notices'
      : 'Hostel Circulars & Broadcasts'

  const pageEyebrow =
    role === 'doctor'
      ? 'Campus Health Center'
      : role === 'mess_manager'
      ? 'Dining & Catering Services'
      : role === 'student'
      ? 'Resident Bulletins'
      : 'Central Broadcast Desk'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {role === 'doctor' ? (
              <Stethoscope size={13} />
            ) : role === 'mess_manager' ? (
              <UtensilsCrossed size={13} />
            ) : (
              <Bell size={13} />
            )}
            {pageEyebrow}
          </span>
          <h1>{pageTitle}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {unreadCount > 0 && (
            <button className="btn btn-ghost" onClick={() => dispatch(markAllRead())}>
              <CheckCheck size={15} /> Mark all read ({unreadCount})
            </button>
          )}
          {role === 'warden' && (
            <button className="btn btn-primary" onClick={() => setShowBroadcastModal(true)}>
              <Megaphone size={16} /> Broadcast Circular
            </button>
          )}
        </div>
      </div>

      {/* Role-specific operational scope banners */}
      {role === 'doctor' && (
        <div
          className="panel"
          style={{
            background: 'var(--surface-2)',
            border: '1.5px solid var(--line-strong)',
            padding: '14px 18px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Stethoscope size={20} color="#059669" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
            <strong>Clinic Operational Scope:</strong> Viewing official campus medical notices, health advisories, pharmacy stock updates, and ambulance standby circulars only. General room and mess tickets are isolated.
          </div>
        </div>
      )}

      {role === 'mess_manager' && (
        <div
          className="panel"
          style={{
            background: 'var(--surface-2)',
            border: '1.5px solid var(--line-strong)',
            padding: '14px 18px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <UtensilsCrossed size={20} color="#D97706" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
            <strong>Dining Operations Scope:</strong> Viewing kitchen grocery deliveries, food safety hygiene audits, gas cylinder refills, and dining committee menus only. General dorm notices are isolated.
          </div>
        </div>
      )}

      {role === 'warden' && (
        <div
          className="panel"
          style={{
            background: 'var(--surface-2)',
            border: '1.5px solid var(--line-strong)',
            padding: '14px 18px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Megaphone size={20} color="var(--accent-border)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
            <strong>Warden Circular Authority:</strong> You can broadcast emergency notices, water maintenance, or curfew announcements directly to student and staff portals.
          </div>
        </div>
      )}

      <div className="panel" style={{ background: 'var(--surface)', border: '1.5px solid var(--line)' }}>
        {/* Filter Bar with High Contrast Buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            { key: 'all', label: `All Notices (${roleScoped.length})` },
            { key: 'warning', label: 'Urgent Alerts' },
            { key: 'info', label: 'General Circulars' },
            { key: 'success', label: 'Updates' },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              className={`btn btn-sm ${filterType === f.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterType(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notices found"
            message="There are currently no active bulletins in this category."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((n, idx) => {
              const noticeId = n.id || n._id || `notif-${idx}`
              const cfg = (n.type && TYPE_CONFIG[n.type]) || TYPE_CONFIG.info
              const IconComp = cfg?.icon || Info

              return (
                <div
                  key={noticeId}
                  onClick={() => dispatch(markRead(noticeId))}
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                    padding: 16,
                    borderRadius: 12,
                    border: '1.5px solid',
                    borderColor: n.read ? 'var(--line-strong)' : 'var(--accent-border)',
                    background: n.read ? 'var(--surface)' : 'var(--accent-soft)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: 'var(--shadow-tag)',
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cfg.color,
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={18} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.98rem',
                            color: 'var(--text-main)',
                            lineHeight: 1.3,
                          }}
                        >
                          {n.title}
                        </span>
                        {!n.read && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: 'var(--accent-border, #10B981)',
                              display: 'inline-block',
                            }}
                          />
                        )}
                      </div>
                      <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--ink-faint)' }}>
                        {n.date || 'Just Now'}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '0.88rem',
                        color: 'var(--text-muted)',
                        marginTop: 6,
                        lineHeight: 1.5,
                      }}
                    >
                      {n.message}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        marginTop: 10,
                        fontSize: '0.78rem',
                        color: 'var(--ink-faint)',
                      }}
                    >
                      <span>
                        Issued by: <strong style={{ color: 'var(--text-main)' }}>{n.author || 'Hostel Administration'}</strong>
                      </span>
                      {n.target && (
                        <span>
                          Target: <strong style={{ color: 'var(--text-main)' }}>{n.target}</strong>
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
          subtitle="Publish an announcement directly to student resident portals"
          onClose={() => setShowBroadcastModal(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowBroadcastModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleBroadcast}>
                <Send size={15} /> Publish &amp; Broadcast
              </button>
            </div>
          }
        >
          <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Notice Headline *</label>
              <input
                className="input"
                required
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="e.g. Scheduled Overhead Water Tank Cleaning"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Severity</label>
                <select
                  className="input"
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value })}
                >
                  <option value="warning">Urgent Advisory (Amber / Red)</option>
                  <option value="info">General Information (Blue)</option>
                  <option value="success">Operational Notice (Green)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Target Group</label>
                <select
                  className="input"
                  value={draft.target}
                  onChange={(e) => setDraft({ ...draft, target: e.target.value })}
                >
                  <option value="All Residents (Block A & B)">All Residents (Block A &amp; B)</option>
                  <option value="Block A Residents Only">Block A Residents Only</option>
                  <option value="Block B Residents Only">Block B Residents Only</option>
                  <option value="Mess Kitchen Staff">Mess Kitchen Staff</option>
                  <option value="Health Center & Clinic">Health Center &amp; Clinic</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>Notice Message *</label>
              <textarea
                className="input"
                rows={4}
                required
                value={draft.message}
                onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                placeholder="Write clear details in simple words..."
              />
            </div>

            <div
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--line)',
                padding: 10,
                borderRadius: 8,
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
              }}
            >
              Sign-off: <strong>{user?.name || 'Jeyanthi'} (Chief Warden)</strong> · Time: {new Date().toLocaleTimeString()}
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
