import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, UserCheck, LogOut as CheckOutIcon, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import useFilter from '../hooks/useFilter'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import { selectMyRoom } from '../store/slices/roomsSlice'
import { selectVisitors, fetchVisitors, addVisitor, approveVisitor, rejectVisitor, checkOutVisitor } from '../store/slices/visitorsSlice'
import { pushToast } from '../store/slices/uiSlice'

export default function Visitors() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const room = useSelector(selectMyRoom)
  const visitors = useSelector(selectVisitors)

  useEffect(() => {
    dispatch(fetchVisitors())
  }, [dispatch])

  const [showForm, setShowForm] = useState(false)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('new') === '1' && role === 'student') {
      setShowForm(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, role])

  const [draft, setDraft] = useState({
    visitorName: '',
    phone: '',
    relation: 'Father',
    purpose: '',
  })

  // Students see only their own visitor requests; Warden & Admin see all
  const scoped = role === 'student'
    ? visitors.filter((v) => v.roomNumber === room?.roomNumber || v.residentName === user?.name)
    : visitors

  const { status, setStatus, filtered } = useFilter(scoped, [], 'status')

  const pendingCount = visitors.filter((v) => v.status === 'Pending Approval').length

  const handleCreate = (e) => {
    e.preventDefault()
    if (!draft.visitorName.trim() || !draft.purpose.trim()) return

    dispatch(
      addVisitor({
        visitorName: draft.visitorName.trim(),
        phone: draft.phone.trim() || '+91 98401 23456',
        relation: draft.relation,
        purpose: draft.purpose.trim(),
        residentName: user?.name || 'Resident Student',
        roomNumber: room?.roomNumber || 'A-101',
      })
    )
    dispatch(pushToast(`Visitor entry request for ${draft.visitorName} submitted for Warden verification.`, 'ok'))
    setDraft({ visitorName: '', phone: '', relation: 'Father', purpose: '' })
    setShowForm(false)
  }

  const handleApprove = (v) => {
    dispatch(approveVisitor({ id: v.id, wardenName: user?.name || 'Dr. R. Sundaram (Chief Warden)' }))
    dispatch(pushToast(`Visitor ${v.visitorName} approved and checked in.`, 'ok'))
  }

  const handleRejectConfirm = () => {
    if (!rejectModal) return
    dispatch(rejectVisitor({
      id: rejectModal.id,
      wardenName: user?.name || 'Dr. R. Sundaram',
      reason: rejectReason.trim() || 'Entry disallowed as per hostel safety hours policy',
    }))
    dispatch(pushToast(`Visitor request for ${rejectModal.visitorName} was rejected.`, 'bad'))
    setRejectModal(null)
    setRejectReason('')
  }

  const handleCheckOut = (v) => {
    dispatch(checkOutVisitor(v.id))
    dispatch(pushToast(`${v.visitorName} checked out successfully.`, 'info'))
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Front desk & gate pass</span>
          <h1>Hostel Visitors</h1>
        </div>
        {role === 'student' && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Request Visitor Pass
          </button>
        )}
      </div>

      {/* Warden Notice banner if there are pending visitor approvals */}
      {role === 'warden' && pendingCount > 0 && (
        <div className="panel" style={{ background: 'rgba(255, 170, 0, 0.08)', borderColor: 'rgba(255, 170, 0, 0.3)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={20} color="#ffaa00" />
              <div>
                <strong style={{ color: '#ffaa00' }}>{pendingCount} Pending Visitor Verification{pendingCount > 1 ? 's' : ''}</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Students have logged expected visitors. Review the purpose and approve entry to generate active gate passes.
                </p>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setStatus('Pending Approval')}>
              View Pending
            </button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 220 }}>
            <option value="all">All statuses ({scoped.length})</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Checked In">Checked In (Active)</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No visitor records"
            message={role === 'student' ? 'You have no visitor passes registered under this filter.' : 'No visitor records match the current filter.'}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pass ID</th>
                  <th>Visitor Name</th>
                  <th>Relation</th>
                  {role !== 'student' && <th>Resident</th>}
                  <th>Room</th>
                  <th>Purpose</th>
                  <th>Check-In</th>
                  <th>Status</th>
                  <th>Verification Notes</th>
                  {(role === 'warden' || role === 'admin') && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id}>
                    <td className="mono">{v.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.visitorName}</div>
                      {v.phone && <small style={{ color: 'var(--text-muted)' }}>{v.phone}</small>}
                    </td>
                    <td>{v.relation}</td>
                    {role !== 'student' && <td>{v.residentName}</td>}
                    <td className="mono">{v.roomNumber}</td>
                    <td style={{ maxWidth: 220, fontSize: '0.875rem' }}>{v.purpose}</td>
                    <td style={{ fontSize: '0.875rem' }}>
                      {v.checkIn ? (
                        <span>{v.checkIn}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Awaiting check-in</span>
                      )}
                    </td>
                    <td>
                      <Badge>{v.status}</Badge>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      {v.status === 'Pending Approval' && (
                        <span style={{ color: '#ffaa00' }}>Pending Warden Approval</span>
                      )}
                      {v.status === 'Checked In' && (
                        <span style={{ color: 'var(--accent-green)' }}>
                          <ShieldCheck size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                          Verified by {v.approvedBy || 'Warden'}
                        </span>
                      )}
                      {v.status === 'Checked Out' && (
                        <span>Out at {v.checkOut || 'Gate'}</span>
                      )}
                      {v.status === 'Rejected' && (
                        <span style={{ color: 'var(--accent-red)' }}>
                          {v.rejectionReason || 'Denied entry'}
                        </span>
                      )}
                    </td>

                    {(role === 'warden' || role === 'admin') && (
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {role === 'warden' && v.status === 'Pending Approval' && (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              title="Approve visitor and check in"
                              onClick={() => handleApprove(v)}
                            >
                              <CheckCircle2 size={13} /> Approve
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--accent-red)' }}
                              title="Reject visitor request"
                              onClick={() => { setRejectModal(v); setRejectReason(''); }}
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </div>
                        )}

                        {v.status === 'Checked In' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleCheckOut(v)}
                          >
                            <CheckOutIcon size={13} /> Check Out
                          </button>
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

      {/* Student Add Visitor Modal */}
      {showForm && (
        <Modal
          title="Register Expected Visitor"
          subtitle={`Room ${room?.roomNumber || 'A-101'} · Resident: ${user?.name}`}
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Submit for Approval</button>
            </>
          }
        >
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(124, 252, 0, 0.05)', padding: 12, borderRadius: 8, border: '1px solid rgba(124, 252, 0, 0.2)', fontSize: '0.85rem' }}>
              ℹ️ <strong>Hostel Security Policy:</strong> All visitors must be approved by the Chief Warden before gate security grants access. Visiting hours are 09:00 AM to 06:30 PM.
            </div>
            <div>
              <label>Visitor Full Name</label>
              <input
                required
                value={draft.visitorName}
                onChange={(e) => setDraft({ ...draft, visitorName: e.target.value })}
                placeholder="e.g. Mr. Ganesan G."
              />
            </div>
            <div>
              <label>Contact Phone Number</label>
              <input
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                placeholder="e.g. +91 98401 23456"
              />
            </div>
            <div>
              <label>Relation with Student</label>
              <select value={draft.relation} onChange={(e) => setDraft({ ...draft, relation: e.target.value })}>
                <option>Father</option>
                <option>Mother</option>
                <option>Brother</option>
                <option>Sister</option>
                <option>Guardian</option>
                <option>Relative</option>
                <option>Friend / Peer</option>
              </select>
            </div>
            <div>
              <label>Purpose of Visit</label>
              <input
                required
                value={draft.purpose}
                onChange={(e) => setDraft({ ...draft, purpose: e.target.value })}
                placeholder="e.g. Delivering medical supplies & semester documents"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Warden Reject Modal */}
      {rejectModal && (
        <Modal
          title="Reject Visitor Request"
          subtitle={`Pass ID: ${rejectModal.id} · Visitor: ${rejectModal.visitorName}`}
          onClose={() => setRejectModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: 'var(--accent-red)' }} onClick={handleRejectConfirm}>
                Confirm Rejection
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              State the operational or security reason for denying access to <strong>{rejectModal.visitorName}</strong>. This note will be recorded on the student&apos;s portal.
            </p>
            <div>
              <label>Reason for Denial</label>
              <input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Arriving beyond approved guest visiting hours (post 06:30 PM)"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
