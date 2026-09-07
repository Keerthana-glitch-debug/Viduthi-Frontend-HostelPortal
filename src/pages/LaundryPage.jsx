import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, WashingMachine, ArrowRight } from 'lucide-react'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import useFilter from '../hooks/useFilter'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import { selectMyRoom } from '../store/slices/roomsSlice'
import { selectLaundryRequests, addLaundryRequest, updateLaundryStatus } from '../store/slices/laundrySlice'
import { pushToast } from '../store/slices/uiSlice'

const STAGES = ['Requested', 'Picked Up', 'Washing', 'Ready for Pickup', 'Delivered']
const nextStage = (current) => STAGES[Math.min(STAGES.indexOf(current) + 1, STAGES.length - 1)]

export default function LaundryPage() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const room = useSelector(selectMyRoom)
  const laundryRequests = useSelector(selectLaundryRequests)

  const [showForm, setShowForm] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowForm(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const [draft, setDraft] = useState({ serviceType: 'Wash & Fold', itemCount: 1, notes: '', pickupDate: '' })
  const scoped = role === 'admin' ? laundryRequests : laundryRequests.filter((l) => l.roomNumber === room.roomNumber)
  const { status, setStatus, filtered } = useFilter(scoped, [], 'status')

  const submit = (e) => {
    e.preventDefault()
    dispatch(addLaundryRequest(draft, user.name, room.roomNumber))
    dispatch(pushToast('Laundry pickup requested.', 'ok'))
    setDraft({ serviceType: 'Wash & Fold', itemCount: 1, notes: '', pickupDate: '' })
    setShowForm(false)
  }

  const advance = (item) => {
    const next = nextStage(item.status)
    dispatch(updateLaundryStatus({ id: item.id, status: next }))
    dispatch(pushToast(`${item.id} moved to "${next}"`, next === 'Delivered' ? 'ok' : 'info'))
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Facilities</span>
          <h1>Laundry</h1>
        </div>
        {role !== 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Request pickup</button>
        )}
      </div>

      <div className="panel">
        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={WashingMachine} title="No laundry requests" message="Nothing matches your current filters." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>{role === 'admin' && <th>Student</th>}<th>Room</th><th>Service</th><th>Items</th><th>Pickup date</th><th>Status</th>
                  {role === 'admin' && <th></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td className="mono">{l.id}</td>
                    {role === 'admin' && <td>{l.studentName}</td>}
                    <td className="mono">{l.roomNumber}</td>
                    <td>{l.serviceType}</td>
                    <td>{l.itemCount}</td>
                    <td>{l.pickupDate || '—'}</td>
                    <td><Badge>{l.status}</Badge></td>
                    {role === 'admin' && (
                      <td>
                        {l.status !== 'Delivered' ? (
                          <button className="btn btn-ghost btn-sm" onClick={() => advance(l)}>
                            {nextStage(l.status)} <ArrowRight size={13} />
                          </button>
                        ) : (
                          <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>Complete</span>
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

      {showForm && (
        <Modal
          title="Request a laundry pickup"
          subtitle={`Room ${room.roomNumber}`}
          onClose={() => setShowForm(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submit}>Submit request</button>
          </>}
        >
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Service type</label>
                <select value={draft.serviceType} onChange={(e) => setDraft({ ...draft, serviceType: e.target.value })}>
                  <option>Wash & Fold</option>
                  <option>Dry Clean</option>
                  <option>Ironing</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Number of items</label>
                <input
                  type="number" min="1" required
                  value={draft.itemCount}
                  onChange={(e) => setDraft({ ...draft, itemCount: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label>Preferred pickup date</label>
              <input required type="date" value={draft.pickupDate} onChange={(e) => setDraft({ ...draft, pickupDate: e.target.value })} />
            </div>
            <div>
              <label>Notes (optional)</label>
              <textarea rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="e.g. One item is delicate, please handle with care" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
