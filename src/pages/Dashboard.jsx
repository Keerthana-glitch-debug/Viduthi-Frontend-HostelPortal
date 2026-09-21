import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  DoorOpen, MessageSquareWarning, CalendarClock, UserCheck, Users,
  Building2, Sparkles, Cpu, Map, Dumbbell, ShieldAlert, Bot,
  ArrowRight, CheckCircle2, AlertTriangle, Clock, Activity,
} from 'lucide-react'
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
import { selectActiveSosCount } from '../store/slices/sosSlice'
import { selectUsersList } from '../store/slices/usersSlice'
import { initialPredictiveInsights } from '../data/seedData'

function ActivityFeed({ complaints, leaveRequests, notifications }) {
  const items = [
    ...complaints.slice(0, 2).map((c) => ({
      text: `Complaint "${c.title}" raised for ${c.roomNumber}`,
      time: c.date,
      tone: c.status === 'Resolved' ? 'ok' : c.priority === 'High' ? 'bad' : 'warn',
    })),
    ...leaveRequests.slice(0, 2).map((l) => ({
      text: `${l.studentName} applied for leave (${l.fromDate} \u2013 ${l.toDate})`,
      time: l.appliedOn,
      tone: l.status === 'Approved' ? 'ok' : l.status === 'Rejected' ? 'bad' : 'warn',
    })),
    ...notifications.slice(0, 2).map((n) => ({
      text: n.message,
      time: n.date,
      tone: n.type === 'warning' ? 'warn' : n.type === 'success' ? 'ok' : 'info',
    })),
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
  const activeSosCount = useSelector(selectActiveSosCount)
  const userDirectory = useSelector(selectUsersList)

  useEffect(() => {
    dispatch(fetchRooms())
    dispatch(fetchComplaints())
    dispatch(fetchLeaveRequests())
    dispatch(fetchVisitors())
    dispatch(fetchNotifications())
  }, [dispatch])

  const occupied = rooms.reduce((sum, r) => sum + r.occupied, 0)
  const capacity = rooms.reduce((sum, r) => sum + r.capacity, 0)
  const openComplaints = complaints.filter((c) => c.status !== 'Resolved').length
  const pendingLeave = leaveRequests.filter((l) => l.status === 'Pending').length
  const pendingVisitors = visitors.filter((v) => v.status === 'Pending Approval').length
  const checkedInVisitors = visitors.filter((v) => v.status === 'Checked In').length
  const occupancyPercent = capacity ? Math.round((occupied / capacity) * 100) : 0

  // 1. ADMIN DASHBOARD: Simple, administrative ONLY
  if (role === 'admin') {
    const totalStudents = userDirectory.filter((u) => u.role === 'student').length
    const totalWardens = userDirectory.filter((u) => u.role === 'warden').length

    return (
      <div className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Central Administration</span>
            <h1>Campus Systems &amp; Hostel Overview</h1>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/app/users')}>
              <Users size={15} /> Manage User Directory
            </button>
          </div>
        </div>

        <div className="stat-grid">
          <StatCard icon={Users} label="Registered Students" value={totalStudents} delta="Across 3 residential blocks" tone="teal" />
          <StatCard icon={Building2} label="Campus Wardens" value={totalWardens} delta="Active faculty mentors" tone="ok" />
          <StatCard icon={DoorOpen} label="Total Rooms" value={rooms.length} delta={`${occupied}/${capacity} Beds Occupied`} tone="brass" />
          <StatCard icon={Activity} label="Occupancy Rate" value={`${occupancyPercent}%`} delta="Optimal capacity threshold" tone="teal" />
        </div>

        <div className="two-col">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Hostel Blocks Distribution</h3>
                <p>Infrastructure overview across managed residence wings</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['A Block', 'B Block', 'C Block'].map((blockName) => {
                const blockRooms = rooms.filter((r) => r.block === blockName)
                const blkOccupied = blockRooms.reduce((s, r) => s + r.occupied, 0)
                const blkCap = blockRooms.reduce((s, r) => s + r.capacity, 0)
                const percent = blkCap ? Math.round((blkOccupied / blkCap) * 100) : 0
                return (
                  <div key={blockName} className="card" style={{ padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong style={{ fontSize: 13.5 }}>{blockName}</strong>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{blkOccupied}/{blkCap} ({percent}%)</span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: 'var(--accent-border)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Administrative Directory Roster</h3>
                <p>Recent accounts provisioned on the platform</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/users')}>
                View All <ArrowRight size={13} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {userDirectory.slice(0, 4).map((u) => (
                <div key={u.id} className="card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{u.rollNo} · {u.department}</div>
                  </div>
                  <Badge tone={u.role === 'admin' ? 'info' : u.role === 'warden' ? 'brass' : 'ok'}>
                    {u.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. WARDEN DASHBOARD: Operational Command Center with Simulation Link
  if (role === 'warden') {
    const priorityRows = [
      { label: 'High', tone: 'pink', value: complaints.filter((c) => c.priority === 'High').length },
      { label: 'Medium', tone: 'blue', value: complaints.filter((c) => c.priority === 'Medium').length },
      { label: 'Low', tone: 'teal', value: complaints.filter((c) => c.priority === 'Low').length },
    ]

    return (
      <div className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-border)' }}>
              <ShieldAlert size={14} /> Warden Command &amp; Operations Center
            </span>
            <h1>Good day, Dr. Sundaram</h1>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/app/simulation')}>
              <Cpu size={15} /> Launch What-If Simulation
            </button>
          </div>
        </div>

        <div className="stat-grid">
          <StatCard icon={Building2} label="Hostel Occupancy" value={`${occupied}/${capacity}`} delta={`${occupancyPercent}% allocated`} tone="teal" />
          <StatCard icon={MessageSquareWarning} label="Open Complaints" value={openComplaints} tone="warn" />
          <StatCard icon={CalendarClock} label="Pending Leave Outpasses" value={pendingLeave} tone="brass" />
          <StatCard icon={UserCheck} label="Pending Visitors" value={pendingVisitors} tone="info" />
        </div>

        {/* Emergency SOS Banner if active */}
        {activeSosCount > 0 && (
          <div
            style={{
              background: '#FEF2F2',
              border: '2px solid #DC2626',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldAlert size={22} color="#DC2626" className="spin-slow" />
              <div>
                <strong style={{ color: '#991B1B', fontSize: 14 }}>
                  {activeSosCount} Active Emergency SOS Alert(s) Detected!
                </strong>
                <p style={{ margin: 0, fontSize: 12, color: '#7F1D1D' }}>
                  Student distress beacon is awaiting patrol dispatch response.
                </p>
              </div>
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => navigate('/app/sos-monitor')}>
              Open SOS Monitor Desk <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* Night Roll-Call Live Status Banner */}
        <div
          className="panel"
          style={{
            background: 'linear-gradient(135deg, rgba(124, 252, 0, 0.04) 0%, rgba(13, 27, 20, 0.8) 100%)',
            border: '1.5px solid rgba(124, 252, 0, 0.3)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(124, 252, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={22} color="var(--accent-green, #7CFC00)" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: 14.5 }}>Night Attendance &amp; Campus Geofence Live Board</strong>
                  <span className="badge badge-ok">Attendance Window: 08:00 – 09:30 PM</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span>Verified Present: <strong style={{ color: 'var(--accent-green, #7CFC00)' }}>141 / 150 (94%)</strong></span>
                  <span>On Approved Outpass: <strong style={{ color: 'var(--text-main)' }}>6</strong></span>
                  <span>Unverified / Awaiting: <strong style={{ color: '#ffaa00' }}>3</strong></span>
                </div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/app/attendance')}>
              Open Attendance Desk <ArrowRight size={13} />
            </button>
          </div>
        </div>

        <div className="two-col">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Block Occupancy Heatmap</h3>
                <p>Live status across all managed rooms</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/rooms')}>Manage</button>
            </div>
            <RoomGrid rooms={rooms} onSelect={() => navigate('/app/rooms')} />
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Recent Campus Activity</h3>
                <p>Latest requests, complaints and gate passes</p>
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
                <h3>Complaints by Priority</h3>
                <p>Facilities and maintenance work tickets</p>
              </div>
            </div>
            <MiniBarBreakdown rows={priorityRows} />
          </div>
        </div>
      </div>
    )
  }

  // 3. STUDENT DASHBOARD: Clean, grounded & featuring Daily GPS Attendance
  const myComplaints = complaints.filter((c) => c.roomNumber === (room?.roomNumber || 'A-101'))
  const myLeave = leaveRequests.filter((l) => l.roomNumber === (room?.roomNumber || 'A-101'))
  const unread = notifications.filter((n) => !n.read).length
  const attendanceList = useSelector((state) => state.attendance?.list || [])
  const myAttendance = attendanceList.find((a) => a.studentRoll === (user?.rollNo || '24104031'))
  const isRollCallVerified = myAttendance?.verified

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Welcome</span>
          <h1>Hi {user?.name ? user.name.split(' ')[0] : 'Keerthana'}, here&apos;s your day</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/app/complaints')}>
            Raise Complaint
          </button>
        </div>
      </div>

      {/* DAILY NIGHT ROLL-CALL ATTENDANCE STATUS CARD */}
      <div
        className="panel"
        style={{
          background: isRollCallVerified ? 'rgba(124, 252, 0, 0.05)' : 'rgba(255, 170, 0, 0.08)',
          border: `1.5px solid ${isRollCallVerified ? 'var(--accent-border, #7CFC00)' : '#ffaa00'}`,
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: isRollCallVerified ? 'rgba(124, 252, 0, 0.15)' : 'rgba(255, 170, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isRollCallVerified ? <CheckCircle2 size={22} color="var(--accent-green, #7CFC00)" /> : <Clock size={22} color="#ffaa00" />}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-main)' }}>
                {isRollCallVerified ? 'Attendance: Verified Present' : 'Attendance: Check-in Required'}
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isRollCallVerified
                  ? `Checked in at ${myAttendance.time} via ${myAttendance.verificationType}. Geofenced at ${myAttendance.block}.`
                  : 'Mandatory attendance between 08:00 PM – 09:30 PM. Verify attendance using campus GPS & Biometric scan.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => navigate('/app/attendance')}
          >
            {isRollCallVerified ? 'View Attendance Pass' : 'Verify Attendance (GPS & Biometric)'} <ArrowRight size={13} />
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={DoorOpen} label="Your Room" value={room?.roomNumber || 'A-101'} delta={`${room?.block || 'A Block'} · Floor ${room?.floor || 1}`} tone="teal" />
        <StatCard icon={MessageSquareWarning} label="Active Complaints" value={myComplaints.length} tone="warn" />
        <StatCard icon={CalendarClock} label="Outpass Status" value={myLeave.length > 0 ? myLeave[0].status : 'None'} tone="brass" />
        <StatCard icon={Users} label="Unread Notices" value={unread} tone="ok" />
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Room {room?.roomNumber || 'A-101'}</h3>
              <p>{room?.roomType || 'Triple'} · {room?.block || 'A Block'}, Floor {room?.floor || 1}</p>
            </div>
            <Badge>{room?.status || 'Full'}</Badge>
          </div>
          <div className="entity-card-meta" style={{ marginBottom: 14 }}>
            Occupancy: {room?.occupied || 3} of {room?.capacity || 3} beds filled
          </div>
          <div className="card-grid">
            {room?.roommates.map((mate) => (
              <div className="entity-card card" key={mate}>
                <div className="entity-card-head">
                  <h4>{mate}</h4>
                </div>
                <span className="entity-card-id mono">Roommate</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Recent Activity &amp; Updates</h3>
              <p>Your requests and campus notices</p>
            </div>
          </div>
          <ActivityFeed complaints={myComplaints} leaveRequests={myLeave} notifications={notifications} />
        </div>
      </div>
    </div>
  )
}
