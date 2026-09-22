import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, DoorOpen, MessageSquareWarning, CalendarClock,
  UserCheck, WashingMachine, UtensilsCrossed, Wallet, Bell, ChevronsLeft,
  KeyRound, LogOut, Settings as SettingsIcon, Bot, Map, Dumbbell,
  HelpCircle, ShieldAlert, Cpu, Users2, Fingerprint, Stethoscope, Activity,
} from 'lucide-react'
import { selectAuth } from '../../store/slices/authSlice'
import { toggleSidebar } from '../../store/slices/uiSlice'
import useTranslation from '../../hooks/useTranslation'
import brandLogo from '../../assets/brand-logo.jpg'
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
  { to: '/app/clinic', label: 'Hostel Clinic', icon: Stethoscope },
  { to: '/app/leave', label: 'Leave & Outpasses', icon: CalendarClock },
  { to: '/app/visitors', label: 'Visitors', icon: UserCheck },
  { to: '/app/payments', label: 'Hostel Fees', icon: Wallet },
  { to: '/app/notifications', label: 'Notices', icon: Bell, badgeKey: true },
  { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
]

const WARDEN_NAV = [
  { to: '/app', label: 'Command Center', icon: LayoutDashboard, end: true },
  { to: '/app/attendance', label: 'Attendance', icon: Fingerprint },
  { to: '/app/simulation', label: 'Daily Forecaster', icon: Activity },
  { to: '/app/rooms', label: 'Rooms & Beds', icon: DoorOpen },
  { to: '/app/users', label: 'Resident Directory', icon: Users2 },
  { to: '/app/complaints', label: 'Complaints Desk', icon: MessageSquareWarning },
  { to: '/app/clinic', label: 'Campus Health Clinic', icon: Stethoscope },
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

const MESS_NAV = [
  { to: '/app', label: 'Mess Command Desk', icon: LayoutDashboard, end: true },
  { to: '/app/mess', label: 'Menu & Food Inventory', icon: UtensilsCrossed },
  { to: '/app/complaints', label: 'Food & Complaints Desk', icon: MessageSquareWarning },
  { to: '/app/notifications', label: 'Notices & Circulars', icon: Bell, badgeKey: true },
  { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
]

const DOCTOR_NAV = [
  { to: '/app', label: 'Clinic Health Center', icon: LayoutDashboard, end: true },
  { to: '/app/clinic', label: 'Clinic & Prescriptions', icon: Stethoscope },
  { to: '/app/sos-monitor', label: 'Emergency & Medical SOS', icon: ShieldAlert },
  { to: '/app/leave', label: 'Medical Clearances', icon: CalendarClock },
  { to: '/app/notifications', label: 'Clinic Notices', icon: Bell, badgeKey: true },
  { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar({ collapsed, onLogout, unreadCount }) {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const { t } = useTranslation()

  const navItems =
    role === 'admin'
      ? ADMIN_NAV
      : role === 'warden'
      ? WARDEN_NAV
      : role === 'mess_manager'
      ? MESS_NAV
      : role === 'doctor'
      ? DOCTOR_NAV
      : STUDENT_NAV

  const brandSub = {
    student: 'Resident Portal',
    warden: 'Warden Center',
    admin: 'Hostel Admin',
    mess_manager: 'Mess Management',
    doctor: 'Campus Health Clinic',
  }[role] || 'Hostel Portal'

  return (
    <aside className={`rack ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="rack-brand">
        <div className="brand-mark">
          <img
            src={brandLogo}
            alt="Vidudhi Logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              if (e.currentTarget.nextSibling) {
                e.currentTarget.nextSibling.style.display = 'flex'
              }
            }}
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
          <div
            style={{
              display: 'none',
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--accent-soft)',
              border: '1.5px solid var(--accent-border)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <KeyRound size={17} color="var(--accent-border)" />
          </div>
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
        {navItems.map(({ to, label, icon: Icon, end, badgeKey }) => {
          const isSos = to === '/app/sos-monitor'
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `key-fob ${isSos ? 'is-sos' : ''} ${isActive ? 'is-active' : ''}`}
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
