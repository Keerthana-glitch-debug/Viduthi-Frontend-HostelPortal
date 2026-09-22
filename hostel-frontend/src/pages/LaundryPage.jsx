import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Plus, WashingMachine, ArrowRight, CheckCircle2,
  Clock, Sparkles, ShieldCheck, Shirt, RefreshCw,
} from 'lucide-react'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import useFilter from '../hooks/useFilter'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import { selectMyRoom } from '../store/slices/roomsSlice'
import { selectLaundryRequests, addLaundryRequest, updateLaundryStatus } from '../store/slices/laundrySlice'
import { pushToast } from '../store/slices/uiSlice'

const STAGES = ['Requested', 'Picked Up', 'Washing', 'Ironing', 'Ready for Pickup', 'Delivered']
const nextStage = (current) => STAGES[Math.min(STAGES.indexOf(current) + 1, STAGES.length - 1)]

const MACHINES = [
  { id: 'M-01', name: 'Machine 1', type: 'Washing Machine', status: 'Available', cycleLeft: 'Ready' },
  { id: 'M-02', name: 'Machine 2', type: 'Washing Machine', status: 'In Cycle', cycleLeft: '15 mins left' },
  { id: 'M-03', name: 'Machine 3', type: 'Washing Machine', status: 'Available', cycleLeft: 'Ready' },
  { id: 'IC-01', name: 'Iron Clothes Station 1', type: 'Steam Press (₹20/cloth)', status: 'Operational', cycleLeft: 'Available' },
  { id: 'IC-02', name: 'Iron Clothes Station 2', type: 'Steam Press (₹20/cloth)', status: 'Operational', cycleLeft: 'Available' },
]

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

  const [draft, setDraft] = useState({ serviceType: 'Iron Clothes & Steam Press', itemCount: 5, notes: '', pickupDate: '' })
  const scoped = role === 'warden' || role === 'admin' ? laundryRequests : laundryRequests.filter((l) => l.roomNumber === (room?.roomNumber || 'A-101'))
  const { status, setStatus, filtered } = useFilter(scoped, [], 'status')

  const submit = (e) => {
    e.preventDefault()
    dispatch(addLaundryRequest(draft, user.name, room?.roomNumber || 'A-101'))
    dispatch(pushToast(`Laundry pickup requested (${draft.itemCount} clothes · Fee: ₹${draft.itemCount * 20}).`, 'ok'))
    setDraft({ serviceType: 'Iron Clothes & Steam Press', itemCount: 5, notes: '', pickupDate: '' })
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
          <span className="eyebrow">EcoWash Operations Hub</span>
          <h1>Hostel Laundry &amp; Garment Care</h1>
        </div>
        {role === 'student' && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Request Laundry &amp; Ironing
          </button>
        )}
      </div>

      {/* IRON CLOTHES & LAUNDRY FEE BANNER */}
      <div
        style={{
          background: 'var(--accent-soft)',
          border: '1.5px solid var(--accent-border)',
          borderRadius: 12,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={22} color="var(--accent-border)" />
          <div>
            <strong style={{ color: 'var(--accent-ink)', fontSize: 13.5 }}>
              Hostel Ironing &amp; Laundry Fee: ₹20 per cloth
            </strong>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--ink)' }}>
              Charges are calculated per garment (₹20 / cloth) and billed directly to your resident room ledger upon delivery.
            </p>
          </div>
        </div>
        <span className="badge badge-ok">Rate: ₹20 / Cloth</span>
      </div>

      {/* LIVE MACHINES & IRON CLOTHES TRACKER */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Live Machine &amp; Iron Clothes Station Tracker</h3>
            <p>EcoWash Facility Ground Floor (North Wing)</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {MACHINES.map((m) => {
            const isAvail = m.status === 'Available' || m.status === 'Operational'
            return (
              <div
                key={m.id}
                className="card"
                style={{
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  border: `1px solid ${isAvail ? 'var(--accent-border)' : 'var(--line)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <WashingMachine size={18} color={isAvail ? 'var(--accent-border)' : '#D97706'} />
                  <span className={`badge ${isAvail ? 'badge-ok' : 'badge-warn'}`} style={{ fontSize: 10 }}>
                    {m.status}
                  </span>
                </div>
                <strong style={{ fontSize: 13 }}>{m.name}</strong>
                <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{m.type}</div>
                <div className="mono" style={{ fontSize: 11, color: isAvail ? 'var(--accent-border)' : '#D97706', fontWeight: 600, marginTop: 4 }}>
                  {m.cycleLeft}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* LAUNDRY TRACKING LIST */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Active Laundry Orders &amp; Garment Status</h3>
            <p>Real-time visual processing stepper</p>
          </div>
        </div>

        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={WashingMachine} title="No laundry requests" message="Nothing matches your current filters." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((l) => {
              const currentStageIndex = STAGES.indexOf(l.status)
              return (
                <div
                  key={l.id}
                  className="card"
                  style={{
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    background: 'var(--surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="mono" style={{ fontWeight: 800, fontSize: 14 }}>{l.id}</span>
                      <span className="badge badge-info">{l.serviceType}</span>
                      <span style={{ fontSize: 13, color: 'var(--ink)' }}>
                        <strong>{l.itemCount}</strong> items · Fee: <strong style={{ color: 'var(--accent-border)' }}>₹{l.itemCount * 20}</strong> (₹20/cloth) · Room {l.roomNumber} ({l.studentName})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge tone={l.status === 'Delivered' ? 'ok' : l.status === 'Ready for Pickup' ? 'info' : 'warn'}>
                        {l.status}
                      </Badge>
                      {(role === 'warden' || role === 'admin') && l.status !== 'Delivered' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => advance(l)}>
                          Advance to {nextStage(l.status)} <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Progress Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', overflowX: 'auto', padding: '6px 0' }}>
                    {STAGES.map((stage, idx) => {
                      const isCompleted = idx <= currentStageIndex
                      const isCurrent = idx === currentStageIndex
                      return (
                        <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 90 }}>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 3,
                              flex: 1,
                              textAlign: 'center',
                            }}
                          >
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: isCompleted ? 'var(--accent-border)' : 'var(--line-strong)',
                                color: isCompleted ? '#FFFFFF' : 'var(--ink-faint)',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: 10,
                                fontWeight: 800,
                              }}
                            >
                              {isCompleted ? '✓' : idx + 1}
                            </div>
                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: isCurrent ? 700 : 500,
                                color: isCurrent ? 'var(--ink)' : 'var(--ink-faint)',
                              }}
                            >
                              {stage}
                            </span>
                          </div>
                          {idx < STAGES.length - 1 && (
                            <div
                              style={{
                                height: 2,
                                flex: 1,
                                background: idx < currentStageIndex ? 'var(--accent-border)' : 'var(--line)',
                              }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {l.notes && (
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', background: 'var(--surface-2)', padding: '6px 10px', borderRadius: 6 }}>
                      <strong>Care Notes:</strong> {l.notes}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* REQUEST PICKUP MODAL */}
      {showForm && (
        <Modal
          title="Request Laundry &amp; Ironing Service"
          subtitle={`Room ${room?.roomNumber || 'A-101'} · ₹20 per cloth`}
          onClose={() => setShowForm(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submit}>Schedule Pickup (₹{draft.itemCount * 20})</button>
          </>}
        >
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Service Type</label>
                <select value={draft.serviceType} onChange={(e) => setDraft({ ...draft, serviceType: e.target.value })}>
                  <option>Iron Clothes &amp; Steam Press</option>
                  <option>Wash &amp; Iron Clothes</option>
                  <option>Wash &amp; Fold</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Number of Clothes (Max 12)</label>
                <input
                  type="number" min="1" max="12" required
                  value={draft.itemCount}
                  onChange={(e) => setDraft({ ...draft, itemCount: Math.max(1, Number(e.target.value)) })}
                />
              </div>
            </div>

            {/* Calculated Fee Banner */}
            <div
              style={{
                background: 'var(--accent-soft)',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid var(--accent-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ color: 'var(--accent-ink)', fontSize: 13 }}>
                  Estimated Fee ({draft.itemCount} clothes × ₹20)
                </strong>
                <div style={{ fontSize: 11, color: 'var(--ink)' }}>Will be added to resident monthly dues on delivery</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent-ink)' }}>
                ₹{draft.itemCount * 20}
              </div>
            </div>
            <div>
              <label>Preferred Delivery Target Date</label>
              <input
                required type="date"
                value={draft.pickupDate}
                onChange={(e) => setDraft({ ...draft, pickupDate: e.target.value })}
              />
            </div>
            <div>
              <label>Fabric / Care Notes (Optional)</label>
              <textarea
                rows={2}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="e.g. Separate white shirts; one delicate dupatta..."
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
