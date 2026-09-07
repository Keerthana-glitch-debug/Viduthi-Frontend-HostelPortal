import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, MessageSquareWarning } from 'lucide-react'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
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

  // On page load, ask the backend for the current list.
  useEffect(() => {
    dispatch(fetchComplaints())
  }, [dispatch])

  const [showForm, setShowForm] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowForm(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])
  const [draft, setDraft] = useState({ title: '', category: 'Plumbing', description: '', priority: 'Medium' })
  const [celebrate, setCelebrate] = useState(false)
  const scoped = role === 'admin' ? complaints : complaints.filter((c) => c.roomNumber === room.roomNumber)
  const { query, setQuery, status, setStatus, filtered } = useFilter(scoped, ['title', 'category', 'roomNumber'])

  const submit = (e) => {
    e.preventDefault()
    dispatch(addComplaint({ ...draft, roomNumber: room.roomNumber, raisedBy: user.name }))
    dispatch(pushToast('Complaint submitted — the facilities team has been notified.', 'ok'))
    setDraft({ title: '', category: 'Plumbing', description: '', priority: 'Medium' })
    setShowForm(false)
  }

  return (
    <div className="page">
      <Confetti active={celebrate} onDone={() => setCelebrate(false)} />
      <div className="page-header">
        <div>
          <span className="eyebrow">Facilities</span>
          <h1>Complaints</h1>
        </div>
        {role !== 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Raise complaint</button>
        )}
      </div>

      <div className="panel">
        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <input type="text" placeholder="Search complaints…" value={query} onChange={(e) => setQuery(e.target.value)} />
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
                  <th>ID</th><th>Title</th><th>Category</th><th>Room</th><th>Priority</th><th>Status</th><th>Date</th>
                  {role === 'admin' && <th></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="mono">{c.id}</td>
                    <td>{c.title}</td>
                    <td>{c.category}</td>
                    <td className="mono">{c.roomNumber}</td>
                    <td><Badge>{c.priority}</Badge></td>
                    <td><Badge>{c.status}</Badge></td>
                    <td>{c.date}</td>
                    {role === 'admin' && (
                      <td>
                        <select
                          value={c.status}
                          onChange={(e) => {
                            dispatch(updateComplaintStatus({ id: c.id, status: e.target.value }))
                            dispatch(pushToast(`${c.id} marked as ${e.target.value}`, e.target.value === 'Resolved' ? 'ok' : 'info'))
                            if (e.target.value === 'Resolved') setCelebrate(true)
                          }}
                          style={{ width: 130 }}
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

      {showForm && (
        <Modal
          title="Raise a complaint"
          subtitle={`Room ${room.roomNumber}`}
          onClose={() => setShowForm(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submit}>Submit complaint</button>
          </>}
        >
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Title</label>
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Leaking tap in bathroom" />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Category</label>
                <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                  <option>Plumbing</option><option>Electrical</option><option>Internet</option>
                  <option>Furniture</option><option>Mess</option><option>Other</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Priority</label>
                <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
            </div>
            <div>
              <label>Description</label>
              <textarea rows={3} required value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Describe the issue in a few lines…" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
