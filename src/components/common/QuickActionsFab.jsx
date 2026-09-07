import { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Plus, X, MessageSquareWarning, CalendarClock, UserCheck, WashingMachine, UtensilsCrossed, Siren } from 'lucide-react'
import { selectAuth } from '../../store/slices/authSlice'
import useToggle from '../../hooks/useToggle'
import useOnClickOutside from '../../hooks/useOnClickOutside'
import useTranslation from '../../hooks/useTranslation'
import EmergencySosModal from './EmergencySosModal'
import './QuickActionsFab.css'

export default function QuickActionsFab() {
  const { role } = useSelector(selectAuth)
  const [open, toggleOpen, setOpen] = useToggle(false)
  const [sosOpen, setSosOpen] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const wrapRef = useRef(null)

  useOnClickOutside(wrapRef, () => setOpen(false))

  if (role === 'admin') return null

  const actions = [
    { key: 'sos', label: '🚨 EMERGENCY SOS', icon: Siren, isSos: true, tone: 'sos' },
    { key: 'fab_complaint', label: t('fab_complaint'), icon: MessageSquareWarning, to: '/app/complaints?new=1', tone: 'green' },
    { key: 'fab_leave', label: t('fab_leave'), icon: CalendarClock, to: '/app/leave?new=1', tone: 'blue' },
    { key: 'fab_visitor', label: t('fab_visitor'), icon: UserCheck, to: '/app/visitors?new=1', tone: 'teal' },
    { key: 'fab_laundry', label: t('fab_laundry'), icon: WashingMachine, to: '/app/laundry?new=1', tone: 'green' },
    { key: 'fab_mess', label: t('fab_mess'), icon: UtensilsCrossed, to: '/app/mess', tone: 'blue' },
  ]

  return (
    <>
      <div className="fab-wrap" ref={wrapRef}>
        {open && (
          <div className="fab-menu">
            {actions.map((a) => {
              const Icon = a.icon
              return (
                <button
                  key={a.key}
                  className={`fab-action fab-tone-${a.tone}`}
                  onClick={() => {
                    setOpen(false)
                    if (a.isSos) {
                      setSosOpen(true)
                    } else {
                      navigate(a.to)
                    }
                  }}
                >
                  <Icon size={15} />
                  {a.label}
                </button>
              )
            })}
          </div>
        )}
        <button className={`fab-main ${open ? 'is-open' : ''}`} onClick={toggleOpen} aria-label="Quick actions">
          {open ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>
      <EmergencySosModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
    </>
  )
}
