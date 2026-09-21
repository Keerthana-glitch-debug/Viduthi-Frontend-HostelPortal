import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, CalendarClock, Check, X, QrCode, Printer, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import Confetti from '../components/common/Confetti'
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
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('new') === '1' && role === 'student') {
      setShowForm(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, role])

  const todayStr = new Date().toISOString().slice(0, 10)
  const [draft, setDraft] = useState({ reason: '', fromDate: todayStr, toDate: todayStr })
  const [celebrate, setCelebrate] = useState(false)

  // Students see only their own leave requests; Warden & Admin see all
  const scoped = role === 'student'
    ? leaveRequests.filter((l) => l.studentRoll === user?.rollNo || l.studentName === user?.name || l.roomNumber === room?.roomNumber)
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
        roomNumber: room?.roomNumber || 'A-101',
        studentRoll: user?.rollNo || '24104031',
      })
    )
    dispatch(pushToast('Leave request submitted to Warden office.', 'ok'))
    setDraft({ reason: '', fromDate: todayStr, toDate: todayStr })
    setFormStep(1)
    setAgreed(false)
    setShowForm(false)
  }

  const handleDecision = (l, decision) => {
    dispatch(decideLeaveRequest({ id: l.id, decision }))
    if (decision === 'Approved') {
      dispatch(pushToast(`Approved leave pass for ${l.studentName}. Gate pass authorized.`, 'ok'))
      setCelebrate(true)
    } else {
      dispatch(pushToast(`Leave request for ${l.studentName} marked as Rejected.`, 'bad'))
    }
  }

  return (
    <div className="page">
      <Confetti active={celebrate} onDone={() => setCelebrate(false)} />
      <div className="page-header">
        <div>
          <span className="eyebrow">Attendance & Gate Security</span>
          <h1>Leave Requests &amp; Digital Outpasses</h1>
        </div>
        {role === 'student' && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Apply for Leave
          </button>
        )}
      </div>

      {/* Warden Notice banner for pending leave approvals */}
      {role === 'warden' && pendingLeaves.length > 0 && (
        <div className="panel" style={{ background: 'rgba(255, 170, 0, 0.08)', borderColor: 'rgba(255, 170, 0, 0.3)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={20} color="#ffaa00" />
              <div>
                <strong style={{ color: '#ffaa00' }}>{pendingLeaves.length} Student Leave Application{pendingLeaves.length > 1 ? 's' : ''} Awaiting Warden Review</strong>
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
                    <td className="mono">{l.studentRoll || '24104031'}</td>
                    {role !== 'student' && <td><strong>{l.studentName}</strong></td>}
                    <td className="mono">{l.roomNumber}</td>
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
                            color: 'var(--accent-green)',
                            fontWeight: 600,
                            border: '1px solid rgba(124, 252, 0, 0.3)',
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

      {/* Verified Digital Gate Outpass Modal */}
      {passLeave && (
        <Modal
          title="Campus Digital Gate Outpass"
          subtitle={`Pass Reference: PASS-${passLeave.id}`}
          onClose={() => setPassLeave(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setPassLeave(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={15} /> Print / Save Pass
              </button>
            </>
          }
        >
          <div
            style={{
              border: '2px solid rgba(124, 252, 0, 0.4)',
              borderRadius: 12,
              padding: 20,
              background: 'linear-gradient(180deg, rgba(124, 252, 0, 0.05) 0%, rgba(13, 27, 20, 0.8) 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ textAlign: 'center', borderBottom: '1px dashed rgba(255, 255, 255, 0.15)', paddingBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', letterSpacing: 0.5 }}>
                VIDUDHI RESIDENTIAL PORTAL · DIGITAL GATE OUTPASS
              </div>
              <div style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600, marginTop: 2 }}>
                AUTHORIZED CAMPUS MAIN GATE ENTRY &amp; EXIT CLEARANCE
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {/* QR Code */}
              <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)' }}>
                <svg width="120" height="120" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="#ffffff" />
                  <rect x="8" y="8" width="28" height="28" rx="2" fill="#0b1b11" />
                  <rect x="12" y="12" width="20" height="20" rx="1" fill="#ffffff" />
                  <rect x="16" y="16" width="12" height="12" fill="#58b300" />
                  <rect x="64" y="8" width="28" height="28" rx="2" fill="#0b1b11" />
                  <rect x="68" y="12" width="20" height="20" rx="1" fill="#ffffff" />
                  <rect x="72" y="16" width="12" height="12" fill="#58b300" />
                  <rect x="8" y="64" width="28" height="28" rx="2" fill="#0b1b11" />
                  <rect x="12" y="68" width="20" height="20" rx="1" fill="#ffffff" />
                  <rect x="16" y="72" width="12" height="12" fill="#58b300" />
                  <rect x="42" y="12" width="8" height="8" fill="#0b1b11" />
                  <rect x="42" y="28" width="8" height="8" fill="#58b300" />
                  <rect x="12" y="42" width="8" height="8" fill="#0b1b11" />
                  <rect x="28" y="42" width="8" height="8" fill="#58b300" />
                  <rect x="42" y="42" width="16" height="16" rx="2" fill="#0b1b11" />
                  <rect x="64" y="42" width="8" height="8" fill="#0b1b11" />
                  <rect x="78" y="42" width="8" height="8" fill="#58b300" />
                  <rect x="42" y="64" width="8" height="8" fill="#0b1b11" />
                  <rect x="42" y="78" width="8" height="8" fill="#58b300" />
                  <rect x="64" y="64" width="8" height="8" fill="#58b300" />
                  <rect x="78" y="64" width="8" height="8" fill="#0b1b11" />
                  <rect x="64" y="78" width="16" height="14" fill="#0b1b11" />
                </svg>
              </div>

              <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-green)', fontWeight: 700, fontSize: 13 }}>
                  <ShieldCheck size={16} /> VERIFIED CRYPTOGRAPHIC TOKEN
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Signed by Warden Key: <span className="mono" style={{ color: 'var(--text-main)' }}>WD-SEC-88219</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Issued at: {passLeave.appliedOn || todayStr} 08:30 IST
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className="badge badge-ok">PASS STATUS: ACTIVE</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: 13, background: 'rgba(0, 0, 0, 0.2)', padding: 12, borderRadius: 8 }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Resident Name</span>
                <strong>{passLeave.studentName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Roll Number</span>
                <strong className="mono">{passLeave.studentRoll || '24104031'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Hostel &amp; Room</span>
                <strong>Block A, Room {passLeave.roomNumber}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Pass Validity Window</span>
                <strong className="mono" style={{ color: 'var(--accent-green)' }}>{passLeave.fromDate} → {passLeave.toDate}</strong>
              </div>
            </div>

            <div style={{ fontSize: 12.5, color: 'var(--text-main)', background: 'rgba(255, 255, 255, 0.03)', padding: 10, borderRadius: 6 }}>
              <strong>Declared Purpose:</strong> {passLeave.reason}
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
              <div>
                Verified Authority: <strong>Dr. R. Sundaram (Chief Warden)</strong>
              </div>
              <div>
                Turnstile: <strong>Gate 1 / Gate 2 Optical Scanner</strong>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Leave Application Modal with Step 1 / Step 2 Confirmation */}
      {showForm && (
        <Modal
          title={formStep === 1 ? 'Apply for Campus Outpass' : 'Confirm Outpass Application'}
          subtitle={formStep === 1 ? `Step 1 of 2: Travel Details · Room ${room?.roomNumber || 'A-101'}` : 'Step 2 of 2: Review Booking & Declaration'}
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
                <div><strong>Resident:</strong> {user?.name || 'Keerthana G.'} (Roll: {user?.rollNo || '24104031'})</div>
                <div><strong>Room &amp; Block:</strong> Room {room?.roomNumber || 'A-101'} ({room?.block || 'A Block'})</div>
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
