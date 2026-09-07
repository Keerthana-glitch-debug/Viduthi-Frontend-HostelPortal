import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, DoorOpen, MessageSquareWarning, CalendarClock,
  UserCheck, WashingMachine, UtensilsCrossed, Wallet, Bell, ChevronsLeft, KeyRound, LogOut, Settings as SettingsIcon,
} from 'lucide-react'
import { selectAuth } from '../../store/slices/authSlice'
import { toggleSidebar } from '../../store/slices/uiSlice'
import useTranslation from '../../hooks/useTranslation'
import './Sidebar.css'

const NAV = [
  { to: '/app', key: 'nav_dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/rooms', key: 'nav_rooms', icon: DoorOpen },
  { to: '/app/complaints', key: 'nav_complaints', icon: MessageSquareWarning },
  { to: '/app/leave', key: 'nav_leave', icon: CalendarClock },
  { to: '/app/visitors', key: 'nav_visitors', icon: UserCheck },
  { to: '/app/laundry', key: 'nav_laundry', icon: WashingMachine },
  { to: '/app/mess', key: 'nav_mess', icon: UtensilsCrossed },
  { to: '/app/payments', key: 'nav_payments', icon: Wallet },
  { to: '/app/notifications', key: 'nav_notices', icon: Bell, badgeKey: true },
  { to: '/app/settings', key: 'nav_settings', icon: SettingsIcon },
]

export default function Sidebar({ collapsed, onLogout, unreadCount }) {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const { t } = useTranslation()

  return (
    <aside className={`rack ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="rack-brand">
        <div className="brand-mark"><KeyRound size={17} /></div>
        {!collapsed && (
          <div className="brand-text">
            <span className="brand-name">Vidudhi</span>
            <span className="brand-sub">{t(role === 'admin' ? 'brand_sub_admin' : 'brand_sub_resident')}</span>
          </div>
        )}
      </div>

      <div className="rack-rail" aria-hidden="true" />

      <nav className="rack-nav">
        {NAV.map(({ to, key, icon: Icon, end, badgeKey }) => {
          const label = t(key)
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `key-fob ${isActive ? 'is-active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <span className="key-fob-ring" />
              <span className="key-fob-body">
                <Icon size={17} strokeWidth={1.8} />
                {!collapsed && <span className="key-fob-label">{label}</span>}
                {badgeKey && unreadCount > 0 && (
                  <span className="key-fob-badge">{unreadCount}</span>
                )}
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div className="rack-footer">
        <button className="key-fob" onClick={onLogout} title={collapsed ? t('nav_logout') : undefined}>
          <span className="key-fob-ring" />
          <span className="key-fob-body">
            <LogOut size={17} strokeWidth={1.8} />
            {!collapsed && <span className="key-fob-label">{t('nav_logout')}</span>}
          </span>
        </button>
        <button className="rack-collapse" onClick={() => dispatch(toggleSidebar())} aria-label="Toggle sidebar">
          <ChevronsLeft size={15} className={collapsed ? 'flip' : ''} />
        </button>
      </div>
    </aside>
  )
}
