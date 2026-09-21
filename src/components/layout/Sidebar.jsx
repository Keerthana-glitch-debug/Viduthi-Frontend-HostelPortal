import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, DoorOpen, MessageSquareWarning, CalendarClock,
  UserCheck, WashingMachine, UtensilsCrossed, Wallet, Bell, ChevronsLeft,
  KeyRound, LogOut, Settings as SettingsIcon, Bot, Map, Dumbbell,
  HelpCircle, ShieldAlert, Cpu, Users2, Fingerprint,
} from 'lucide-react'
import { selectAuth } from '../../store/slices/authSlice'
import { toggleSidebar } from '../../store/slices/uiSlice'
import useTranslation from '../../hooks/useTranslation'
import './Sidebar.css'

const STUDENT_NAV = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/attendance', label: 'Attendance', icon: Fingerprint },
  { to: '/app/copilot', label: 'AI Copilot', icon: Bot },
  { to: '/app/map', label: 'Digital Map', icon: Map },
  { to: '/app/rooms', label: 'My Room', icon: DoorOpen },
  { to: '/app/facilities', label: 'Facilities Hub', icon: Dumbbell },
  { to: '/app/lost-found', label: 'Lost & Found', icon: HelpCircle },
  { to: '/app/laundry', label: 'Laundry', icon: WashingMachine },
  { to: '/app/mess', label: 'Mess Dining', icon: UtensilsCrossed },
  { to: '/app/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { to: '/app/leave', label: 'Leave & Outpasses', icon: CalendarClock },
  { to: '/app/visitors', label: 'Visitors', icon: UserCheck },
  { to: '/app/payments', label: 'Hostel Fees', icon: Wallet },
  { to: '/app/notifications', label: 'Notices', icon: Bell, badgeKey: true },
  { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
]

const WARDEN_NAV = [
  { to: '/app', label: 'Command Center', icon: LayoutDashboard, end: true },
  { to: '/app/attendance', label: 'Attendance', icon: Fingerprint },
  { to: '/app/simulation', label: 'What-If Engine', icon: Cpu },
  { to: '/app/rooms', label: 'Rooms & Beds', icon: DoorOpen },
  { to: '/app/complaints', label: 'Complaints Desk', icon: MessageSquareWarning },
  { to: '/app/lost-found', label: 'Lost & Found', icon: HelpCircle },
  { to: '/app/visitors', label: 'Visitor Approvals', icon: UserCheck },
  { to: '/app/leave', label: 'Leave Approvals', icon: CalendarClock },
  { to: '/app/mess', label: 'Mess Operations', icon: UtensilsCrossed },
  { to: '/app/laundry', label: 'Laundry Hub', icon: WashingMachine },
  { to: '/app/sos-monitor', label: 'Emergency SOS', icon: ShieldAlert },
  { to: '/app/notifications', label: 'Broadcast Notices', icon: Bell, badgeKey: true },
  { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
]

const ADMIN_NAV = [
  { to: '/app', label: 'Administrative Console', icon: LayoutDashboard, end: true },
  { to: '/app/users', label: 'User Directory', icon: Users2 },
  { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar({ collapsed, onLogout, unreadCount }) {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const { t } = useTranslation()

  const navItems = role === 'admin' ? ADMIN_NAV : role === 'warden' ? WARDEN_NAV : STUDENT_NAV

  const brandSub = {
    student: 'Resident Portal',
    warden: 'Warden Center',
    admin: 'Hostel Admin',
  }[role] || 'Hostel Portal'

  return (
    <aside className={`rack ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="rack-brand">
        <div className="brand-mark">
          <img
            src="/brand-logo.jpg"
            alt="Vidudhi Logo"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              objectFit: 'cover',
              border: '1.5px solid var(--accent-border, #7CFC00)',
              boxShadow: '0 2px 8px rgba(124, 252, 0, 0.25)',
              display: 'block',
            }}
          />
        </div>
        {!collapsed && (
          <div className="brand-text">
            <span className="brand-name">Vidudhi</span>
            <span className="brand-sub">{brandSub}</span>
          </div>
        )}
      </div>

      <div className="rack-rail" aria-hidden="true" />

      <nav className="rack-nav">
        {navItems.map(({ to, label, icon: Icon, end, badgeKey }) => (
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
        ))}
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
