import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import ToastStack from '../common/Toast'
import BackgroundDecor from '../common/BackgroundDecor'
import { logout, selectUser } from '../../store/slices/authSlice'
import { selectUi, setSidebarCollapsed } from '../../store/slices/uiSlice'
import { selectUnreadCount } from '../../store/slices/notificationsSlice'
import useMediaQuery from '../../hooks/useMediaQuery'
import useTranslation from '../../hooks/useTranslation'

const PAGE_TITLES = {
  '/app': ['Campus Overview', 'Real-time resident and facility operations summary'],
  '/app/copilot': ['AI Hostel Copilot', 'Hostel rules, services & AI assistance'],
  '/app/simulation': ['Hostel Daily Forecaster', 'Estimate electricity, water, mess meals & daily needs'],
  '/app/map': ['Digital Campus Map', 'Interactive facility navigation & status information'],
  '/app/facilities': ['Facilities & Sports Hub', 'Sports equipment, gym facilities & recreational amenities'],
  '/app/attendance': ['Attendance Desk', 'Night roll-call, GPS campus boundary and biometric verification'],
  '/app/lost-found': ['Lost & Found', 'Report, track and claim campus belongings'],
  '/app/sos-monitor': ['Emergency SOS Monitor', 'Warden live distress monitoring & patrol dispatch'],
  '/app/users': ['User Management', 'Administrative student & staff directory'],
  '/app/rooms': ['Room Allocation', 'Hostel room occupancy and resident allocations'],
  '/app/complaints': ['Maintenance Grievance Desk', 'Hostel repairs, tickets and facility issues'],
  '/app/leave': ['Leave Requests & Outpasses', 'Digital gate clearances, outpasses and travel approvals'],
  '/app/visitors': ['Visitor Management', 'Guest logging, entry passes and security check-ins'],
  '/app/laundry': ['Smart Laundry Hub', 'Washing machine slots and steam ironing services'],
  '/app/mess': ['Dining & Mess Operations', '7-day digital menu, meal schedules and add-ons'],
  '/app/payments': ['Hostel Accounts & Fee Receipts', 'Fee statements, online transactions and official receipts'],
  '/app/notifications': ['Campus Notice Board', 'Official circulars, curfew alerts and announcements'],
  '/app/clinic': ['Campus Health & OPD Clinic', 'Doctor availability, consultations and medical prescriptions'],
  '/app/settings': ['Settings & Preferences', 'System appearance, theme colors, language and profile options'],
  '/app/profile': ['My Profile', 'Account details and personal information'],
}

function resolvePageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/app/rooms')) return PAGE_TITLES['/app/rooms']
  return PAGE_TITLES['/app']
}

import FloatingCopilot from '../common/FloatingCopilot'

export default function AppLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, sidebarCollapsed, buttonSkin, fontTheme, accentColor, backgroundTheme, language } = useSelector(selectUi)
  const user = useSelector(selectUser)
  const unreadCount = useSelector(selectUnreadCount)
  const isNarrow = useMediaQuery('(max-width: 980px)')
  const { t } = useTranslation()

  // Persist theme choice
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try { window.localStorage.setItem('vidudhi:isDark', JSON.stringify(isDark)) } catch { /* no-op */ }
  }, [isDark])

  useEffect(() => {
    try { window.localStorage.setItem('vidudhi:sidebarCollapsed', JSON.stringify(sidebarCollapsed)) } catch { /* no-op */ }
  }, [sidebarCollapsed])

  useEffect(() => {
    try { window.localStorage.setItem('vidudhi:buttonSkin', JSON.stringify(buttonSkin)) } catch { /* no-op */ }
  }, [buttonSkin])

  useEffect(() => {
    try { window.localStorage.setItem('vidudhi:fontTheme', JSON.stringify(fontTheme)) } catch { /* no-op */ }
    document.documentElement.setAttribute('data-font', fontTheme)
    document.body.setAttribute('data-font', fontTheme)
  }, [fontTheme])

  useEffect(() => {
    try { window.localStorage.setItem('vidudhi:accentColor', JSON.stringify(accentColor)) } catch { /* no-op */ }
  }, [accentColor])

  useEffect(() => {
    try { window.localStorage.setItem('vidudhi:backgroundTheme', JSON.stringify(backgroundTheme)) } catch { /* no-op */ }
  }, [backgroundTheme])

  useEffect(() => {
    try { window.localStorage.setItem('vidudhi:language', JSON.stringify(language)) } catch { /* no-op */ }
    document.documentElement.lang = language
  }, [language])

  // Auto-collapse the rack on narrow viewports
  useEffect(() => {
    if (isNarrow) dispatch(setSidebarCollapsed(true))
  }, [isNarrow, dispatch])

  const [title, subtitle] = resolvePageTitle(location.pathname)

  return (
    <div className={`${isDark ? 'dark' : ''} font-${fontTheme} accent-${accentColor} skin-${buttonSkin}`}>
      <BackgroundDecor theme={backgroundTheme} />
      <div className="app-shell">
        <Sidebar
          collapsed={sidebarCollapsed}
          onLogout={() => { dispatch(logout()); navigate('/login') }}
          unreadCount={unreadCount}
        />
        <div className="app-main">
          <TopBar
            title={title}
            subtitle={subtitle}
            user={user}
            unreadCount={unreadCount}
          />
          <Outlet />
        </div>
      </div>
      <FloatingCopilot />
      <ToastStack />
    </div>
  )
}
