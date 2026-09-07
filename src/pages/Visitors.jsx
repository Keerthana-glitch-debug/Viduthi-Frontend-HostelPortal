import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, UserCheck, LogOut as CheckOutIcon } from 'lucide-react'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import useFilter from '../hooks/useFilter'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import { selectMyRoom } from '../store/slices/roomsSlice'
import { selectVisitors, fetchVisitors, addVisitor, checkOutVisitor } from '../store/slices/visitorsSlice'
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
  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowForm(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])
  const [draft, setDraft] = useState({ visitorName: '', relation: 'Father', purpose: '' })
  const scoped = role === 'admin' ? visitors : visitors.filter((v) => v.roomNumber === room.roomNumber)
  const { status, setStatus, filtered } = useFilter(scoped, [], 'status')

  const submit = (e) => {
    e.preventDefault()
    dispatch(addVisitor({ ...draft, residentName: user.name, roomNumber: room.roomNumber }))
    dispatch(pushToast(`${draft.visitorName} checked in.`, 'ok'))
    setDraft({ visitorName: '', relation: 'Father', purpose: '' })
    setShowForm(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Front desk</span>
          <h1>Visitors</h1>
        </div>
        {role !== 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Log a visitor</button>
        )}
      </div>

      <div className="panel">
        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={UserCheck} title="No visitor records" message="Nothing matches your current filters." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Visitor</th><th>Relation</th>{role === 'admin' && <th>Resident</th>}<th>Room</th><th>Check-in</th><th>Check-out</th><th>Status</th>
                  {role === 'admin' && <th></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id}>
                    <td className="mono">{v.id}</td>
                    <td>{v.visitorName}</td>
                    <td>{v.relation}</td>
                    {role === 'admin' && <td>{v.residentName}</td>}
                    <td className="mono">{v.roomNumber}</td>
                    <td>{v.checkIn}</td>
                    <td>{v.checkOut || '—'}</td>
                    <td><Badge>{v.status}</Badge></td>
                    {role === 'admin' && (
                      <td>
                        {v.status === 'Checked In' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => { dispatch(checkOutVisitor(v.id)); dispatch(pushToast(`${v.visitorName} checked out.`, 'info')) }}><CheckOutIcon size={13} /> Check out</button>
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
          title="Log a visitor"
          subtitle={`Room ${room.roomNumber}`}
          onClose={() => setShowForm(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submit}>Check in</button>
          </>}
        >
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Visitor name</label>
              <input required value={draft.visitorName} onChange={(e) => setDraft({ ...draft, visitorName: e.target.value })} placeholder="e.g. Mr. Ganesan G." />
            </div>
            <div>
              <label>Relation</label>
              <select value={draft.relation} onChange={(e) => setDraft({ ...draft, relation: e.target.value })}>
                <option>Father</option><option>Mother</option><option>Brother</option>
                <option>Sister</option><option>Relative</option><option>Friend</option>
              </select>
            </div>
            <div>
              <label>Purpose of visit</label>
              <input required value={draft.purpose} onChange={(e) => setDraft({ ...draft, purpose: e.target.value })} placeholder="e.g. Weekend visit" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
