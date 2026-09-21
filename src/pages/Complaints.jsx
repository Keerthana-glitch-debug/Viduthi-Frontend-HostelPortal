import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Plus, MessageSquareWarning, Wrench, Camera, CheckCircle2,
  Clock, Filter, ShieldCheck, ArrowRight, ListFilter,
} from 'lucide-react'
import Badge from '../components/common/Badge'
import EmptyState from '../components/common/EmptyState'
import Confetti from '../components/common/Confetti'
import useFilter from '../hooks/useFilter'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import { selectMyRoom } from '../store/slices/roomsSlice'
import { selectComplaints, fetchComplaints, addComplaint, updateComplaintStatus } from '../store/slices/complaintsSlice'
import { pushToast } from '../store/slices/uiSlice'

export default function Complaints() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const room = useSelector(selectMyRoom)
  const complaints = useSelector(selectComplaints)

  const [activeTab, setActiveTab] = useState('list') // 'list' | 'new'
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    dispatch(fetchComplaints())
  }, [dispatch])

  useEffect(() => {
    if (searchParams.get('new') === '1' && role === 'student') {
      setActiveTab('new')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, role])

  const [draft, setDraft] = useState({
    title: '',
    category: 'Plumbing',
    description: '',
    priority: 'Medium',
    preferredTime: 'Morning (09:00 AM – 12:00 PM)',
  })
  const [photoPreview, setPhotoPreview] = useState('')
  const [celebrate, setCelebrate] = useState(false)

  const scoped = role === 'warden' || role === 'admin'
    ? complaints
    : complaints.filter((c) => c.roomNumber === (room?.roomNumber || user.roomNumber || 'A-101'))

  const { query, setQuery, status, setStatus, filtered } = useFilter(scoped, ['title', 'category', 'roomNumber'])

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setPhotoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    if (!draft.title.trim() || !draft.description.trim()) {
      dispatch(pushToast('Please complete the title and issue description.', 'warn'))
      return
    }

    dispatch(
      addComplaint({
        ...draft,
        roomNumber: room?.roomNumber || user.roomNumber || 'A-101',
        raisedBy: user.name,
      })
    )
    dispatch(pushToast('Complaint ticket logged! Facilities team dispatched.', 'ok'))
    setDraft({ title: '', category: 'Plumbing', description: '', priority: 'Medium', preferredTime: 'Morning (09:00 AM – 12:00 PM)' })
    setPhotoPreview('')
    setCelebrate(true)
    setActiveTab('list') // Switch to list tab to see new ticket!
  }

  return (
    <div className="page">
      <Confetti active={celebrate} onDone={() => setCelebrate(false)} />

      <div className="page-header">
        <div>
          <span className="eyebrow">Maintenance &amp; Facilities</span>
          <h1>Grievances &amp; Complaints</h1>
        </div>
        {role !== 'warden' && role !== 'admin' && activeTab === 'list' && (
          <button className="btn btn-primary" onClick={() => setActiveTab('new')}>
            <Plus size={16} /> Raise a Complaint
          </button>
        )}
      </div>

      {/* DEDICATED TABS */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'list' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('list')}
        >
          <ListFilter size={14} /> Complaints Register ({filtered.length})
        </button>
        {role === 'student' && (
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'new' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('new')}
          >
            <Plus size={14} /> Raise New Complaint (Dedicated Tab)
          </button>
        )}
      </div>

      {/* TAB 1: COMPLAINTS LIST & STATUS TRACKER */}
      {activeTab === 'list' && (
        <div className="panel">
          <div className="filter-bar" style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search title, category, or room…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={MessageSquareWarning} title="No complaints found" message="Nothing matches your current filters." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Issue Title</th>
                    <th>Category</th>
                    <th>Room</th>
                    <th>Raised By</th>
                    <th>Priority</th>
                    <th>Technician Assigned</th>
                    <th>Status</th>
                    <th>Date</th>
                    {(role === 'warden' || role === 'admin') && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id}>
                      <td className="mono" style={{ fontWeight: 700 }}>{c.id}</td>
                      <td><strong>{c.title}</strong></td>
                      <td>{c.category}</td>
                      <td className="mono">{c.roomNumber}</td>
                      <td>{c.raisedBy}</td>
                      <td><Badge>{c.priority}</Badge></td>
                      <td style={{ fontSize: 12 }}>{c.assignedTo || 'Unassigned'}</td>
                      <td><Badge tone={c.status === 'Resolved' ? 'ok' : c.status === 'In Progress' ? 'info' : 'warn'}>{c.status}</Badge></td>
                      <td className="mono" style={{ fontSize: 11.5 }}>{c.date}</td>
                      {(role === 'warden' || role === 'admin') && (
                        <td>
                          <select
                            value={c.status}
                            onChange={(e) => {
                              dispatch(updateComplaintStatus({ id: c.id, status: e.target.value }))
                              dispatch(pushToast(`${c.id} marked as ${e.target.value}`, e.target.value === 'Resolved' ? 'ok' : 'info'))
                              if (e.target.value === 'Resolved') setCelebrate(true)
                            }}
                            style={{ width: 120, padding: '4px 6px', fontSize: 12 }}
                          >
                            <option>Open</option>
                            <option>In Progress</option>
                            <option>Resolved</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DEDICATED FULL "RAISE A COMPLAINT" TAB */}
      {activeTab === 'new' && role === 'student' && (
        <div className="panel" style={{ border: '2px solid var(--accent-border)', maxWidth: 740, margin: '0 auto' }}>
          <div className="panel-head">
            <div>
              <h3>Log a Maintenance or Facility Ticket</h3>
              <p>Room: <strong>{room?.roomNumber || user.roomNumber || 'A-101'}</strong> ({room?.block || 'A Block'}) · Raised By: {user.name}</p>
            </div>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label>Issue Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Leaking bathroom washbasin tap / Broken ceiling fan regulator"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <label>Issue Category</label>
                <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>Internet &amp; Wi-Fi</option>
                  <option>Furniture &amp; Carpentry</option>
                  <option>Mess Dining</option>
                  <option>Housekeeping</option>
                  <option>Other</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label>Urgency / Priority</label>
                <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })}>
                  <option>Low (Cosmetic)</option>
                  <option>Medium (Standard 24h repair)</option>
                  <option>High (Immediate attention)</option>
                </select>
              </div>
            </div>

            <div>
              <label>Preferred Maintenance Inspection Slot</label>
              <select
                value={draft.preferredTime}
                onChange={(e) => setDraft({ ...draft, preferredTime: e.target.value })}
              >
                <option>Morning (09:00 AM – 12:00 PM)</option>
                <option>Afternoon (02:00 PM – 05:00 PM)</option>
                <option>Evening (05:00 PM – 07:00 PM)</option>
              </select>
            </div>

            <div>
              <label>Detailed Description of the Problem</label>
              <textarea
                rows={4}
                required
                placeholder="Describe exactly where and when the issue occurs so the technician arrives with proper tools..."
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>

            <div>
              <label>Attach Photo of the Issue (Optional Preview)</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
              {photoPreview && (
                <div style={{ marginTop: 10, height: 120, borderRadius: 8, overflow: 'hidden' }}>
                  <img src={photoPreview} alt="Issue preview" style={{ height: '100%', objectFit: 'contain' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setActiveTab('list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
                <Plus size={16} /> Submit Maintenance Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
