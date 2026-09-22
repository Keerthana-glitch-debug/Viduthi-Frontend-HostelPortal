import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, DoorOpen, MessageSquareWarning, CalendarClock, UserCheck,
  WashingMachine, UtensilsCrossed, Wallet, Bell, Settings as SettingsIcon, Moon, Sun, LogOut, Search, UserCircle, Siren,
} from 'lucide-react'
import { logout, selectUser } from '../../store/slices/authSlice'
import { selectUi, toggleTheme, pushToast } from '../../store/slices/uiSlice'
import useOnClickOutside from '../../hooks/useOnClickOutside'
import useTranslation from '../../hooks/useTranslation'
import EmergencySosModal from './EmergencySosModal'
import './CommandPalette.css'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [sosOpen, setSosOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const { isDark } = useSelector(selectUi)
  const { t } = useTranslation()
  const panelRef = useRef(null)
  const inputRef = useRef(null)

  const commands = useMemo(() => ([
    { id: 'emergency-sos', label: '🚨 Emergency SOS Alert Dispatch', icon: Siren, run: () => setSosOpen(true) },
    { id: 'go-dashboard', label: t('nav_dashboard'), icon: LayoutDashboard, run: () => navigate('/app') },
    { id: 'go-rooms', label: t('nav_rooms'), icon: DoorOpen, run: () => navigate('/app/rooms') },
    { id: 'go-complaints', label: t('nav_complaints'), icon: MessageSquareWarning, run: () => navigate('/app/complaints') },
    { id: 'go-leave', label: t('nav_leave'), icon: CalendarClock, run: () => navigate('/app/leave') },
    { id: 'go-visitors', label: t('nav_visitors'), icon: UserCheck, run: () => navigate('/app/visitors') },
    { id: 'go-laundry', label: t('nav_laundry'), icon: WashingMachine, run: () => navigate('/app/laundry') },
    { id: 'go-mess', label: t('nav_mess'), icon: UtensilsCrossed, run: () => navigate('/app/mess') },
    { id: 'go-payments', label: t('nav_payments'), icon: Wallet, run: () => navigate('/app/payments') },
    { id: 'go-notices', label: t('nav_notices'), icon: Bell, run: () => navigate('/app/notifications') },
    { id: 'go-settings', label: t('nav_settings'), icon: SettingsIcon, run: () => navigate('/app/settings') },
    { id: 'go-profile', label: 'My Profile', icon: UserCircle, run: () => navigate('/app/profile') },
    {
      id: 'toggle-theme',
      label: isDark ? t('settings_theme_day') : t('settings_theme_night'),
      icon: isDark ? Sun : Moon,
      run: () => dispatch(toggleTheme()),
    },
    { id: 'logout', label: t('nav_logout'), icon: LogOut, run: () => { dispatch(logout()); navigate('/login') } },
  ]), [t, isDark, dispatch, navigate])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => c.label.toLowerCase().includes(q))
  }, [commands, query])

  useOnClickOutside(panelRef, () => setOpen(false))

  useEffect(() => {
    const onKeyDown = (e) => {
      const isCombo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      if (isCombo) {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }
      if (!open) return
      if (e.key === 'Escape') { setOpen(false); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && filtered[activeIndex]) { filtered[activeIndex].run(); setOpen(false); setQuery('') }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, filtered, activeIndex])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  useEffect(() => { setActiveIndex(0) }, [query])

  if (!open) return null

  return (
    <div className="palette-backdrop">
      <div className="palette-panel" ref={panelRef}>
        <div className="palette-search">
          <Search size={16} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('palette_placeholder')}
          />
          <kbd>Esc</kbd>
        </div>
        <div className="palette-hint">
          <span>{user.name}</span> · <span className="mono">⌘K / Ctrl+K</span>
        </div>
        <div className="palette-list">
          {filtered.length === 0 ? (
            <div className="palette-empty">{t('palette_empty')}</div>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon
              return (
                <button
                  key={cmd.id}
                  className={`palette-row ${i === activeIndex ? 'is-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => { cmd.run(); setOpen(false); setQuery('') }}
                >
                  <Icon size={15} />
                  <span>{cmd.label}</span>
                </button>
              )
            })
          )}
        </div>
      </div>
      <EmergencySosModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
    </div>
  )
}
