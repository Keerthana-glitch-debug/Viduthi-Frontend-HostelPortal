import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  DoorOpen, MessageSquareWarning, CalendarClock, UserCheck, Users,
  Building2, Sparkles, Cpu, Map, Dumbbell, ShieldAlert, Bot,
  ArrowRight, CheckCircle2, AlertTriangle, Clock, Activity,
  UtensilsCrossed, HeartPulse, Scale, Stethoscope, FileText,
  Download, FileSpreadsheet,
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
import { selectAttendanceList, fetchAttendanceRecords } from '../store/slices/attendanceSlice'
import { pushToast } from '../store/slices/uiSlice'
import { exportToCsv } from '../utils/exportCsv'
import {
  selectDoctorStatus,
  selectLastCheckIn,
  selectWaitingQueue,
  selectCompletedConsultations,
  checkInDoctor,
} from '../store/slices/clinicSlice'
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
  const attendanceList = useSelector(selectAttendanceList)
  const doctorStatus = useSelector(selectDoctorStatus)
  const lastCheckIn = useSelector(selectLastCheckIn)
  const waitingQueue = useSelector(selectWaitingQueue)
  const completedConsultations = useSelector(selectCompletedConsultations)

  useEffect(() => {
    dispatch(fetchRooms())
    dispatch(fetchComplaints())
    dispatch(fetchLeaveRequests())
    dispatch(fetchVisitors())
    dispatch(fetchNotifications())
    dispatch(fetchAttendanceRecords())
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

    const handleExportUsers = () => {
      if (!userDirectory || userDirectory.length === 0) {
        dispatch(pushToast({ message: 'No user records to export', tone: 'warn' }))
        return
      }
      exportToCsv('vidudhi_users_registry.csv', userDirectory, {
        id: 'User ID',
        name: 'Full Name',
        role: 'Role',
        rollNo: 'Roll / Staff ID',
        department: 'Department',
        block: 'Block',
        roomNumber: 'Room Number',
        email: 'Email Address',
        phone: 'Contact Phone',
        status: 'Account Status',
      })
      dispatch(pushToast({ message: 'Users registry downloaded as .csv', tone: 'ok' }))
    }

    const handleExportComplaints = () => {
      if (!complaints || complaints.length === 0) {
        dispatch(pushToast({ message: 'No complaints records to export', tone: 'warn' }))
        return
      }
      exportToCsv('vidudhi_complaints_register.csv', complaints, {
        id: 'Complaint ID',
        title: 'Title',
        category: 'Category',
        studentName: 'Student Name',
        roomNumber: 'Room Number',
        block: 'Block',
        priority: 'Priority',
        status: 'Status',
        date: 'Date Filed',
        description: 'Description',
      })
      dispatch(pushToast({ message: 'Complaints register downloaded as .csv', tone: 'ok' }))
    }

    const handleExportLeave = () => {
      if (!leaveRequests || leaveRequests.length === 0) {
        dispatch(pushToast({ message: 'No leave requests to export', tone: 'warn' }))
        return
      }
      exportToCsv('vidudhi_leave_outpasses.csv', leaveRequests, {
        id: 'Outpass ID',
        studentName: 'Student Name',
        studentRoll: 'Roll Number',
        roomNumber: 'Room Number',
        block: 'Block',
        fromDate: 'From Date',
        toDate: 'To Date',
        reason: 'Reason for Leave',
        status: 'Approval Status',
        appliedOn: 'Application Date',
        approvedBy: 'Approved By',
      })
      dispatch(pushToast({ message: 'Leave outpasses downloaded as .csv', tone: 'ok' }))
    }

    const handleExportAttendance = () => {
      const records = attendanceList && attendanceList.length > 0 ? attendanceList : []
      if (records.length === 0) {
        dispatch(pushToast({ message: 'No attendance records to export', tone: 'warn' }))
        return
      }
      exportToCsv('vidudhi_attendance_records.csv', records, {
        id: 'Attendance ID',
        studentRoll: 'Roll Number',
        studentName: 'Student Name',
        roomNumber: 'Room Number',
        block: 'Block',
        date: 'Date',
        time: 'Check-in Time',
        verificationType: 'Verification Method',
        status: 'Attendance Status',
      })
      dispatch(pushToast({ message: 'Attendance records downloaded as .csv', tone: 'ok' }))
    }

    const handleExportRooms = () => {
      if (!rooms || rooms.length === 0) {
        dispatch(pushToast({ message: 'No room records to export', tone: 'warn' }))
        return
      }
      exportToCsv('vidudhi_rooms_and_beds.csv', rooms, {
        id: 'Room ID',
        number: 'Room Number',
        block: 'Block',
        floor: 'Floor Level',
        capacity: 'Total Capacity',
        occupied: 'Occupied Beds',
        status: 'Room Status',
      })
      dispatch(pushToast({ message: 'Rooms & bed inventory downloaded as .csv', tone: 'ok' }))
    }

    const handleExportVisitors = () => {
      if (!visitors || visitors.length === 0) {
        dispatch(pushToast({ message: 'No visitor records to export', tone: 'warn' }))
        return
      }
      exportToCsv('vidudhi_visitors_log.csv', visitors, {
        id: 'Visitor ID',
        visitorName: 'Visitor Name',
        studentName: 'Student Visited',
        studentRoll: 'Student Roll No',
        relation: 'Relationship',
        purpose: 'Visit Purpose',
        entryTime: 'Entry Timestamp',
        exitTime: 'Exit Timestamp',
        passNumber: 'Pass Number',
        status: 'Visit Status',
      })
      dispatch(pushToast({ message: 'Visitors log downloaded as .csv', tone: 'ok' }))
    }

    const handleExportAll = () => {
      handleExportUsers()
      setTimeout(() => handleExportComplaints(), 300)
      setTimeout(() => handleExportLeave(), 600)
      setTimeout(() => handleExportAttendance(), 900)
      setTimeout(() => handleExportRooms(), 1200)
      setTimeout(() => handleExportVisitors(), 1500)
      dispatch(pushToast({ message: 'Exporting all 6 CSV records to your downloads folder...', tone: 'ok' }))
    }

    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="page-header">
          <div>
            <span className="eyebrow">Central Administration</span>
            <h1>Campus Systems &amp; Hostel Overview</h1>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={handleExportAll}>
              <Download size={15} /> Download All Records (.CSV)
            </button>
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

        {/* CSV DATA EXPORT HUB FOR ADMIN */}
        <div className="panel" style={{ background: 'var(--surface)', border: '1.5px solid var(--line)' }}>
          <div className="panel-head" style={{ marginBottom: 14 }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileSpreadsheet size={18} color="var(--accent-border)" />
                Download Campus Records &amp; Data (.CSV)
              </h3>
              <p>Export live hostel registries for compliance, reporting, and offline administration</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleExportAll}>
              <Download size={14} /> Download All 6 Spreadsheets
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {/* 1. Users */}
            <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.95rem' }}>Users &amp; Resident Directory</strong>
                  <span className="badge badge-ok">{userDirectory.length} Accounts</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Complete roster of students, wardens, mess managers, and doctors with block &amp; room details.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleExportUsers} style={{ width: '100%', justifyContent: 'center' }}>
                <Download size={14} /> Download Users (.csv)
              </button>
            </div>

            {/* 2. Complaints */}
            <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.95rem' }}>Complaints &amp; Maintenance</strong>
                  <span className="badge badge-warn">{complaints.length} Tickets</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  All facility tickets, electrical/plumbing reports, student room numbers, priorities, and status.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleExportComplaints} style={{ width: '100%', justifyContent: 'center' }}>
                <Download size={14} /> Download Complaints (.csv)
              </button>
            </div>

            {/* 3. Leave Requests */}
            <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.95rem' }}>Leave Requests &amp; Outpasses</strong>
                  <span className="badge badge-info">{leaveRequests.length} Outpasses</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Digital gate passes, date ranges, emergency reasons, student roll numbers, and approval logs.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleExportLeave} style={{ width: '100%', justifyContent: 'center' }}>
                <Download size={14} /> Download Leave Passes (.csv)
              </button>
            </div>

            {/* 4. Attendance */}
            <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.95rem' }}>Attendance &amp; Roll-Call</strong>
                  <span className="badge badge-ok">{attendanceList.length} Records</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Night roll-call verification logs, biometric face/fingerprint timestamps, and room checks.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleExportAttendance} style={{ width: '100%', justifyContent: 'center' }}>
                <Download size={14} /> Download Attendance (.csv)
              </button>
            </div>

            {/* 5. Rooms */}
            <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.95rem' }}>Rooms &amp; Bed Capacity</strong>
                  <span className="badge badge-ok">{rooms.length} Rooms</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Hostel room inventory, blocks, floor numbers, bed capacity, and active occupancy.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleExportRooms} style={{ width: '100%', justifyContent: 'center' }}>
                <Download size={14} /> Download Rooms (.csv)
              </button>
            </div>

            {/* 6. Visitors */}
            <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.95rem' }}>Visitor Gate Passes</strong>
                  <span className="badge badge-info">{visitors.length} Visitors</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Campus visitor entry timestamps, relationship to student, purpose, and pass IDs.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleExportVisitors} style={{ width: '100%', justifyContent: 'center' }}>
                <Download size={14} /> Download Visitors (.csv)
              </button>
            </div>
          </div>
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
            <h1>Good day, Jeyanthi</h1>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/app/simulation')}>
              <Activity size={15} /> Open Daily Forecaster
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
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, var(--surface) 100%)',
            border: '1.5px solid var(--accent-border)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(34, 197, 94, 0.15)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={22} color="var(--accent-border)" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: 14.5 }}>Night Attendance &amp; Campus Geofence Live Board</strong>
                  <span className="badge badge-ok">Attendance Window: 08:00 – 09:30 PM</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span>Verified Present: <strong style={{ color: 'var(--teal-border, #15803D)' }}>141 / 150 (94%)</strong></span>
                  <span>On Approved Outpass: <strong style={{ color: 'var(--text-main)' }}>6</strong></span>
                  <span>Unverified / Awaiting: <strong style={{ color: '#D97706' }}>3</strong></span>
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

  const messMenu = useSelector((state) => state.mess?.menu || [])
  const messFeedback = useSelector((state) => state.mess?.feedback || [])
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const todayDayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][todayIndex] || 'Monday'
  const todayMessMenu = messMenu.find((m) => m.day === todayDayName) || messMenu[0] || {}

  // 3. MESS MANAGER DASHBOARD: Food Operations, Headcount Forecast, & Stock Management
  if (role === 'mess_manager') {
    const foodComplaints = complaints.filter((c) => c.category === 'Mess' || c.title?.toLowerCase().includes('food') || c.title?.toLowerCase().includes('mess'))

    return (
      <div className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-border)' }}>
              <UtensilsCrossed size={14} /> Catering &amp; Dietary Command Center
            </span>
            <h1>Welcome, {user?.name || 'Mrs. Muthumari'}</h1>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/app/mess')}>
              <UtensilsCrossed size={15} /> Open Mess Operations Console
            </button>
          </div>
        </div>

        <div className="stat-grid">
          <StatCard icon={Users} label="Today's Meal Headcount" value="148 / 150" delta="98.6% residential turnout" tone="teal" />
          <StatCard icon={Scale} label="Food Wastage Index" value="4.6 kg" delta="22% below weekly limit" tone="ok" />
          <StatCard icon={MessageSquareWarning} label="Food Inquiries / Complaints" value={foodComplaints.length} delta="Actionable feedback" tone="warn" />
          <StatCard icon={AlertTriangle} label="Low Stock Inventory" value="1 Alert" delta="Sunflower Cooking Oil" tone="bad" />
        </div>

        <div className="two-col">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Today&apos;s Active Serving Schedule ({todayDayName})</h3>
                <p>{todayMessMenu.dietType || 'Pure Veg'} · Serving at Annapoorna Dining Hall</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/mess')}>
                Edit Schedule <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: 13, color: 'var(--accent-border)' }}>Breakfast (07:30 – 09:30 AM)</strong>
                  <span className="badge badge-ok">Served (142 Plates)</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink)' }}>{todayMessMenu.breakfast || 'Idli, hot sambar, chutney, medu vada'}</div>
              </div>

              <div className="card" style={{ padding: 12, background: 'var(--accent-soft)', border: '1.5px solid var(--accent-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: 13, color: '#059669' }}>Lunch Session (12:30 – 02:30 PM)</strong>
                  <span className="badge badge-ok">Live Serving Now</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 600 }}>{todayMessMenu.lunch || 'Steamed rice, sambar, poriyal, curd, appalam'}</div>
                {todayMessMenu.lunchSpecial && (
                  <div style={{ fontSize: 11.5, color: 'var(--accent-border)', marginTop: 4, fontWeight: 700 }}>
                    Chef Special: {todayMessMenu.lunchSpecial}
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: 13, color: '#D97706' }}>Evening Snacks (04:30 – 05:45 PM)</strong>
                  <span className="badge badge-brass">Next Up</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink)' }}>{todayMessMenu.snacks || 'Filter Coffee / Tea with Snacks'}</div>
              </div>

              <div className="card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: 13, color: '#0284C7' }}>Dinner (07:30 – 09:30 PM)</strong>
                  <span className="badge badge-info">145 Projected</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink)' }}>{todayMessMenu.dinner || 'Phulka chapati, paneer butter masala, rice, rasam'}</div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Student Dining Reviews &amp; Quality Feedback</h3>
                <p>{messFeedback.length} verified resident reviews recorded</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/mess')}>
                View All Reviews <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messFeedback.slice(0, 4).map((f) => (
                <div key={f.id} className="card" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13 }}>{f.studentName} ({f.mealType} - {f.day})</strong>
                    <span className="badge badge-ok">{f.rating} / 5 Stars</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
                    &ldquo;{f.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 4. DOCTOR DASHBOARD: Campus Health Center, Live OPD Queue, Prescriptions & Check-In
  if (role === 'doctor') {
    const medicalLeaves = leaveRequests.filter((l) =>
      l.reason?.toLowerCase().includes('medical') ||
      l.reason?.toLowerCase().includes('doctor') ||
      l.reason?.toLowerCase().includes('hospital') ||
      l.reason?.toLowerCase().includes('health') ||
      l.status === 'Pending'
    )

    return (
      <div className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669' }}>
              <HeartPulse size={14} className="spin-slow" /> Campus Health Clinic &amp; Medical Operations
            </span>
            <h1>Good day, {user?.name || 'Dr. Madhu'}</h1>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/app/sos-monitor')}>
              <ShieldAlert size={15} /> Medical SOS Monitor
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/app/clinic')}>
              <Stethoscope size={15} /> Open Clinic &amp; Prescriptions
            </button>
          </div>
        </div>

        {/* DOCTOR AVAILABILITY & CHECK-IN BANNER */}
        <div
          className="panel"
          style={{
            background: doctorStatus === 'Available in Hostel Clinic'
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)',
            border: `1.5px solid ${doctorStatus === 'Available in Hostel Clinic' ? '#10B981' : '#F59E0B'}`,
            borderRadius: 14,
            padding: '16px 20px',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: doctorStatus === 'Available in Hostel Clinic' ? '#ECFDF5' : '#FFFBEB',
                  border: `1.5px solid ${doctorStatus === 'Available in Hostel Clinic' ? '#10B981' : '#F59E0B'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: doctorStatus === 'Available in Hostel Clinic' ? '#065F46' : '#92400E',
                }}
              >
                <Stethoscope size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: 14.5 }}>
                    {doctorStatus === 'Available in Hostel Clinic'
                      ? 'Doctor Checked In & Available in Hostel Clinic'
                      : `Doctor Status: ${doctorStatus}`}
                  </strong>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: doctorStatus === 'Available in Hostel Clinic' ? '#10B981' : '#F59E0B',
                      boxShadow: doctorStatus === 'Available in Hostel Clinic' ? '0 0 0 3px rgba(16, 185, 129, 0.25)' : 'none',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginTop: 4 }}>
                  Campus Medical Officer (Dr. Madhu · Reg #TN-MC-84291) · <em>{lastCheckIn}</em>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {doctorStatus !== 'Available in Hostel Clinic' ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => dispatch(checkInDoctor())}
                >
                  <UserCheck size={14} /> Check In as Available (Entered Hostel)
                </button>
              ) : (
                <span className="badge badge-ok" style={{ padding: '6px 12px' }}>
                  <CheckCircle2 size={12} style={{ marginRight: 4 }} /> On Duty in Clinic
                </span>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/app/clinic')}
              >
                Manage Clinic Queue <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        <div className="stat-grid">
          <StatCard
            icon={Clock}
            label="Students Waiting (OPD)"
            value={`${waitingQueue.length} Students`}
            delta={waitingQueue.length > 0 ? 'Appointments in Queue' : 'Queue Clear'}
            tone={waitingQueue.length > 0 ? 'warn' : 'ok'}
          />
          <StatCard
            icon={FileText}
            label="Prescriptions & Receipts"
            value={`${completedConsultations.length} Issued`}
            delta="Electronic records & bill receipts"
            tone="teal"
          />
          <StatCard
            icon={ShieldAlert}
            label="Active SOS Distress Calls"
            value={activeSosCount}
            delta={activeSosCount > 0 ? 'Immediate Attention' : 'All Clear / Standby'}
            tone={activeSosCount > 0 ? 'bad' : 'ok'}
          />
          <StatCard
            icon={CalendarClock}
            label="Medical Leaves for Review"
            value={medicalLeaves.length}
            delta="Health outpasses"
            tone="brass"
          />
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
              <HeartPulse size={22} color="#DC2626" className="spin-slow" />
              <div>
                <strong style={{ color: '#991B1B', fontSize: 14 }}>
                  {activeSosCount} Active Medical SOS Beacon(s) Detected!
                </strong>
                <p style={{ margin: 0, fontSize: 12, color: '#7F1D1D' }}>
                  Student distress beacon is awaiting medical paramedic triage dispatch.
                </p>
              </div>
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => navigate('/app/sos-monitor')}>
              Open Medical Desk <ArrowRight size={13} />
            </button>
          </div>
        )}

        <div className="two-col">
          {/* OPD WAITING APPOINTMENTS QUEUE */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Students Waiting for Appointment</h3>
                <p>{waitingQueue.length} resident patients awaiting doctor consultation</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/clinic')}>
                View All Queue <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {waitingQueue.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>
                  <CheckCircle2 size={28} color="#10B981" style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: 0 }}>No students currently in waiting queue.</p>
                </div>
              ) : (
                waitingQueue.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="card"
                    style={{
                      padding: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: s.priority === 'Urgent' ? '3px solid #DC2626' : '3px solid var(--accent-border)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong style={{ fontSize: 13.5 }}>{s.studentName}</strong>
                        <span className="mono" style={{ fontSize: 11, background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>
                          {s.token}
                        </span>
                        <Badge tone={s.priority === 'Urgent' ? 'bad' : 'ok'}>
                          {s.priority}
                        </Badge>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 3 }}>
                        Room {s.roomNumber} ({s.rollNo}) · <em>{s.symptoms.slice(0, 52)}...</em>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => navigate('/app/clinic')}
                    >
                      <Stethoscope size={13} /> Consult
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MEDICAL CLEARANCE ROSTER */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Medical Clearances &amp; Health Leave Roster</h3>
                <p>Applications requiring campus physician authorization</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/leave')}>
                Review Desk <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {medicalLeaves.slice(0, 4).map((l) => (
                <div key={l.id} className="card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 13 }}>{l.studentName} ({l.roomNumber})</strong>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                      {l.fromDate} – {l.toDate} · &ldquo;{l.reason}&rdquo;
                    </div>
                  </div>
                  <Badge tone={l.status === 'Approved' ? 'ok' : l.status === 'Pending' ? 'warn' : 'bad'}>
                    {l.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="two-col">
          {/* RECENT PRESCRIPTIONS & CONSULTATION RECEIPTS */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Issued Prescriptions &amp; Consultation Receipts</h3>
                <p>Recent electronic medical records and dispensary bills</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/clinic')}>
                Open Records <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {completedConsultations.slice(0, 3).map((c) => (
                <div key={c.id} className="card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: 13 }}>{c.studentName} (Room {c.roomNumber})</strong>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{c.receiptNo}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600, marginTop: 2 }}>
                      Diagnosis: {c.diagnosis}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    onClick={() => navigate('/app/clinic')}
                  >
                    <FileText size={12} /> View Rx / Receipt
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* HEALTH CENTER & EMERGENCY CONTACTS */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Health Center &amp; Emergency Contacts</h3>
                <p>Campus medical preparedness protocol</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Campus Paramedic Ambulance</strong>
                  <span className="badge badge-ok">24/7 Available</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                  Vehicle: TN-72-G-4010 · Ext: 108 / Mobile: +91 94440 22334
                </div>
              </div>

              <div className="card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Infirmary Nebulization &amp; Oxygen Bay</strong>
                  <span className="badge badge-ok">Stock Optimal</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                  2 Concentrators online · 6 Saline IV sets ready
                </div>
              </div>

              <div className="card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Isolation &amp; Quarantine Ward</strong>
                  <span className="badge badge-info">Zero Active Cases</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                  Health Wing Ward 2 · 4 Isolated Beds disinfected
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 5. STUDENT DASHBOARD: Clean, grounded & featuring Daily GPS Attendance
  const myComplaints = complaints.filter((c) => c.roomNumber === (room?.roomNumber || 'A-101'))
  const myLeave = leaveRequests.filter((l) => l.roomNumber === (room?.roomNumber || 'A-101'))
  const unread = notifications.filter((n) => !n.read).length
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

      {/* CAMPUS CLINIC STATUS NOTICE */}
      <div
        className="panel"
        style={{
          background: doctorStatus === 'Available in Hostel Clinic' ? 'rgba(16, 185, 129, 0.05)' : 'var(--surface)',
          border: `1px solid ${doctorStatus === 'Available in Hostel Clinic' ? '#10B981' : 'var(--line)'}`,
          borderRadius: 10,
          padding: '12px 18px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Stethoscope size={18} color={doctorStatus === 'Available in Hostel Clinic' ? '#10B981' : 'var(--ink-faint)'} />
          <span style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>
            <strong>Campus Health Clinic:</strong>{' '}
            {doctorStatus === 'Available in Hostel Clinic'
              ? 'Dr. Madhu is Available on Duty in Hostel Clinic.'
              : `Doctor Status: ${doctorStatus}.`}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={() => navigate('/app/clinic')}
        >
          Hostel Clinic &amp; Prescriptions <ArrowRight size={12} />
        </button>
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
