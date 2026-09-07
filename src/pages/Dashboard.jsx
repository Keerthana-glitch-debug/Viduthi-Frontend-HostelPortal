import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { DoorOpen, MessageSquareWarning, CalendarClock, UserCheck, Users, Building2 } from 'lucide-react'
import StatCard from '../components/dashboard/StatCard'
import RoomGrid from '../components/dashboard/RoomGrid'
import OccupancyDonut from '../components/dashboard/OccupancyDonut'
import MiniBarBreakdown from '../components/dashboard/MiniBarBreakdown'
import Badge from '../components/common/Badge'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import { selectRooms, selectMyRoom, fetchRooms } from '../store/slices/roomsSlice'
import { selectComplaints, fetchComplaints } from '../store/slices/complaintsSlice'
import { selectLeaveRequests, fetchLeaveRequests } from '../store/slices/leaveSlice'
import { selectVisitors, fetchVisitors } from '../store/slices/visitorsSlice'
import { selectNotifications, fetchNotifications } from '../store/slices/notificationsSlice'

function ActivityFeed({ complaints, leaveRequests, notifications }) {
  const items = [
    ...complaints.slice(0, 2).map((c) => ({
      text: `Complaint "${c.title}" raised for ${c.roomNumber}`, time: c.date,
      tone: c.status === 'Resolved' ? 'ok' : c.priority === 'High' ? 'bad' : 'warn',
    })),
    ...leaveRequests.slice(0, 2).map((l) => ({
      text: `${l.studentName} applied for leave (${l.fromDate} \u2013 ${l.toDate})`, time: l.appliedOn,
      tone: l.status === 'Approved' ? 'ok' : l.status === 'Rejected' ? 'bad' : 'warn',
    })),
    ...notifications.slice(0, 2).map((n) => ({ text: n.message, time: n.date, tone: n.type === 'warning' ? 'warn' : n.type === 'success' ? 'ok' : 'info' })),
  ].slice(0, 5)

  return (
    <div className="activity-feed">
      {items.map((item, i) => (
        <div className="activity-item" key={i}>
          <span className={`activity-dot tone-${item.tone}`} />
          <div>
            <div className="activity-text">{item.text}</div>
            <div className="activity-time">{item.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const room = useSelector(selectMyRoom)
  const rooms = useSelector(selectRooms)
  const complaints = useSelector(selectComplaints)
  const leaveRequests = useSelector(selectLeaveRequests)
  const visitors = useSelector(selectVisitors)
  const notifications = useSelector(selectNotifications)

  // Dashboard is usually the first page loaded after login, so refresh
  // everything from the backend here — every other page just re-reads
  // whatever's already in the store by the time the user gets there.
  useEffect(() => {
    dispatch(fetchRooms())
    dispatch(fetchComplaints())
    dispatch(fetchLeaveRequests())
    dispatch(fetchVisitors())
    dispatch(fetchNotifications())
  }, [dispatch])

  if (role === 'admin') {
    const occupied = rooms.reduce((sum, r) => sum + r.occupied, 0)
    const capacity = rooms.reduce((sum, r) => sum + r.capacity, 0)
    const openComplaints = complaints.filter((c) => c.status !== 'Resolved').length
    const pendingLeave = leaveRequests.filter((l) => l.status === 'Pending').length
    const checkedInVisitors = visitors.filter((v) => v.status === 'Checked In').length
    const occupancyPercent = capacity ? Math.round((occupied / capacity) * 100) : 0

    const priorityRows = [
      { label: 'High', tone: 'pink', value: complaints.filter((c) => c.priority === 'High').length },
      { label: 'Medium', tone: 'blue', value: complaints.filter((c) => c.priority === 'Medium').length },
      { label: 'Low', tone: 'teal', value: complaints.filter((c) => c.priority === 'Low').length },
    ]

    return (
      <div className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Overview</span>
            <h1>Good day, {user.name.split(' ')[0]}</h1>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-ghost" onClick={() => navigate('/app/leave')}>Review leave requests</button>
            <button className="btn btn-primary" onClick={() => navigate('/app/rooms')}>Manage rooms</button>
          </div>
        </div>

        <div className="stat-grid">
          <StatCard icon={Building2} label="Occupancy" value={`${occupied}/${capacity}`} delta={`${Math.round((occupied / capacity) * 100)}% filled`} tone="teal" />
          <StatCard icon={MessageSquareWarning} label="Open complaints" value={openComplaints} tone="warn" />
          <StatCard icon={CalendarClock} label="Pending leave requests" value={pendingLeave} tone="brass" />
          <StatCard icon={UserCheck} label="Visitors on premises" value={checkedInVisitors} tone="ok" />
        </div>

        <div className="two-col">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Block occupancy map</h3>
                <p>Live status across all managed rooms</p>
              </div>
            </div>
            <RoomGrid rooms={rooms} onSelect={() => navigate('/app/rooms')} />
          </div>
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Recent activity</h3>
                <p>Latest requests and updates</p>
              </div>
            </div>
            <ActivityFeed complaints={complaints} leaveRequests={leaveRequests} notifications={notifications} />
          </div>
        </div>

        <div className="two-col">
          <div className="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <OccupancyDonut
              percent={occupancyPercent}
              label="Filled"
              sublabel={`${occupied} of ${capacity} beds occupied across all blocks`}
            />
          </div>
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Complaints by priority</h3>
                <p>Across all open and resolved tickets</p>
              </div>
            </div>
            <MiniBarBreakdown rows={priorityRows} />
          </div>
        </div>
      </div>
    )
  }

  // Resident dashboard
  const myComplaints = complaints.filter((c) => c.roomNumber === room.roomNumber)
  const myLeave = leaveRequests.filter((l) => l.roomNumber === room.roomNumber)
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Welcome</span>
          <h1>Hi {user.name.split(' ')[0]}, here's your day</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/app/complaints')}>Raise a complaint</button>
          <button className="btn btn-primary" onClick={() => navigate('/app/leave')}>Apply for leave</button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={DoorOpen} label="Your room" value={room.roomNumber} delta={`${room.block} · Floor ${room.floor}`} tone="teal" />
        <StatCard icon={MessageSquareWarning} label="Your complaints" value={myComplaints.length} tone="warn" />
        <StatCard icon={CalendarClock} label="Leave requests" value={myLeave.length} tone="brass" />
        <StatCard icon={Users} label="Unread notifications" value={unread} tone="ok" />
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Room {room.roomNumber}</h3>
              <p>{room.roomType} · {room.block}, Floor {room.floor}</p>
            </div>
            <Badge>{room.status}</Badge>
          </div>
          <div className="entity-card-meta" style={{ marginBottom: 14 }}>
            Occupancy: {room.occupied} of {room.capacity} beds filled
          </div>
          <div className="card-grid">
            {room.roommates.map((mate) => (
              <div className="entity-card card" key={mate}>
                <div className="entity-card-head">
                  <h4>{mate}</h4>
                </div>
                <span className="entity-card-id mono">Roommate</span>
              </div>
            ))}
            {room.roommates.length === 0 && <p style={{ fontSize: 13 }}>No roommates assigned yet.</p>}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Recent activity</h3>
              <p>Your requests and hostel updates</p>
            </div>
          </div>
          <ActivityFeed complaints={myComplaints} leaveRequests={myLeave} notifications={notifications} />
        </div>
      </div>
    </div>
  )
}
