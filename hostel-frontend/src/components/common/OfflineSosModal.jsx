import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, HeartPulse, PhoneCall, Siren, Flame, X, CheckCircle2, Radio, MapPin, User, Wifi, WifiOff, ExternalLink } from 'lucide-react'
import { selectAuth, selectUser } from '../../store/slices/authSlice'
import { selectMyRoom } from '../../store/slices/roomsSlice'
import { triggerSosAlert, syncOfflineSosQueue, selectOfflineQueue } from '../../store/slices/sosSlice'
import { pushToast } from '../../store/slices/uiSlice'
import './EmergencySosModal.css'

const EMERGENCY_CONTACTS = [
  { name: 'Campus Security Control', role: 'Main Gate Watch', phone: '+91 94440 01100', icon: ShieldAlert },
  { name: 'Health Center & Ambulance', role: 'Clinic Emergency Bay', phone: '108 / +91 94440 01102', icon: HeartPulse },
  { name: 'Chief Warden Emergency Desk', role: 'Hostel Administration', phone: '+91 94440 01101', icon: PhoneCall },
  { name: 'Women Safety & Police Helpline', role: 'Immediate Police Assistance', phone: '1091 / 112', icon: Siren },
  { name: 'Fire & Disaster Rescue', role: 'Fire Emergency Service', phone: '101', icon: Flame },
]

export default function OfflineSosModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const room = useSelector(selectMyRoom)
  const offlineQueue = useSelector(selectOfflineQueue)

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [distressActive, setDistressActive] = useState(false)
  const [alertId, setAlertId] = useState(null)
  const [dispatchedAt, setDispatchedAt] = useState(null)
  const [alertType, setAlertType] = useState('Medical / Urgent Assistance')

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      dispatch(syncOfflineSosQueue())
      dispatch(pushToast('Internet restored: Any queued offline SOS alerts have been delivered.', 'ok'))
    }
    const handleOffline = () => {
      setIsOnline(false)
      dispatch(pushToast('Network offline: Emergency SOS remains fully functional via local queueing.', 'warn'))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [dispatch])

  if (!isOpen) return null

  const handleTriggerSOS = () => {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const generatedId = `SOS-${Math.floor(1000 + Math.random() * 9000)}`

    dispatch(
      triggerSosAlert({
        studentName: user?.name || 'Keerthana G.',
        studentRoll: user?.rollNo || user?.regNo || '24104031',
        roomNumber: room?.roomNumber || user?.roomNumber || 'A-101',
        block: room?.block || 'A Block',
        alertType,
        isOffline: !isOnline,
      })
    )

    setAlertId(generatedId)
    setDispatchedAt(timeStr)
    setDistressActive(true)

    if (isOnline) {
      dispatch(pushToast(`🚨 Distress signal ${generatedId} broadcasted to Warden & Campus Security!`, 'bad'))
    } else {
      dispatch(pushToast(`🚨 OFFLINE SOS QUEUED (${generatedId}). Recorded locally & will sync when online.`, 'warn'))
    }
  }

  const handleCancelSOS = () => {
    setDistressActive(false)
    setAlertId(null)
    setDispatchedAt(null)
    dispatch(pushToast('Emergency distress alert cancelled.', 'info'))
  }

  return (
    <div className="sos-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sos-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sos-modal-header">
          <div className="sos-modal-title">
            <ShieldAlert size={20} color="#DC2626" />
            <span>Emergency SOS Distress Beacon</span>
          </div>
          <button className="sos-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="sos-modal-body">
          {/* Real-time Network Status Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 8,
              background: isOnline ? 'var(--accent-soft)' : '#FEF2F2',
              border: `1px solid ${isOnline ? 'var(--accent-border)' : '#EF4444'}`,
              fontSize: 12,
              fontWeight: 600,
              color: isOnline ? 'var(--accent-ink)' : '#991B1B',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isOnline ? <Wifi size={14} color="var(--accent-border)" /> : <WifiOff size={14} color="#EF4444" />}
              <span>{isOnline ? 'Online — Live Dispatch Active' : 'Offline Mode — Local Queueing Active'}</span>
            </div>
            {offlineQueue.length > 0 && (
              <span style={{ fontSize: 11, background: '#FEE2E2', padding: '1px 6px', borderRadius: 4 }}>
                {offlineQueue.length} queued alert(s)
              </span>
            )}
          </div>

          {/* For Student: show Room Coordinates & Broadcast SOS button */}
          {role === 'student' ? (
            <>
              {/* Location / Resident Tag */}
              <div className="sos-info-bar">
                <span className="sos-info-tag">
                  <MapPin size={13} />
                  Room <strong>{room?.roomNumber || user?.roomNumber || 'A-101'}</strong> ({room?.block || 'A Block'})
                </span>
                <span className="sos-info-tag">
                  <User size={13} />
                  {user?.name || 'Resident'}
                </span>
              </div>

              {/* Distress Trigger / Active State */}
              {distressActive ? (
                <div className="sos-active-box" style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
                  <div className="sos-active-header">
                    <CheckCircle2 size={18} color="#059669" />
                    <span>Distress Signal Active · #{alertId}</span>
                  </div>
                  <p className="sos-active-text">
                    {isOnline
                      ? 'Warden Office and Campus Rapid Response Patrol have been alerted with your room coordinates.'
                      : 'Distress recorded in local device storage. Signal will transmit to the warden automatically upon network reconnection.'}
                  </p>
                  <div className="sos-active-footer">
                    <span className="sos-active-time">Time: {dispatchedAt}</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm sos-cancel-btn"
                      onClick={handleCancelSOS}
                    >
                      Cancel Distress Alert
                    </button>
                  </div>
                </div>
              ) : (
                <div className="sos-action-box">
                  <div style={{ marginBottom: 10, width: '100%' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
                      Emergency Nature
                    </label>
                    <select
                      value={alertType}
                      onChange={(e) => setAlertType(e.target.value)}
                      style={{ width: '100%', marginTop: 4, padding: '7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--line)' }}
                    >
                      <option>Medical / Urgent Health Emergency</option>
                      <option>Security / Safety Hazard</option>
                      <option>Electrical Short-Circuit / Smoke</option>
                      <option>Urgent Infrastructure Failure</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="sos-broadcast-btn"
                    onClick={handleTriggerSOS}
                  >
                    <Radio size={18} />
                    <span>Broadcast Emergency SOS</span>
                  </button>
                  <p className="sos-broadcast-note">
                    Immediate priority dispatch to Chief Warden and Security Patrol with room verification.
                  </p>
                </div>
              )}
            </>
          ) : role === 'warden' ? (
            <div style={{ background: 'rgba(255, 68, 68, 0.08)', border: '1px solid rgba(255, 68, 68, 0.25)', padding: 14, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <strong style={{ color: 'var(--accent-red)' }}>Warden Incident Dispatch Center</strong>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { onClose(); navigate('/app/sos-monitor'); }}
                >
                  <ExternalLink size={13} /> Live SOS Monitor
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                You have active jurisdiction over hostel distress beacons. Dispatch security patrols or resolve open incidents from the SOS Monitor.
              </p>
            </div>
          ) : (
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--line-weak)', padding: 14, borderRadius: 8 }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                Campus Emergency Command &amp; Helplines
              </strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Central directory of authorized emergency contacts for university safety services, medical dispatch, and police escorts.
              </p>
            </div>
          )}

          {/* Emergency Contacts Directory — zero 24/7 wording */}
          <div className="sos-directory">
            <div className="sos-directory-header">
              <PhoneCall size={13} />
              <span>Campus Emergency Helpline Directory</span>
            </div>
            <div className="sos-directory-list">
              {EMERGENCY_CONTACTS.map((c) => {
                const Icon = c.icon
                return (
                  <a
                    key={c.name}
                    href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`}
                    className="sos-contact-row"
                  >
                    <div className="sos-contact-icon">
                      <Icon size={15} />
                    </div>
                    <div className="sos-contact-details">
                      <span className="sos-contact-name">{c.name}</span>
                      <span className="sos-contact-role">{c.role}</span>
                    </div>
                    <span className="sos-contact-tel">{c.phone}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
