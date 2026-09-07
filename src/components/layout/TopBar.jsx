import { useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Search, Sun, Moon, Bell, DoorOpen, MessageSquareWarning, CalendarClock, ShieldAlert } from 'lucide-react'
import { selectUi, toggleTheme } from '../../store/slices/uiSlice'
import { selectRooms } from '../../store/slices/roomsSlice'
import { selectComplaints } from '../../store/slices/complaintsSlice'
import { selectLeaveRequests } from '../../store/slices/leaveSlice'
import { selectAuth } from '../../store/slices/authSlice'
import { selectPhotoForRole } from '../../store/slices/profileSlice'
import EmergencySosModal from '../common/EmergencySosModal'
import useDebounce from '../../hooks/useDebounce'
import useOnClickOutside from '../../hooks/useOnClickOutside'
import useKeyPress from '../../hooks/useKeyPress'
import useInterval from '../../hooks/useInterval'
import './TopBar.css'

function buildResults(query, rooms, complaints, leaveRequests) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const results = []

  rooms.forEach((r) => {
    if (`${r.roomNumber} ${r.block} ${r.roomType}`.toLowerCase().includes(q)) {
      results.push({ kind: 'room', id: r.roomId, label: r.roomNumber, meta: `${r.block} · ${r.roomType}`, to: `/app/rooms/${r.roomId}` })
    }
  })
  complaints.forEach((c) => {
    if (`${c.title} ${c.roomNumber} ${c.category}`.toLowerCase().includes(q)) {
      results.push({ kind: 'complaint', id: c.id, label: c.title, meta: `${c.id} · ${c.roomNumber}`, to: '/app/complaints' })
    }
  })
  leaveRequests.forEach((l) => {
    if (`${l.studentName} ${l.roomNumber} ${l.reason}`.toLowerCase().includes(q)) {
      results.push({ kind: 'leave', id: l.id, label: l.studentName, meta: `${l.id} · ${l.reason}`, to: '/app/leave' })
    }
  })

  return results.slice(0, 7)
}

const KIND_ICON = { room: DoorOpen, complaint: MessageSquareWarning, leave: CalendarClock }

export default function TopBar({ title, subtitle, user, unreadCount }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isDark } = useSelector(selectUi)
  const { role } = useSelector(selectAuth)
  const photo = useSelector(selectPhotoForRole(role))
  const rooms = useSelector(selectRooms)
  const complaints = useSelector(selectComplaints)
  const leaveRequests = useSelector(selectLeaveRequests)

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [sosOpen, setSosOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const searchWrapRef = useRef(null)
  const inputRef = useRef(null)

  const debouncedQuery = useDebounce(query, 200)
  const results = useMemo(
    () => buildResults(debouncedQuery, rooms, complaints, leaveRequests),
    [debouncedQuery, rooms, complaints, leaveRequests]
  )

  useInterval(() => setNow(new Date()), 1000)

  useOnClickOutside(searchWrapRef, () => setOpen(false))

  useKeyPress('/', (e) => {
    const tag = document.activeElement?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    e.preventDefault()
    inputRef.current?.focus()
  })

  useKeyPress('Escape', () => setOpen(false))

  const clock = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h2>{title}</h2>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>

      <div className="topbar-search" ref={searchWrapRef}>
        <Search size={16} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search rooms, complaints, students… (press /)"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => query && setOpen(true)}
        />
        {open && debouncedQuery && (
          <div className="search-drop">
            {results.length === 0 ? (
              <div className="search-empty">No matches on the register.</div>
            ) : (
              results.map((r) => {
                const Icon = KIND_ICON[r.kind]
                return (
                  <button
                    key={`${r.kind}-${r.id}`}
                    className="search-row"
                    onClick={() => { navigate(r.to); setOpen(false); setQuery('') }}
                  >
                    <Icon size={14} />
                    <span className="search-row-label">{r.label}</span>
                    <span className="search-row-meta mono">{r.meta}</span>
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className="btn btn-sos"
          onClick={() => setSosOpen(true)}
          title="Emergency Assistance & SOS"
        >
          <ShieldAlert size={14} strokeWidth={2.4} color="#FFFFFF" />
          <span>SOS</span>
        </button>
        <span className="duty-clock mono">{clock}</span>
        <button className="icon-btn" onClick={() => navigate('/app/notifications')} aria-label="Notifications">
          <Bell size={17} strokeWidth={1.8} />
          {unreadCount > 0 && <span className="icon-dot" />}
        </button>
        <button className="icon-btn" onClick={() => dispatch(toggleTheme())} aria-label="Toggle theme">
          {isDark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
        </button>
        <button className="topbar-user" onClick={() => navigate('/app/profile')} aria-label="View profile">
          <div className="avatar">
            {photo ? <img src={photo} alt="" className="avatar-photo" /> : user.avatarInitials}
          </div>
          <div className="topbar-user-text">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.designation || (user.role === 'admin' ? 'Administrator' : `Room ${user.roomNumber}`)}</span>
          </div>
        </button>
      </div>
      <EmergencySosModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
    </header>
  )
}
