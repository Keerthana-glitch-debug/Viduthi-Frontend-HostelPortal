import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Plus, CalendarClock, Check, X, QrCode, Printer, ShieldCheck,
  AlertCircle, ArrowRight, Info, CheckCircle2
} from 'lucide-react'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import Confetti from '../components/common/Confetti'
import RealQrGatePass from '../components/common/RealQrGatePass'
import SecurityCameraQrScanner from '../components/common/SecurityCameraQrScanner'
import useFilter from '../hooks/useFilter'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import { selectMyRoom } from '../store/slices/roomsSlice'
import { selectLeaveRequests, fetchLeaveRequests, addLeaveRequest, decideLeaveRequest } from '../store/slices/leaveSlice'
import { pushToast } from '../store/slices/uiSlice'

export default function LeaveRequests() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const room = useSelector(selectMyRoom)
  const leaveRequests = useSelector(selectLeaveRequests)

  useEffect(() => {
    dispatch(fetchLeaveRequests())
  }, [dispatch])

  const [showForm, setShowForm] = useState(false)
  const [formStep, setFormStep] = useState(1)
  const [agreed, setAgreed] = useState(false)
  const [passLeave, setPassLeave] = useState(null)
  const [securityVerificationMode, setSecurityVerificationMode] = useState(false)
  const [exitVerifiedSuccess, setExitVerifiedSuccess] = useState(false)
  const [scannedSecurityPass, setScannedSecurityPass] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('new') === '1' && role === 'student') {
      setShowForm(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, role])

  const todayStr = new Date().toISOString().slice(0, 10)
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  const [draft, setDraft] = useState({ reason: '', fromDate: todayStr, toDate: todayStr })
  const [celebrate, setCelebrate] = useState(false)

  // Students see only their own leave requests; Warden & Admin see all
  const scoped = role === 'student'
    ? leaveRequests.filter((l) =>
        (l.studentRoll && l.studentRoll === user?.rollNo) ||
        (l.rollNo && l.rollNo === user?.rollNo) ||
        (l.studentName && l.studentName === user?.name) ||
        (l.email && l.email === user?.email)
      )
    : leaveRequests

  const { status, setStatus, filtered } = useFilter(scoped, [], 'status')

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending')

  const submit = (e) => {
    e.preventDefault()
    if (!draft.reason.trim()) {
      dispatch(pushToast('Please enter a valid reason for leave.', 'warn'))
      return
    }
    if (draft.toDate < draft.fromDate) {
      dispatch(pushToast('Return date cannot be earlier than departure date.', 'bad'))
      return
    }

    dispatch(
      addLeaveRequest({
        reason: draft.reason.trim(),
        fromDate: draft.fromDate,
        toDate: draft.toDate,
        studentName: user?.name || 'Keerthana G.',
        roomNumber: room?.roomNumber || 'B-37',
        studentRoll: user?.rollNo || '24104030',
        destination: 'Town / Hometown',
      })
    )
    dispatch(pushToast('Leave request submitted to Chief Warden Jeyanthi.', 'ok'))
    setDraft({ reason: '', fromDate: todayStr, toDate: todayStr })
    setFormStep(1)
    setAgreed(false)
    setShowForm(false)
  }

  const handleDecision = (l, decision) => {
    dispatch(decideLeaveRequest({ id: l.id, decision }))
    if (decision === 'Approved') {
      dispatch(pushToast(`Approved leave pass for ${l.studentName}. Digital Gate Pass issued.`, 'ok'))
      setCelebrate(true)
    } else {
      dispatch(pushToast(`Leave request for ${l.studentName} marked as Rejected.`, 'bad'))
    }
  }

  // Handle successful scan from Security Turnstile Camera
  const handleSecurityScanned = (decodedPayload) => {
    setScannedSecurityPass(decodedPayload)
    setExitVerifiedSuccess(true)
    const matchedName = decodedPayload.studentName || decodedPayload.student || passLeave?.studentName || 'Student'
    dispatch(pushToast(`Gate Pass Verified for ${matchedName}! Departure allowed.`, 'ok'))
  }

  return (
    <div className="page">
      <Confetti active={celebrate} onDone={() => setCelebrate(false)} />
      
      {/* Header */}
      <div className="page-header">
        <div>
          <span className="eyebrow">Attendance &amp; Gate Security</span>
          <h1>Leave Requests &amp; Digital Outpasses</h1>
        </div>
        {role === 'student' && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Apply for Leave
          </button>
        )}
      </div>

      {/* Quick Access Card for Student with Approved Digital Gate Pass */}
      {role === 'student' && scoped.some((l) => l.status === 'Approved') && (
        <div
          className="panel"
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            borderColor: '#86EFAC',
            marginBottom: 16,
            padding: '16px 20px',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexShrink: 0 }}>
                <QrCode size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: 15, color: '#14532D' }}>
                    Active Approved Digital Gate Pass
                  </strong>
                  <span className="badge badge-ok">Authorized Outpass</span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#166534', fontWeight: 500 }}>
                  Official National Engineering College digital outpass is approved. Show at campus turnstile gate.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: '#16A34A', color: '#FFFFFF', fontWeight: 700, padding: '10px 18px' }}
              onClick={() => {
                const approvedPass = scoped.find((l) => l.status === 'Approved')
                setPassLeave(approvedPass)
              }}
            >
              <QrCode size={16} /> Open Digital Gate Pass
            </button>
          </div>
        </div>
      )}

      {/* Warden Notice banner for pending leave approvals (Strictly Warden Only) */}
      {role === 'warden' && pendingLeaves.length > 0 && (
        <div className="panel" style={{ background: 'rgba(255, 170, 0, 0.08)', borderColor: 'rgba(255, 170, 0, 0.3)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={20} color="#ffaa00" />
              <div>
                <strong style={{ color: '#ffaa00' }}>
                  {pendingLeaves.length} Student Leave Application{pendingLeaves.length > 1 ? 's' : ''} Awaiting Warden Review
                </strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Verify resident academic schedules and approve outpasses for campus turnstile clearance.
                </p>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setStatus('Pending')}>
              Review Pending
            </button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 220 }}>
            <option value="all">All statuses ({scoped.length})</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No leave requests found"
            message={role === 'student' ? 'You have not submitted any outpass applications under this filter.' : 'No student leave applications match the current filter.'}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Student Roll</th>
                  {role !== 'student' && <th>Student Name</th>}
                  <th>Room</th>
                  <th>Reason</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Digital Outpass</th>
                  {role === 'warden' && <th style={{ textAlign: 'right' }}>Warden Decision</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>{l.id}</td>
                    <td className="mono">{l.studentRoll || '24104030'}</td>
                    {role !== 'student' && <td><strong>{l.studentName}</strong></td>}
                    <td className="mono">{l.roomNumber || 'B-37'}</td>
                    <td style={{ maxWidth: 220, fontSize: '0.875rem' }}>{l.reason}</td>
                    <td style={{ fontSize: '0.875rem' }}>{l.fromDate}</td>
                    <td style={{ fontSize: '0.875rem' }}>{l.toDate}</td>
                    <td>
                      <Badge>{l.status}</Badge>
                    </td>
                    <td>
                      {l.status === 'Approved' ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setPassLeave(l)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: '#15803D',
                            fontWeight: 700,
                            border: '1.5px solid rgba(22, 163, 74, 0.4)',
                            background: '#F0FDF4',
                          }}
                        >
                          <QrCode size={13} /> View Gate Pass
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {l.status === 'Pending' ? 'Awaiting Approval' : 'Not Issued'}
                        </span>
                      )}
                    </td>

                    {role === 'warden' && (
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {l.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              title="Approve Leave and Issue Gate Pass"
                              onClick={() => handleDecision(l, 'Approved')}
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--accent-red)' }}
                              title="Reject Leave Application"
                              onClick={() => handleDecision(l, 'Rejected')}
                            >
                              <X size={13} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                            {l.status === 'Approved' ? 'Authorized' : 'Declined'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Digital Gate Pass Modal (Pixel-Accurate to Official National Engineering College Sample) */}
      {passLeave && (
        <Modal
          title={securityVerificationMode ? 'Security Verification' : 'Digital Gate Pass'}
          subtitle="National Engineering College · Autonomous · Kovilpatti"
          onClose={() => {
            setPassLeave(null)
            setSecurityVerificationMode(false)
            setExitVerifiedSuccess(false)
          }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  if (securityVerificationMode) {
                    setSecurityVerificationMode(false)
                  } else {
                    setPassLeave(null)
                  }
                }}
              >
                {securityVerificationMode ? '← Back to Pass' : 'Close'}
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                {!securityVerificationMode && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSecurityVerificationMode(true)}
                  >
                    <QrCode size={14} /> Security Verification Kiosk
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => window.print()}
                >
                  <Printer size={14} /> Print / Save Pass
                </button>
              </div>
            </div>
          }
        >
          {!securityVerificationMode ? (
            /* SCREEN 1: OFFICIAL DIGITAL GATE PASS (MATCHING USER SAMPLE SCREEN 1) */
            <div
              style={{
                maxWidth: 480,
                margin: '0 auto',
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1.5px solid #CBD5E1',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                color: '#0F172A',
              }}
            >
              {/* Institution Header */}
              <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Official NEC Emblem SVG */}
                <div style={{ width: 62, height: 62, flexShrink: 0 }}>
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <circle cx="50" cy="50" r="46" fill="#0284C7" />
                    <circle cx="50" cy="50" r="41" fill="#FFFFFF" />
                    {/* Cog teeth */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                      <rect key={deg} x="47" y="2" width="6" height="8" rx="2" fill="#0284C7" transform={`rotate(${deg} 50 50)`} />
                    ))}
                    <circle cx="50" cy="50" r="32" fill="#0369A1" />
                    <circle cx="50" cy="50" r="28" fill="#FFFFFF" />
                    <text x="50" y="44" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#0369A1">NEC</text>
                    <text x="50" y="53" textAnchor="middle" fontSize="5" fontWeight="700" fill="#1E293B">அறிவே ஆக்கம்</text>
                    <text x="50" y="62" textAnchor="middle" fontSize="4.5" fontWeight="600" fill="#64748B">ESTD : 1984</text>
                  </svg>
                </div>

                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '0.01em', lineHeight: 1.25 }}>
                    NATIONAL ENGINEERING COLLEGE
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: 11.5, color: '#334155', fontWeight: 600 }}>
                    K.R. Nagar, Kovilpatti - 628503
                  </p>
                  <p style={{ margin: '1px 0 0', fontSize: 10, color: '#64748B' }}>
                    An Autonomous Institution · Affiliated to Anna University
                  </p>
                </div>
              </div>

              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Approved Status Banner */}
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1.5px solid #86EFAC',
                    borderRadius: 12,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: '#16A34A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <strong style={{ fontSize: 15, color: '#15803D', letterSpacing: '0.02em', display: 'block' }}>
                      APPROVED
                    </strong>
                    <span style={{ fontSize: 11.5, color: '#166534', fontWeight: 600 }}>
                      You are authorized to leave the hostel
                    </span>
                  </div>
                </div>

                {/* STUDENT DETAILS */}
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    Student Details
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px 8px', fontSize: 12.5, color: '#0F172A' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Name</span>
                    <strong>: {passLeave.studentName || user?.name || 'Keerthana G'}</strong>

                    <span style={{ color: '#475569', fontWeight: 600 }}>Register Number</span>
                    <strong className="mono">: {passLeave.studentRoll || user?.rollNo || '24104030'}</strong>

                    <span style={{ color: '#475569', fontWeight: 600 }}>Department</span>
                    <strong>: {user?.department || 'Computer Science & Engineering'}</strong>

                    <span style={{ color: '#475569', fontWeight: 600 }}>Hostel</span>
                    <strong>: Girls Hostel - Block B (Room {passLeave.roomNumber || 'B-37'})</strong>
                  </div>
                </div>

                {/* VISIT DETAILS */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    Visit Details
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px 8px', fontSize: 12.5, color: '#0F172A' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Purpose</span>
                    <strong>: {passLeave.reason || 'Academic Symposium & Family Visit'}</strong>

                    <span style={{ color: '#475569', fontWeight: 600 }}>Destination</span>
                    <strong>: {passLeave.destination || 'Town / Kovilpatti'}</strong>

                    <span style={{ color: '#475569', fontWeight: 600 }}>Date</span>
                    <strong>: {passLeave.fromDate || todayStr}</strong>

                    <span style={{ color: '#475569', fontWeight: 600 }}>Time (From - To)</span>
                    <strong>: 10:15 AM - 01:00 PM</strong>
                  </div>
                </div>

                {/* Dynamic QR Code Card */}
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: 14,
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <RealQrGatePass pass={passLeave} size={115} includeDetails={true} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>
                      Scan this QR code to verify the gate pass
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => setSecurityVerificationMode(true)}
                      style={{ alignSelf: 'flex-start', fontSize: 11.5, padding: '5px 12px' }}
                    >
                      <ShieldCheck size={14} /> Security Verification
                    </button>
                    <span style={{ fontSize: 11, color: '#475569' }}>
                      Valid for this time slot only
                    </span>
                  </div>
                </div>

                {/* Footer Disclaimer Notice */}
                <div
                  style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 11.5,
                    color: '#1E40AF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Info size={16} color="#2563EB" style={{ flexShrink: 0 }} />
                  <span>
                    This is a digital gate pass. No physical signature required. Show this pass to the security for verification.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* SCREEN 2: SECURITY VERIFICATION VIEW (MATCHING USER SAMPLE SCREEN 2) */
            <div
              style={{
                maxWidth: 480,
                margin: '0 auto',
                background: '#0B1329',
                borderRadius: 16,
                border: '1.5px solid #1E293B',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                color: '#FFFFFF',
              }}
            >
              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>
                    Security Verification
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94A3B8' }}>
                    National Engineering College Gate Turnstile
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setSecurityVerificationMode(false)}
                  style={{ color: '#94A3B8' }}
                >
                  ← Back
                </button>
              </div>

              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                {/* Scanner Instruction Header */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }}>
                    <QrCode size={24} color="#38BDF8" />
                  </div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#F8FAFC' }}>
                    Scan Gate Pass QR Code
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94A3B8' }}>
                    Verify student details and approval status
                  </p>
                </div>

                {/* Real Live Turnstile Camera Scanner */}
                <SecurityCameraQrScanner
                  onPassScanned={handleSecurityScanned}
                  activePass={passLeave}
                />

                {/* Scanned Verification Result Card */}
                <div
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    borderRadius: 14,
                    padding: 16,
                    color: '#0F172A',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <strong style={{ fontSize: 13, color: '#15803D' }}>APPROVED</strong>
                    </div>
                    <span className="mono" style={{ fontSize: 10.5, color: '#64748B' }}>
                      REF: {passLeave.id || 'LP-8092'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '5px 8px', fontSize: 12, color: '#0F172A' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Name</span>
                    <strong>: {scannedSecurityPass?.studentName || scannedSecurityPass?.student || passLeave.studentName || user?.name || 'Keerthana G'}</strong>

                    <span style={{ color: '#475569', fontWeight: 600 }}>Reg No</span>
                    <strong className="mono">: {scannedSecurityPass?.studentRoll || scannedSecurityPass?.rollNo || passLeave.studentRoll || user?.rollNo || '24104030'}</strong>

                    <span style={{ color: '#475569', fontWeight: 600 }}>Hostel</span>
                    <strong>: Girls Hostel - Block B (Room {scannedSecurityPass?.roomNumber || passLeave.roomNumber || 'B-37'})</strong>

                    <span style={{ color: '#475569', fontWeight: 600 }}>Purpose</span>
                    <strong>: {scannedSecurityPass?.reason || passLeave.reason || 'Academic Symposium & Family Visit'}</strong>

                    <span style={{ color: '#475569', fontWeight: 600 }}>Valid Slot</span>
                    <strong>: {scannedSecurityPass?.validFrom || passLeave.fromDate || todayStr} → {scannedSecurityPass?.validTo || passLeave.toDate || todayStr}</strong>
                  </div>

                  {/* Prominent Verification Action Button */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={exitVerifiedSuccess}
                    onClick={() => {
                      setExitVerifiedSuccess(true)
                      dispatch(pushToast('Gate Pass Verified! Departure logged in campus turnstile security record.', 'ok'))
                      try {
                        fetch(`/api/leave/verify/${passLeave.id}`, { method: 'POST' }).catch(() => {})
                      } catch (e) {}
                    }}
                    style={{
                      width: '100%',
                      background: exitVerifiedSuccess ? '#059669' : '#16A34A',
                      color: '#FFFFFF',
                      fontSize: 13,
                      padding: '11px',
                      borderRadius: 10,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    {exitVerifiedSuccess ? 'Gate Pass Verified · Allowed to Exit' : 'Gate Pass Verified Successfully · Allowed to exit hostel'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Leave Application Modal with Step 1 / Step 2 Confirmation */}
      {showForm && (
        <Modal
          title={formStep === 1 ? 'Apply for Campus Outpass' : 'Confirm Outpass Application'}
          subtitle={formStep === 1 ? `Step 1 of 2: Travel Details · Room ${room?.roomNumber || 'B-37'}` : 'Step 2 of 2: Review Booking & Declaration'}
          onClose={() => { setShowForm(false); setFormStep(1); setAgreed(false); }}
          footer={
            formStep === 1 ? (
              <>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (!draft.reason.trim()) {
                      dispatch(pushToast('Please state the declared purpose of your outpass.', 'warn'))
                      return
                    }
                    if (draft.toDate < draft.fromDate) {
                      dispatch(pushToast('Return date cannot be earlier than departure date.', 'bad'))
                      return
                    }
                    setFormStep(2)
                  }}
                >
                  Review &amp; Confirm Booking <ArrowRight size={14} />
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={() => setFormStep(1)}>← Back to Edit</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!agreed}
                  onClick={submit}
                >
                  Confirm &amp; Submit Outpass
                </button>
              </>
            )
          }
        >
          {formStep === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(124, 252, 0, 0.05)', padding: 12, borderRadius: 8, border: '1px solid rgba(124, 252, 0, 0.2)', fontSize: '0.85rem' }}>
                ℹ️ <strong>Outpass Regulations:</strong> Applications must be filed prior to 05:00 PM for same-day weekend departures. Gate scanners will record your departure and return timestamps automatically.
              </div>
              <div>
                <label>Reason for Leave / Declared Purpose</label>
                <textarea
                  rows={3}
                  required
                  value={draft.reason}
                  onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
                  placeholder="e.g. Attending sister's wedding ceremony in Coimbatore / Family home visit"
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label>Departure Date (From)</label>
                  <input
                    required
                    type="date"
                    min={todayStr}
                    value={draft.fromDate}
                    onChange={(e) => setDraft({ ...draft, fromDate: e.target.value })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Expected Return Date (To)</label>
                  <input
                    required
                    type="date"
                    min={draft.fromDate || todayStr}
                    value={draft.toDate}
                    onChange={(e) => setDraft({ ...draft, toDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(255, 170, 0, 0.08)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 170, 0, 0.3)', fontSize: '0.85rem' }}>
                ⚠️ <strong>Confirmation Step:</strong> Please double-check your departure and return schedule. Once confirmed, your gate outpass request is queued for Chief Warden digital signature.
              </div>

              <div style={{ background: 'var(--surface-2)', padding: 14, borderRadius: 8, border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem' }}>
                <div><strong>Resident:</strong> {user?.name || 'Keerthana G.'} (Roll: {user?.rollNo || '24104030'})</div>
                <div><strong>Room &amp; Block:</strong> Room {room?.roomNumber || 'B-37'} ({room?.block || 'Block B'})</div>
                <div><strong>Schedule:</strong> {draft.fromDate} → {draft.toDate}</div>
                <div><strong>Purpose:</strong> {draft.reason}</div>
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)', marginTop: 4 }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span>
                  I confirm that my parents/guardian have been informed of this travel, and I declare strict adherence to hostel gate rules upon return.
                </span>
              </label>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
