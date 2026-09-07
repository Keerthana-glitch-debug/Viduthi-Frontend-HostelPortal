import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, CalendarClock, Check, X } from 'lucide-react'
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
  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowForm(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])
  const [draft, setDraft] = useState({ reason: '', fromDate: '', toDate: '' })
  const [celebrate, setCelebrate] = useState(false)
  const scoped = role === 'admin' ? leaveRequests : leaveRequests.filter((l) => l.roomNumber === room.roomNumber)
  const { status, setStatus, filtered } = useFilter(scoped, [], 'status')

  const submit = (e) => {
    e.preventDefault()
    dispatch(addLeaveRequest({
      ...draft,
      studentName: user.name,
      roomNumber: room.roomNumber,
      studentRoll: user.rollNo || '24104031',
      id: user.rollNo || '24104031',
    }))
    dispatch(pushToast('Leave request sent for approval.', 'ok'))
    setDraft({ reason: '', fromDate: '', toDate: '' })
    setShowForm(false)
  }

  const [passLeave, setPassLeave] = useState(null)

  return (
    <div className="page">
      <Confetti active={celebrate} onDone={() => setCelebrate(false)} />
      <div className="page-header">
        <div>
          <span className="eyebrow">Attendance</span>
          <h1>Leave Requests &amp; Outpasses</h1>
        </div>
        {role !== 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Apply for leave</button>
        )}
      </div>

      <div className="panel">
        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No leave requests" message="Nothing matches your current filters." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Roll No.</th>{role === 'admin' && <th>Student</th>}<th>Room</th><th>Reason</th><th>From</th><th>To</th><th>Status</th><th>Outpass</th>
                  {role === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>{l.studentRoll || l.id}</td>
                    {role === 'admin' && <td>{l.studentName}</td>}
                    <td className="mono">{l.roomNumber}</td>
                    <td>{l.reason}</td>
                    <td>{l.fromDate}</td>
                    <td>{l.toDate}</td>
                    <td><Badge>{l.status}</Badge></td>
                    <td>
                      {l.status === 'Approved' ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setPassLeave(l)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent-border)' }}
                        >
                          Gate Pass
                        </button>
                      ) : (
                        <span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>—</span>
                      )}
                    </td>
                    {role === 'admin' && (
                      <td>
                        {l.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => { dispatch(decideLeaveRequest({ id: l.id, decision: 'Approved' })); dispatch(pushToast(`Approved leave for ${l.studentName}`, 'ok')); setCelebrate(true) }}><Check size={13} /></button>
                            <button className="btn btn-ghost btn-sm" onClick={() => { dispatch(decideLeaveRequest({ id: l.id, decision: 'Rejected' })); dispatch(pushToast(`Rejected leave for ${l.studentName}`, 'warn')) }}><X size={13} /></button>
                          </div>
                        ) : <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>Decided</span>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {passLeave && (
        <Modal
          title="Digital Gate Outpass"
          subtitle={`Pass ID: PASS-${passLeave.id}`}
          onClose={() => setPassLeave(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setPassLeave(null)}>Close</button>
            <button className="btn btn-primary" onClick={() => window.print()}>Print Gate Pass</button>
          </>}
        >
          <div style={{ border: '2px solid var(--accent-border)', borderRadius: 12, padding: 18, background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--line-strong)', paddingBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>VIDUDHI HOSTELS — DIGITAL OUTPASS</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>Authorized for Campus Main Gate Exit</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
              {/* QR Code */}
              <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid var(--line)' }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="#ffffff" />
                  <rect x="8" y="8" width="28" height="28" rx="2" fill="#132216" />
                  <rect x="12" y="12" width="20" height="20" rx="1" fill="#ffffff" />
                  <rect x="16" y="16" width="12" height="12" fill="#63C800" />
                  <rect x="64" y="8" width="28" height="28" rx="2" fill="#132216" />
                  <rect x="68" y="12" width="20" height="20" rx="1" fill="#ffffff" />
                  <rect x="72" y="16" width="12" height="12" fill="#63C800" />
                  <rect x="8" y="64" width="28" height="28" rx="2" fill="#132216" />
                  <rect x="12" y="68" width="20" height="20" rx="1" fill="#ffffff" />
                  <rect x="16" y="72" width="12" height="12" fill="#63C800" />
                  <rect x="42" y="12" width="8" height="8" fill="#132216" />
                  <rect x="42" y="28" width="8" height="8" fill="#63C800" />
                  <rect x="12" y="42" width="8" height="8" fill="#132216" />
                  <rect x="28" y="42" width="8" height="8" fill="#63C800" />
                  <rect x="42" y="42" width="16" height="16" rx="2" fill="#132216" />
                  <rect x="64" y="42" width="8" height="8" fill="#132216" />
                  <rect x="78" y="42" width="8" height="8" fill="#63C800" />
                  <rect x="42" y="64" width="8" height="8" fill="#132216" />
                  <rect x="42" y="78" width="8" height="8" fill="#63C800" />
                  <rect x="64" y="64" width="8" height="8" fill="#63C800" />
                  <rect x="78" y="64" width="8" height="8" fill="#132216" />
                  <rect x="64" y="78" width="16" height="14" fill="#132216" />
                </svg>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12.5 }}>
              <div><span style={{ color: 'var(--ink-faint)', display: 'block', fontSize: 11 }}>Student Name</span><strong>{passLeave.studentName}</strong></div>
              <div><span style={{ color: 'var(--ink-faint)', display: 'block', fontSize: 11 }}>Roll Number</span><strong className="mono">{passLeave.studentRoll || passLeave.id}</strong></div>
              <div><span style={{ color: 'var(--ink-faint)', display: 'block', fontSize: 11 }}>Room &amp; Block</span><strong>{passLeave.roomNumber}</strong></div>
              <div><span style={{ color: 'var(--ink-faint)', display: 'block', fontSize: 11 }}>Valid Dates</span><strong className="mono">{passLeave.fromDate} → {passLeave.toDate}</strong></div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              <strong>Reason:</strong> {passLeave.reason}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
              <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>APPROVED BY CHIEF WARDEN</span>
              <span className="badge badge-ok">AUTHORIZED PASS</span>
            </div>
          </div>
        </Modal>
      )}

      {showForm && (
        <Modal
          title="Apply for leave"
          subtitle={`Room ${room.roomNumber}`}
          onClose={() => setShowForm(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submit}>Submit request</button>
          </>}
        >
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Reason</label>
              <textarea rows={2} required value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} placeholder="e.g. Home visit for a family function" />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>From</label>
                <input required type="date" value={draft.fromDate} onChange={(e) => setDraft({ ...draft, fromDate: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label>To</label>
                <input required type="date" value={draft.toDate} onChange={(e) => setDraft({ ...draft, toDate: e.target.value })} />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
