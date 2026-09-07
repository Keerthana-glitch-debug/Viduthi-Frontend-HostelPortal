import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import ToastStack from '../common/Toast'
import CommandPalette from '../common/CommandPalette'
import QuickActionsFab from '../common/QuickActionsFab'
import BackgroundDecor from '../common/BackgroundDecor'
import { logout, selectUser } from '../../store/slices/authSlice'
import { selectUi, setSidebarCollapsed } from '../../store/slices/uiSlice'
import { selectUnreadCount } from '../../store/slices/notificationsSlice'
import useMediaQuery from '../../hooks/useMediaQuery'
import useTranslation from '../../hooks/useTranslation'

const TITLE_KEYS = {
  '/app': ['page_overview', 'page_overview_sub'],
  '/app/rooms': ['page_accommodation', 'page_accommodation_sub'],
  '/app/complaints': ['page_facilities', 'page_facilities_sub'],
  '/app/leave': ['page_attendance', 'page_attendance_sub'],
  '/app/visitors': ['page_frontdesk', 'page_frontdesk_sub'],
  '/app/laundry': ['page_laundry', 'page_laundry_sub'],
  '/app/mess': ['page_mess', 'page_mess_sub'],
  '/app/payments': ['page_payments', 'page_payments_sub'],
  '/app/notifications': ['page_updates', 'page_updates_sub'],
  '/app/settings': ['settings_title', 'settings_eyebrow'],
}

function resolveTitleKeys(pathname) {
  if (TITLE_KEYS[pathname]) return TITLE_KEYS[pathname]
  if (pathname.startsWith('/app/rooms')) return TITLE_KEYS['/app/rooms']
  return TITLE_KEYS['/app']
}

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

  // Auto-collapse the rack on narrow viewports, once, when it flips narrow
  useEffect(() => {
    if (isNarrow) dispatch(setSidebarCollapsed(true))
  }, [isNarrow, dispatch])

  const [titleKey, subtitleKey] = resolveTitleKeys(location.pathname)
  const title = t(titleKey)
  const subtitle = t(subtitleKey)

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
      <ToastStack />
      <CommandPalette />
      <QuickActionsFab />
    </div>
  )
}
