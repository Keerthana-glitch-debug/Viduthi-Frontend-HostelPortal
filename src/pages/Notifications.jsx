import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, CheckCheck } from 'lucide-react'
import EmptyState from '../components/common/EmptyState'
import { selectNotifications, fetchNotifications, markRead, markAllRead } from '../store/slices/notificationsSlice'

const TYPE_TONE = { success: 'ok', warning: 'warn', info: 'info' }

export default function Notifications() {
  const dispatch = useDispatch()
  const notifications = useSelector(selectNotifications)
  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Updates</span>
          <h1>Notifications</h1>
        </div>
        {unread > 0 && (
          <button className="btn btn-ghost" onClick={() => dispatch(markAllRead())}><CheckCheck size={15} /> Mark all as read</button>
        )}
      </div>

      <div className="panel">
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="You're all caught up" message="No notifications right now." />
        ) : (
          <div className="activity-feed" style={{ gap: 4 }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                className="activity-item notification-row"
                onClick={() => dispatch(markRead(n.id))}
                style={{ background: n.read ? 'transparent' : 'var(--surface-2)' }}
              >
                <span className={`activity-dot tone-${TYPE_TONE[n.type]}`} />
                <div>
                  <div className="activity-text" style={{ fontWeight: n.read ? 500 : 700 }}>{n.title}</div>
                  <div className="activity-text" style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>{n.message}</div>
                  <div className="activity-time" style={{ marginTop: 4 }}>{n.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
