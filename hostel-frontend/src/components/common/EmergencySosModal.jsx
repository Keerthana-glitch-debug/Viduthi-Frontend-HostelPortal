import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PhoneCall, ShieldAlert, HeartPulse, Flame, X, CheckCircle2, Siren, Radio, MapPin, User } from 'lucide-react'
import { selectUser } from '../../store/slices/authSlice'
import { selectMyRoom } from '../../store/slices/roomsSlice'
import { pushToast } from '../../store/slices/uiSlice'
import './EmergencySosModal.css'

const EMERGENCY_CONTACTS = [
  { name: 'Campus Security', role: 'Main Gate (24x7)', phone: '+91 94440 01100', icon: ShieldAlert },
  { name: 'Health Center & Ambulance', role: 'Clinic Emergency', phone: '108 / +91 94440 01102', icon: HeartPulse },
  { name: 'Chief Warden Desk', role: 'Administration', phone: '+91 94440 01101', icon: PhoneCall },
  { name: 'Women Safety / Police', role: 'Immediate Police', phone: '1091 / 112', icon: Siren },
  { name: 'Fire & Rescue', role: 'Fire Emergency', phone: '101', icon: Flame },
]

export default function EmergencySosModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const room = useSelector(selectMyRoom)

  const [distressActive, setDistressActive] = useState(false)
  const [alertId, setAlertId] = useState(null)
  const [dispatchedAt, setDispatchedAt] = useState(null)

  if (!isOpen) return null

  const handleTriggerSOS = () => {
    const newId = `SOS-${Math.floor(1000 + Math.random() * 9000)}`
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setAlertId(newId)
    setDispatchedAt(timeStr)
    setDistressActive(true)
    dispatch(pushToast(`🚨 Emergency SOS broadcasted (${newId}) to Warden & Security Patrol!`, 'bad'))
  }

  const handleCancelSOS = () => {
    setDistressActive(false)
    setAlertId(null)
    setDispatchedAt(null)
    dispatch(pushToast('Emergency alert cancelled.', 'info'))
  }

  return (
    <div className="sos-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sos-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sos-modal-header">
          <div className="sos-modal-title">
            <ShieldAlert size={18} color="#DC2626" />
            <span>Emergency SOS</span>
          </div>
          <button className="sos-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="sos-modal-body">
          {/* Location / Resident Pill */}
          <div className="sos-info-bar">
            <span className="sos-info-tag">
              <MapPin size={13} />
              Room <strong>{room?.roomNumber || 'A-101'}</strong> ({room?.block || 'A Block'})
            </span>
            <span className="sos-info-tag">
              <User size={13} />
              {user?.name || 'Resident'}
            </span>
          </div>

          {/* Distress Trigger / Active status */}
          {distressActive ? (
            <div className="sos-active-box">
              <div className="sos-active-header">
                <CheckCircle2 size={18} color="#059669" />
                <span>Distress Signal Active · #{alertId}</span>
              </div>
              <p className="sos-active-text">
                Warden and Campus Security have been alerted for your room. Stand by or call the contacts below.
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
              <button
                type="button"
                className="sos-broadcast-btn"
                onClick={handleTriggerSOS}
              >
                <Radio size={18} />
                <span>Broadcast Emergency SOS</span>
              </button>
              <p className="sos-broadcast-note">
                Notifies the warden desk and security patrol with your room location immediately.
              </p>
            </div>
          )}

          {/* Minimal Emergency Directory */}
          <div className="sos-directory">
            <div className="sos-directory-header">
              <PhoneCall size={13} />
              <span>24/7 Emergency Numbers</span>
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
