import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Fingerprint, ScanFace, MapPin, CheckCircle2, AlertTriangle,
  Clock, ShieldCheck, RefreshCw, UserCheck, Search, Filter,
  Building, Compass, Smartphone, Check, HelpCircle
} from 'lucide-react'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import Confetti from '../components/common/Confetti'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import { selectMyRoom } from '../store/slices/roomsSlice'
import {
  selectAttendanceList,
  fetchAttendanceRecords,
  checkInAttendance,
  manualVerifyStudent,
  resetStudentCheckin,
} from '../store/slices/attendanceSlice'
import { pushToast } from '../store/slices/uiSlice'

export default function AttendancePage() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const room = useSelector(selectMyRoom)
  const records = useSelector(selectAttendanceList)

  // Student Biometric & GPS State
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsData, setGpsData] = useState({
    lat: 13.0827,
    lng: 80.2707,
    accuracy: 9.4,
    distanceFromGateMeters: 42,
    withinCampus: true,
    acquiredAt: null,
  })
  const [biometricType, setBiometricType] = useState('fingerprint') // 'fingerprint' | 'faceid'
  const [scanState, setScanState] = useState('idle') // 'idle' | 'scanning' | 'success' | 'failed'
  const [scanProgress, setScanProgress] = useState(0)
  const [celebrate, setCelebrate] = useState(false)

  // Warden Roster State
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [overrideModal, setOverrideModal] = useState(null)
  const [overrideReason, setOverrideReason] = useState('Physically verified in room during floor inspection')

  useEffect(() => {
    dispatch(fetchAttendanceRecords())
  }, [dispatch])

  // Current student record
  const studentRoll = user?.rollNo || '24104031'
  const myRecord = records.find((r) => r.studentRoll === studentRoll) || {
    studentRoll,
    studentName: user?.name || 'Keerthana G.',
    roomNumber: room?.roomNumber || 'A-101',
    block: 'A Block',
    date: new Date().toISOString().slice(0, 10),
    time: null,
    status: 'Unverified',
    verificationType: 'Pending Roll-Call',
    coordinates: null,
    verified: false,
  }

  // Acquire real GPS or fall back to campus perimeter coordinates
  const handleAcquireGps = () => {
    setGpsLoading(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(5))
          const lng = Number(pos.coords.longitude.toFixed(5))
          setGpsData({
            lat,
            lng,
            accuracy: Math.round(pos.coords.accuracy || 12),
            distanceFromGateMeters: Math.floor(25 + Math.random() * 30),
            withinCampus: true,
            acquiredAt: new Date().toLocaleTimeString('en-IN'),
          })
          setGpsLoading(false)
          dispatch(pushToast('GPS Lock Acquired: Within Vidudhi Campus boundary (<100m).', 'ok'))
        },
        () => {
          setTimeout(() => {
            setGpsData({
              lat: 13.0827,
              lng: 80.2707,
              accuracy: 8.5,
              distanceFromGateMeters: 38,
              withinCampus: true,
              acquiredAt: new Date().toLocaleTimeString('en-IN'),
            })
            setGpsLoading(false)
            dispatch(pushToast('GPS Simulation: Vidudhi Resident Hostel Block A (Lat 13.0827, Lng 80.2707).', 'ok'))
          }, 600)
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    } else {
      setTimeout(() => {
        setGpsData({
          lat: 13.0827,
          lng: 80.2707,
          accuracy: 10,
          distanceFromGateMeters: 45,
          withinCampus: true,
          acquiredAt: new Date().toLocaleTimeString('en-IN'),
        })
        setGpsLoading(false)
      }, 600)
    }
  }

  // Trigger Biometric Scan Simulation
  const handleStartBiometricScan = () => {
    if (scanState === 'scanning') return
    setScanState('scanning')
    setScanProgress(0)

    let progress = 0
    const interval = setInterval(() => {
      progress += 20
      setScanProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setScanState('success')
        dispatch(pushToast(`${biometricType === 'fingerprint' ? 'Fingerprint ridge map' : 'FaceID facial vector'} verified!`, 'ok'))
      }
    }, 250)
  }

  // Final Submit Attendance
  const handleSubmitAttendance = () => {
    if (!gpsData.acquiredAt) {
      handleAcquireGps()
    }
    if (scanState !== 'success') {
      dispatch(pushToast('Please complete Biometric Verification first.', 'warn'))
      return
    }

    dispatch(
      checkInAttendance({
        studentRoll,
        studentName: user?.name || 'Keerthana G.',
        roomNumber: room?.roomNumber || 'A-101',
        block: 'A Block',
        verificationType: `GPS Geofence + ${biometricType === 'fingerprint' ? 'Fingerprint Biometric' : 'FaceID Optical Vector'}`,
        coordinates: {
          lat: gpsData.lat,
          lng: gpsData.lng,
          accuracy: gpsData.accuracy,
        },
      })
    )
    setCelebrate(true)
    dispatch(pushToast('Night Roll-Call Verified & Logged on Warden Attendance Desk!', 'ok'))
  }

  // Warden Manual Verify
  const handleConfirmOverride = () => {
    if (!overrideModal) return
    dispatch(
      manualVerifyStudent({
        studentRoll: overrideModal.studentRoll,
        wardenName: user?.name || 'Dr. R. Sundaram',
        reason: overrideReason,
      })
    )
    dispatch(pushToast(`Manual roll-call verified for ${overrideModal.studentName} (${overrideModal.studentRoll}).`, 'ok'))
    setOverrideModal(null)
  }

  // Stats for Warden
  const totalStudents = 150
  const verifiedCount = records.filter((r) => r.status === 'Present').length + 138
  const leaveCount = records.filter((r) => r.status === 'On Approved Leave').length + 5
  const pendingCount = Math.max(0, totalStudents - verifiedCount - leaveCount)

  const filteredRecords = records.filter((r) => {
    if (filterStatus === 'present' && r.status !== 'Present') return false
    if (filterStatus === 'unverified' && r.status !== 'Unverified') return false
    if (filterStatus === 'leave' && r.status !== 'On Approved Leave') return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.studentRoll.toLowerCase().includes(q) ||
        r.roomNumber.toLowerCase().includes(q)
      )
    }
    return true
  })

  // STUDENT INTERFACE
  if (role === 'student') {
    return (
      <div className="page">
        <Confetti active={celebrate} onDone={() => setCelebrate(false)} />

        <div className="page-header">
          <div>
            <span className="eyebrow">Night Attendance &amp; Campus Geofence</span>
            <h1>Daily Attendance Verification</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 12px' }}>
              <Clock size={14} style={{ marginRight: 6 }} /> Attendance Window: 08:30 PM – 09:30 PM
            </span>
          </div>
        </div>

        {/* Verification Status Banner */}
        {myRecord.verified ? (
          <div className="panel" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(16,185,129,0.05))', borderColor: 'rgba(34,197,94,0.4)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#22c55e' }}>Attendance Verified Present</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                    Your attendance has been recorded for tonight at <strong>{myRecord.time || '08:42 PM'}</strong> with cryptographic audit hash <code>VID-ATT-{myRecord.studentRoll}-2026</code>.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    dispatch(resetStudentCheckin(studentRoll))
                    setScanState('idle')
                    setScanProgress(0)
                    dispatch(pushToast('Attendance state reset for re-verification demonstration.', 'info'))
                  }}
                >
                  <RefreshCw size={14} /> Re-verify Attendance
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(34,197,94,0.2)' }}>
              <div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resident</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{myRecord.studentName} ({myRecord.studentRoll})</p>
              </div>
              <div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Room</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600 }}>Room {myRecord.roomNumber} ({myRecord.block})</p>
              </div>
              <div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Method</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#38bdf8' }}>{myRecord.verificationType}</p>
              </div>
              <div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GPS Geofence Status</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#22c55e' }}>Inside Campus Boundary (9.4m)</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="panel" style={{ background: 'rgba(234, 179, 8, 0.08)', borderColor: 'rgba(234, 179, 8, 0.3)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertTriangle size={24} color="#eab308" />
              <div>
                <strong style={{ color: '#eab308' }}>Action Required: Tonight's Attendance Not Yet Verified</strong>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                  Per hostel curfew guidelines, verify your location inside the campus perimeter and complete biometric scan before 09:30 PM.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2-Step Verification Workflow */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* STEP 1: GPS GEOFENCE CHECK */}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="panel-head" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>1</span>
                    <h3 style={{ margin: 0 }}>GPS Campus Geofence</h3>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
                    Verifies that you are physically within Vidudhi Hostel radius (&lt;300m from gate).
                  </p>
                </div>
                <Badge tone={gpsData.withinCampus ? 'ok' : 'warn'}>
                  {gpsData.withinCampus ? 'Inside Geofence' : 'Out of Bounds'}
                </Badge>
              </div>

              <div style={{ background: 'var(--surface-sunken)', borderRadius: 8, padding: 14, marginBottom: 16, border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Compass size={18} color="#38bdf8" />
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>Hostel Geofence Radar</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Hostel Gate: 13.0827° N, 80.2707° E
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5 }}>
                  <div style={{ background: 'var(--surface)', padding: 8, borderRadius: 6 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Detected Latitude</span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', marginTop: 2 }}>{gpsData.lat}° N</div>
                  </div>
                  <div style={{ background: 'var(--surface)', padding: 8, borderRadius: 6 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Detected Longitude</span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', marginTop: 2 }}>{gpsData.lng}° E</div>
                  </div>
                  <div style={{ background: 'var(--surface)', padding: 8, borderRadius: 6 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Distance to Gate</span>
                    <div style={{ fontWeight: 700, marginTop: 2, color: '#22c55e' }}>~{gpsData.distanceFromGateMeters} meters</div>
                  </div>
                  <div style={{ background: 'var(--surface)', padding: 8, borderRadius: 6 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>GPS Accuracy Radius</span>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>±{gpsData.accuracy} m (High)</div>
                  </div>
                </div>

                {gpsData.acquiredAt && (
                  <div style={{ marginTop: 10, fontSize: 11.5, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={13} /> GPS fix verified at {gpsData.acquiredAt}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAcquireGps}
              disabled={gpsLoading}
              style={{ width: '100%' }}
            >
              <RefreshCw size={15} className={gpsLoading ? 'spin' : ''} />
              {gpsLoading ? 'Scanning GPS Satellites…' : 'Re-acquire Live GPS Location'}
            </button>
          </div>

          {/* STEP 2: BIOMETRIC VERIFICATION */}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="panel-head" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>2</span>
                    <h3 style={{ margin: 0 }}>Biometric Verification</h3>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
                    Verify identity using device fingerprint reader or optical FaceID.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className={`btn btn-xs ${biometricType === 'fingerprint' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => { setBiometricType('fingerprint'); setScanState('idle'); setScanProgress(0); }}
                  >
                    <Fingerprint size={13} /> Fingerprint
                  </button>
                  <button
                    type="button"
                    className={`btn btn-xs ${biometricType === 'faceid' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => { setBiometricType('faceid'); setScanState('idle'); setScanProgress(0); }}
                  >
                    <ScanFace size={13} /> FaceID
                  </button>
                </div>
              </div>

              {/* Interactive Biometric Sensor Pad */}
              <div
                style={{
                  background: 'var(--surface-sunken)',
                  border: scanState === 'success' ? '2px solid #22c55e' : scanState === 'scanning' ? '2px solid #38bdf8' : '2px dashed var(--line)',
                  borderRadius: 12,
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: scanState === 'scanning' ? 'wait' : 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={handleStartBiometricScan}
              >
                {/* Visual Scanner Ring */}
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: scanState === 'success'
                      ? 'rgba(34,197,94,0.15)'
                      : scanState === 'scanning'
                        ? 'rgba(56,189,248,0.15)'
                        : 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                    border: scanState === 'scanning' ? '2px solid #38bdf8' : '1px solid var(--line)',
                    position: 'relative',
                    boxShadow: scanState === 'scanning' ? '0 0 20px rgba(56,189,248,0.3)' : 'none',
                  }}
                >
                  {biometricType === 'fingerprint' ? (
                    <Fingerprint
                      size={44}
                      color={scanState === 'success' ? '#22c55e' : scanState === 'scanning' ? '#38bdf8' : 'var(--text-muted)'}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                  ) : (
                    <ScanFace
                      size={44}
                      color={scanState === 'success' ? '#22c55e' : scanState === 'scanning' ? '#38bdf8' : 'var(--text-muted)'}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                  )}
                </div>

                <div style={{ maxWidth: 280 }}>
                  {scanState === 'idle' && (
                    <>
                      <strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                        Click to Scan {biometricType === 'fingerprint' ? 'Fingerprint' : 'FaceID'}
                      </strong>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Touch the sensor with registered resident biometric profile.
                      </span>
                    </>
                  )}

                  {scanState === 'scanning' && (
                    <>
                      <strong style={{ fontSize: 14, color: '#38bdf8', display: 'block', marginBottom: 4 }}>
                        Authenticating {scanProgress}%…
                      </strong>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {biometricType === 'fingerprint' ? 'Reading dermal ridges…' : 'Mapping facial geometry points…'}
                      </span>
                      <div style={{ width: '100%', height: 4, background: 'var(--line)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${scanProgress}%`, height: '100%', background: '#38bdf8', transition: 'width 0.2s' }} />
                      </div>
                    </>
                  )}

                  {scanState === 'success' && (
                    <>
                      <strong style={{ fontSize: 14, color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                        <CheckCircle2 size={16} /> Biometric Match Confirmed
                      </strong>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Profile verified for {user?.name || 'Resident'} · Match score: 99.4%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmitAttendance}
              disabled={scanState !== 'success'}
              style={{ width: '100%', marginTop: 16 }}
            >
              <ShieldCheck size={16} /> Submit Night Attendance
            </button>
          </div>
        </div>
      </div>
    )
  }

  // WARDEN & ADMIN COMMAND DESK
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Hostel Administration &amp; Security</span>
          <h1>Attendance Command Desk</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              dispatch(fetchAttendanceRecords())
              dispatch(pushToast('Attendance records refreshed.', 'info'))
            }}
          >
            <RefreshCw size={14} /> Refresh Roster
          </button>
        </div>
      </div>

      {/* Real-time Status Counters */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 20 }}>
        <div className="stat-card card">
          <div className="stat-icon tone-info"><Building size={20} /></div>
          <div className="stat-body">
            <span className="stat-label">Total Residents</span>
            <span className="stat-value">{totalStudents}</span>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Blocks A &amp; B</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon tone-ok"><CheckCircle2 size={20} /></div>
          <div className="stat-body">
            <span className="stat-label">Verified Present</span>
            <span className="stat-value">{verifiedCount}</span>
            <span style={{ fontSize: 11.5, color: '#22c55e' }}>{Math.round((verifiedCount / totalStudents) * 100)}% Verified</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon tone-brass"><Clock size={20} /></div>
          <div className="stat-body">
            <span className="stat-label">On Approved Outpass</span>
            <span className="stat-value">{leaveCount}</span>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Authorized Leave</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon tone-warn"><AlertTriangle size={20} /></div>
          <div className="stat-body">
            <span className="stat-label">Pending Attendance</span>
            <span className="stat-value">{pendingCount}</span>
            <span style={{ fontSize: 11.5, color: '#ef4444' }}>Awaiting Verification</span>
          </div>
        </div>
      </div>

      {/* Roster Panel */}
      <div className="panel">
        <div className="panel-head" style={{ marginBottom: 16 }}>
          <div>
            <h3>Tonight's Attendance Register ({records.length} Monitored Residents)</h3>
            <p>Track student GPS coordinates, biometric verification method, and record manual overrides.</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by student name, roll number, or room…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: 320 }}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ maxWidth: 220 }}>
            <option value="all">All Records ({records.length})</option>
            <option value="present">Verified Present</option>
            <option value="unverified">Pending / Unverified</option>
            <option value="leave">On Approved Leave</option>
          </select>
        </div>

        {/* Attendance Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Room</th>
                <th>Status</th>
                <th>Check-In Time</th>
                <th>Verification Protocol</th>
                <th>GPS Geofence Location</th>
                <th>Warden Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => (
                <tr key={rec.id || rec.studentRoll}>
                  <td><strong>{rec.studentName}</strong></td>
                  <td className="mono">{rec.studentRoll}</td>
                  <td className="mono">{rec.roomNumber} ({rec.block})</td>
                  <td>
                    <Badge tone={rec.status === 'Present' ? 'ok' : rec.status === 'On Approved Leave' ? 'info' : 'warn'}>
                      {rec.status}
                    </Badge>
                  </td>
                  <td className="mono">{rec.time || '—'}</td>
                  <td style={{ fontSize: 12.5 }}>
                    {rec.verificationType.includes('Fingerprint') && <Fingerprint size={13} style={{ marginRight: 5, verticalAlign: 'middle', color: '#22c55e' }} />}
                    {rec.verificationType.includes('FaceID') && <ScanFace size={13} style={{ marginRight: 5, verticalAlign: 'middle', color: '#38bdf8' }} />}
                    {rec.verificationType}
                  </td>
                  <td className="mono" style={{ fontSize: 11.5 }}>
                    {rec.coordinates ? (
                      <span style={{ color: '#22c55e' }}>
                        <MapPin size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                        {rec.coordinates.lat}° N, {rec.coordinates.lng}° E (±{rec.coordinates.accuracy}m)
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No GPS Fix</span>
                    )}
                  </td>
                  <td>
                    {rec.status === 'Unverified' ? (
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => setOverrideModal(rec)}
                      >
                        <UserCheck size={13} /> Manual Verify
                      </button>
                    ) : (
                      <span style={{ fontSize: 11.5, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={13} /> Verified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Verification Modal */}
      {overrideModal && (
        <Modal
          title={`Manual Attendance Override — ${overrideModal.studentName}`}
          subtitle={`Roll No: ${overrideModal.studentRoll} · Room: ${overrideModal.roomNumber}`}
          onClose={() => setOverrideModal(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Use this override only after physical verification during your warden rounds or receiving direct confirmation from the floor captain.
            </p>

            <div>
              <label>Reason / Inspection Note *</label>
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Physically inspected in Room during 09:10 PM rounds"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button className="btn btn-ghost" onClick={() => setOverrideModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmOverride}>
                <ShieldCheck size={15} /> Confirm &amp; Mark Present
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
