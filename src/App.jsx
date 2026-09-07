import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute, { PublicOnlyRoute } from './components/common/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RoomsPage from './pages/RoomsPage'
import Complaints from './pages/Complaints'
import LeaveRequests from './pages/LeaveRequests'
import Visitors from './pages/Visitors'
import LaundryPage from './pages/LaundryPage'
import Mess from './pages/Mess'
import Payments from './pages/Payments'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="rooms/:roomId" element={<RoomsPage />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="leave" element={<LeaveRequests />} />
          <Route path="visitors" element={<Visitors />} />
          <Route path="laundry" element={<LaundryPage />} />
          <Route path="mess" element={<Mess />} />
          <Route path="payments" element={<Payments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
