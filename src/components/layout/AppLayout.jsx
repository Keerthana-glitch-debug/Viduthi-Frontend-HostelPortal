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

const TITLE_KEYS = {
  '/app': ['page_overview', 'page_overview_sub'],
  '/app/copilot': ['AI Hostel Copilot', 'Hostel rules, services & motivational coaching'],
  '/app/simulation': ['What-If Simulation Engine', 'Scenario testing & operational predictive modeling'],
  '/app/map': ['Digital Campus Map', 'Interactive facility navigation & status information'],
  '/app/facilities': ['Facilities & Amenities', 'Sports equipment, gym access & room cleaning'],
  '/app/attendance': ['Attendance', 'Night roll-call, GPS campus boundary and biometric verification'],
  '/app/lost-found': ['Lost & Found', 'Report, track and claim campus belongings'],
  '/app/sos-monitor': ['Emergency SOS Monitor', 'Warden live distress monitoring & patrol dispatch'],
  '/app/users': ['User Management', 'Administrative student & warden directory'],
  '/app/rooms': ['page_accommodation', 'page_accommodation_sub'],
  '/app/complaints': ['page_facilities', 'page_facilities_sub'],
  '/app/leave': ['page_attendance', 'page_attendance_sub'],
  '/app/visitors': ['page_frontdesk', 'page_frontdesk_sub'],
  '/app/laundry': ['page_laundry', 'page_laundry_sub'],
  '/app/mess': ['page_mess', 'page_mess_sub'],
  '/app/payments': ['page_payments', 'page_payments_sub'],
  '/app/notifications': ['page_updates', 'page_updates_sub'],
  '/app/settings': ['settings_title', 'settings_eyebrow'],
  '/app/profile': ['My Profile', 'Account details and personal information'],
}

function resolveTitleKeys(pathname) {
  if (TITLE_KEYS[pathname]) return TITLE_KEYS[pathname]
  if (pathname.startsWith('/app/rooms')) return TITLE_KEYS['/app/rooms']
  return TITLE_KEYS['/app']
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

  const [titleKey, subtitleKey] = resolveTitleKeys(location.pathname)
  const title = TITLE_KEYS[location.pathname] ? TITLE_KEYS[location.pathname][0] : t(titleKey)
  const subtitle = TITLE_KEYS[location.pathname] ? TITLE_KEYS[location.pathname][1] : t(subtitleKey)

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
