import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dumbbell, Sparkles, Clock, CheckCircle2, AlertCircle, Plus,
  RotateCcw, Calendar, User, Star, Trash2, ArrowRight, ShieldCheck,
  Edit3, Activity, Check,
} from 'lucide-react'
import {
  selectSportsEquipments,
  selectSportsBorrowings,
  selectGymData,
  selectCleaningRequests,
  borrowEquipment,
  returnEquipment,
  bookGymSlot,
  requestRoomCleaning,
  rateRoomCleaning,
  addSportsEquipment,
  updateSportsEquipment,
  deleteSportsEquipment,
  addGymEquipment,
  updateGymEquipment,
  deleteGymEquipment,
} from '../store/slices/facilitiesSlice'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import { selectMyRoom } from '../store/slices/roomsSlice'
import { pushToast } from '../store/slices/uiSlice'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'

export default function FacilitiesPage() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const room = useSelector(selectMyRoom)
  const sportsEquipments = useSelector(selectSportsEquipments)
  const borrowings = useSelector(selectSportsBorrowings)
  const gym = useSelector(selectGymData)
  const cleaningRequests = useSelector(selectCleaningRequests)

  const [activeTab, setActiveTab] = useState('sports') // 'sports' | 'gym' | 'cleaning'

  // Modals for borrowing and cleaning
  const [borrowModalEq, setBorrowModalEq] = useState(null)
  const [borrowHours, setBorrowHours] = useState(2)

  const [showCleaningModal, setShowCleaningModal] = useState(false)
  const [cleaningForm, setCleaningForm] = useState({
    preferredSlot: 'Morning (10:00 AM – 12:00 PM)',
    requestType: 'Deep Floor Clean & Dusting',
    notes: '',
  })

  const [gymPassSlot, setGymPassSlot] = useState(null)

  // Warden Equipment CRUD State
  const isWarden = role === 'warden' || role === 'admin'
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [equipmentModalMode, setEquipmentModalMode] = useState('add') // 'add' | 'edit'
  const [equipmentTargetType, setEquipmentTargetType] = useState('sports') // 'sports' | 'gym'
  const [equipmentForm, setEquipmentForm] = useState({
    id: '',
    name: '',
    type: 'sports',
    category: '',
    totalStock: 1,
    availableStock: 1,
    count: 1,
    location: '',
    specs: '',
    maxBorrowHours: 3,
  })

  const handleOpenAddEquipment = (type = 'sports') => {
    setEquipmentModalMode('add')
    setEquipmentTargetType(type)
    setEquipmentForm({
      id: `${type === 'sports' ? 'SP' : 'GYM'}-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      type,
      category: type === 'sports' ? 'Ball Sports' : 'Cardio Equipment',
      totalStock: type === 'sports' ? 5 : 1,
      availableStock: type === 'sports' ? 5 : 1,
      count: type === 'sports' ? 5 : 1,
      location: type === 'sports' ? 'Sports Room' : 'Gym Cardio Deck',
      specs: '',
      maxBorrowHours: 3,
    })
    setShowEquipmentModal(true)
  }

  const handleOpenEditEquipment = (eq, type = 'sports') => {
    setEquipmentModalMode('edit')
    setEquipmentTargetType(type)
    setEquipmentForm({
      id: eq.id,
      name: eq.name,
      type,
      category: eq.category || '',
      totalStock: eq.totalStock || eq.count || 1,
      availableStock: eq.availableStock !== undefined ? eq.availableStock : (eq.count || 1),
      count: eq.count || eq.totalStock || 1,
      location: type === 'sports' ? (eq.location || 'Sports Room') : (eq.location || ''),
      specs: type === 'sports' ? '' : (eq.specs || ''),
      maxBorrowHours: eq.maxBorrowHours || 3,
    })
    setShowEquipmentModal(true)
  }

  const handleSaveEquipment = (e) => {
    e.preventDefault()
    if (!equipmentForm.name.trim()) {
      dispatch(pushToast('Equipment name is required.', 'warn'))
      return
    }

    const payload = {
      ...equipmentForm,
      totalStock: Number(equipmentForm.totalStock) || 1,
      availableStock: Number(equipmentForm.availableStock) || 1,
      count: Number(equipmentForm.count || equipmentForm.totalStock) || 1,
    }

    if (equipmentTargetType === 'sports') {
      if (equipmentModalMode === 'add') {
        dispatch(addSportsEquipment(payload))
        dispatch(pushToast(`Added sports gear: ${payload.name}`, 'ok'))
      } else {
        dispatch(updateSportsEquipment(payload))
        dispatch(pushToast(`Updated sports gear: ${payload.name}`, 'ok'))
      }
    } else {
      if (equipmentModalMode === 'add') {
        dispatch(addGymEquipment(payload))
        dispatch(pushToast(`Added gym machine: ${payload.name}`, 'ok'))
      } else {
        dispatch(updateGymEquipment(payload))
        dispatch(pushToast(`Updated gym machine: ${payload.name}`, 'ok'))
      }
    }

    // Sync in background to backend
    try {
      fetch('/api/equipment', {
        method: equipmentModalMode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {})
    } catch (err) {}

    setShowEquipmentModal(false)
  }

  const handleDeleteEquipment = (id, type, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from ${type} equipment?`)) {
      if (type === 'sports') {
        dispatch(deleteSportsEquipment({ id }))
      } else {
        dispatch(deleteGymEquipment({ id }))
      }
      dispatch(pushToast(`Deleted ${name} successfully.`, 'ok'))

      // Sync in background to backend
      try {
        fetch(`/api/equipment/${id}`, { method: 'DELETE' }).catch(() => {})
      } catch (err) {}
    }
  }

  const handleBorrowSubmit = (e) => {
    e.preventDefault()
    if (!borrowModalEq) return
    dispatch(
      borrowEquipment({
        equipmentId: borrowModalEq.id,
        studentName: user.name || 'Keerthana',
        studentRoll: user.rollNo || '24104030',
        roomNumber: room?.roomNumber || user.roomNumber || 'B-37',
        hours: Number(borrowHours),
      })
    )
    dispatch(pushToast(`Checked out ${borrowModalEq.name} for ${borrowHours} hours. Stock updated!`, 'ok'))
    setBorrowModalEq(null)
  }

  const handleReturn = (borrowingId, name) => {
    dispatch(returnEquipment({ borrowingId }))
    dispatch(pushToast(`Returned ${name} successfully. Available stock restored!`, 'ok'))
  }

  const handleGymBooking = (slot) => {
    dispatch(bookGymSlot({ slot, studentName: user.name || 'Keerthana' }))
    setGymPassSlot(slot)
    dispatch(pushToast(`Gym slot booked for ${slot}!`, 'ok'))
  }

  const handleCleaningSubmit = (e) => {
    e.preventDefault()
    dispatch(
      requestRoomCleaning({
        roomNumber: room?.roomNumber || user.roomNumber || 'B-37',
        studentName: user.name || 'Keerthana',
        rollNo: user.rollNo || '24104030',
        preferredSlot: cleaningForm.preferredSlot,
        requestType: cleaningForm.requestType,
        notes: cleaningForm.notes,
      })
    )
    dispatch(pushToast('Room housekeeping scheduled successfully!', 'ok'))
    setShowCleaningModal(false)
    setCleaningForm({ preferredSlot: 'Morning (10:00 AM – 12:00 PM)', requestType: 'Deep Floor Clean & Dusting', notes: '' })
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Campus Amenities &amp; Physical Wellness</span>
          <h1>Facilities, Sports &amp; Gym Center</h1>
        </div>
        <div className="page-header-actions">
          {isWarden && activeTab === 'sports' && (
            <button className="btn btn-primary" onClick={() => handleOpenAddEquipment('sports')}>
              <Plus size={15} /> Add Sports Gear
            </button>
          )}
          {isWarden && activeTab === 'gym' && (
            <button className="btn btn-primary" onClick={() => handleOpenAddEquipment('gym')}>
              <Plus size={15} /> Add Gym Machine
            </button>
          )}
          {activeTab === 'cleaning' && role === 'student' && (
            <button className="btn btn-primary" onClick={() => setShowCleaningModal(true)}>
              <Plus size={15} /> Schedule Cleaning
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'sports' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('sports')}
        >
          🏸 Sports Equipment ({sportsEquipments.length} tracked items)
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'gym' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('gym')}
        >
          🏋️ Gym Access &amp; Equipment Catalog ({gym.equipment?.length || 6} machines)
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'cleaning' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('cleaning')}
        >
          🧹 Room Cleaning &amp; Housekeeping
        </button>
      </div>

      {/* TAB 1: SPORTS EQUIPMENT MANAGEMENT WITH AVAILABILITY TRACKING */}
      {activeTab === 'sports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Sports Gear &amp; Equipment Inventory</h3>
                <p>Campus sports gear available for residents with live stock tracking at the Sports Counter</p>
              </div>
              {isWarden && (
                <button className="btn btn-secondary btn-sm" onClick={() => handleOpenAddEquipment('sports')}>
                  <Plus size={14} /> Add Gear
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
              {sportsEquipments.map((eq) => {
                const isAvailable = (eq.availableStock ?? eq.totalStock) > 0
                return (
                  <div key={eq.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="badge badge-info" style={{ fontSize: 10.5, marginBottom: 4 }}>
                          {eq.category}
                        </span>
                        <h4 style={{ fontSize: 15, margin: 0, fontWeight: 700 }}>{eq.name}</h4>
                      </div>
                      <span className={`badge ${isAvailable ? 'badge-ok' : 'badge-bad'}`}>
                        {isAvailable ? `${eq.availableStock} / ${eq.totalStock} Available` : 'All Checked Out'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                      Station: <strong>Sports Room</strong> · Session: {eq.maxBorrowHours || 3} hrs max
                    </div>

                    {/* Available Stock Progress Bar */}
                    <div style={{ width: '100%', height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.round(((eq.availableStock ?? eq.totalStock) / (eq.totalStock || 1)) * 100)}%`,
                          height: '100%',
                          background: isAvailable ? 'var(--accent-border)' : '#EF4444',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 6 }}>
                      {role === 'student' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          disabled={!isAvailable}
                          onClick={() => setBorrowModalEq(eq)}
                        >
                          <Plus size={13} /> {isAvailable ? 'Borrow Gear' : 'Out of Stock'}
                        </button>
                      )}
                      {isWarden && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleOpenEditEquipment(eq, 'sports')}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            style={{ color: '#DC2626' }}
                            onClick={() => handleDeleteEquipment(eq.id, 'sports', eq.name)}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active Borrowing Log */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Active Borrowings &amp; Return Status</h3>
                <p>Checked-out gear must be returned to the sports desk within allotted hours</p>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>Equipment</th>
                    <th>Borrower</th>
                    <th>Room</th>
                    <th>Borrowed At</th>
                    <th>Due Return</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowings.map((b) => (
                    <tr key={b.id}>
                      <td className="mono">{b.id}</td>
                      <td><strong>{b.equipmentName}</strong></td>
                      <td>{b.studentName}</td>
                      <td className="mono">{b.roomNumber}</td>
                      <td>{b.borrowedAt}</td>
                      <td>{b.dueAt}</td>
                      <td>
                        <Badge tone={b.status === 'Active' ? 'warn' : 'ok'}>{b.status}</Badge>
                      </td>
                      <td>
                        {b.status === 'Active' ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleReturn(b.id, b.equipmentName)}
                          >
                            <RotateCcw size={12} /> Return Gear
                          </button>
                        ) : (
                          <span style={{ fontSize: 11.5, color: '#059669', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <CheckCircle2 size={12} /> Returned
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GYM ACCESS & EQUIPMENT CATALOG */}
      {activeTab === 'gym' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="two-col">
            {/* Live Occupancy Gauge */}
            <div className="panel" style={{ border: '2px solid var(--accent-border)' }}>
              <div className="panel-head">
                <div>
                  <h3>Live Gym Occupancy &amp; Access</h3>
                  <p>{gym.name}</p>
                </div>
                <span className="badge badge-ok">
                  <span className="badge-dot" /> Live Turnstile Sensor
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '14px 0 8px' }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: 'var(--ink)' }}>
                  {gym.currentOccupancy}
                </span>
                <span style={{ fontSize: 16, color: 'var(--ink-soft)' }}>
                  / {gym.maxCapacity} Max Capacity
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: 12, background: 'var(--line)', borderRadius: 6, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.round((gym.currentOccupancy / gym.maxCapacity) * 100)}%`,
                    height: '100%',
                    background: gym.currentOccupancy > 20 ? '#EF4444' : 'var(--accent-border)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 10 }}>
                Supervisor: <strong>{gym.supervisor || 'Fitness In-charge'}</strong>
                <br />
                Timings: {gym.timings}
              </div>
            </div>

            {/* Book Workout Slot */}
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h3>Reserve Workout Slot</h3>
                  <p>Guaranteed entry without waiting in the locker queue</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {gym.bookedSlots.map((s) => {
                  const isFull = s.bookedCount >= s.capacity
                  return (
                    <div
                      key={s.slot}
                      className="card"
                      style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}
                    >
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{s.slot}</span>
                      <span style={{ fontSize: 11, color: isFull ? '#DC2626' : 'var(--ink-soft)' }}>
                        {s.bookedCount} / {s.capacity} Booked
                      </span>
                      {role === 'student' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          disabled={isFull}
                          onClick={() => handleGymBooking(s.slot)}
                          style={{ marginTop: 4, fontSize: 11 }}
                        >
                          {isFull ? 'Slot Full' : 'Book Pass'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* GYM EQUIPMENT CATALOG (STATIC FACILITY INVENTORY) */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Gymnasium Equipment &amp; Machine Catalog</h3>
                <p>Permanent fitness center machines and floor gear (Free access for all residents during workout hours)</p>
              </div>
              {isWarden && (
                <button className="btn btn-secondary btn-sm" onClick={() => handleOpenAddEquipment('gym')}>
                  <Plus size={14} /> Add Gym Machine
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {(gym.equipment || []).map((eq) => (
                <div key={eq.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge badge-info" style={{ fontSize: 10.5, marginBottom: 4 }}>
                        {eq.category}
                      </span>
                      <h4 style={{ fontSize: 15, margin: 0, fontWeight: 700 }}>{eq.name}</h4>
                    </div>
                    <span className="badge badge-ok" style={{ fontWeight: 700 }}>
                      Units: {eq.count || eq.totalStock || 1}
                    </span>
                  </div>

                  <div style={{ fontSize: 12.5, color: 'var(--ink)' }}>
                    <strong>Specifications:</strong> {eq.specs || 'Standard Gymnasium Grade Equipment'}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    Zone: <strong>{eq.location || 'Fitness Floor'}</strong> · Condition: <span style={{ color: '#059669', fontWeight: 600 }}>{eq.status || 'Optimal'}</span>
                  </div>

                  {isWarden && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 6, borderTop: '1px solid var(--line)' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleOpenEditEquipment(eq, 'gym')}
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        style={{ color: '#DC2626' }}
                        onClick={() => handleDeleteEquipment(eq.id, 'gym', eq.name)}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fitness Center Guidelines */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Gymnasium Rules &amp; Equipment Safety</h3>
                <p>Campus Fitness Center standard regulations and etiquette</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div className="card" style={{ padding: 14 }}>
                <strong style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--accent-border)' }}>
                  👟 Mandatory Footwear
                </strong>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.45 }}>
                  Clean, non-marking indoor running or training shoes must be worn at all times. Barefoot workouts and flip-flops are strictly prohibited.
                </p>
              </div>

              <div className="card" style={{ padding: 14 }}>
                <strong style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--accent-border)' }}>
                  ⏱️ 45-Minute Cardio Limit
                </strong>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.45 }}>
                  During peak evening hours (05:00 PM – 08:30 PM), treadmill and cycle machine usage is capped at 45 minutes per student to ensure fair rotation.
                </p>
              </div>

              <div className="card" style={{ padding: 14 }}>
                <strong style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--accent-border)' }}>
                  🧼 Sanitization &amp; Towels
                </strong>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.45 }}>
                  Wipe down machine contact pads, dumbbells, and yoga mats after each set using the disinfectant stations provided across the gym floor.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROOM CLEANING & HOUSEKEEPING */}
      {activeTab === 'cleaning' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Room Housekeeping &amp; Deep Clean Requests</h3>
                <p>Room: <strong>{room?.roomNumber || user.roomNumber || 'B-37'}</strong> ({room?.block || user.block || 'Block B'})</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowCleaningModal(true)}>
                <Plus size={15} /> Request Room Cleaning
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Service ID</th>
                    <th>Room</th>
                    <th>Type of Service</th>
                    <th>Preferred Slot</th>
                    <th>Assigned Staff</th>
                    <th>Status</th>
                    <th>Quality Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {cleaningRequests.map((c) => (
                    <tr key={c.id}>
                      <td className="mono">{c.id}</td>
                      <td className="mono">{c.roomNumber}</td>
                      <td><strong>{c.requestType}</strong></td>
                      <td>{c.preferredSlot}</td>
                      <td>{c.assignedMaid || 'Unassigned'}</td>
                      <td>
                        <Badge tone={c.status === 'Completed' ? 'ok' : c.status === 'In Progress' ? 'info' : 'warn'}>
                          {c.status}
                        </Badge>
                      </td>
                      <td>
                        {c.rating ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--accent-border)', fontWeight: 700 }}>
                            <Star size={13} fill="var(--accent-border)" /> {c.rating} / 5
                          </span>
                        ) : c.status === 'Completed' ? (
                          <div style={{ display: 'flex', gap: 3 }}>
                            {[1, 2, 3, 4, 5].map((st) => (
                              <button
                                key={st}
                                type="button"
                                className="btn btn-ghost btn-xs"
                                onClick={() => dispatch(rateRoomCleaning({ id: c.id, rating: st }))}
                                style={{ padding: 2 }}
                              >
                                <Star size={13} />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Pending Completion</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: BORROW SPORTS GEAR */}
      {borrowModalEq && (
        <Modal
          title="Borrow Sports Gear"
          subtitle={`Checkout ${borrowModalEq.name} · Sports Counter Desk`}
          onClose={() => setBorrowModalEq(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setBorrowModalEq(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBorrowSubmit}>
                Confirm Checkout
              </button>
            </>
          }
        >
          <form onSubmit={handleBorrowSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: 12, background: 'var(--surface-2)' }}>
              <div><strong>Item:</strong> {borrowModalEq.name}</div>
              <div><strong>Available in Inventory:</strong> {borrowModalEq.availableStock} of {borrowModalEq.totalStock}</div>
              <div><strong>Borrower:</strong> {user.name || 'Keerthana'} ({user.rollNo || '24104030'})</div>
              <div><strong>Room:</strong> Room {room?.roomNumber || user.roomNumber || 'B-37'}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Duration of Loan</label>
              <select
                className="input"
                value={borrowHours}
                onChange={(e) => setBorrowHours(e.target.value)}
              >
                <option value={1}>1 Hour (Quick Practice)</option>
                <option value={2}>2 Hours (Standard Match)</option>
                <option value={3}>3 Hours (Tournament Session)</option>
              </select>
            </div>

            <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: 0 }}>
              Gear must be returned to the sports desk counter before curfew. Missing or damaged items may incur replacement fees.
            </p>
          </form>
        </Modal>
      )}

      {/* MODAL 2: WARDEN ADD / EDIT EQUIPMENT */}
      {showEquipmentModal && (
        <Modal
          title={equipmentModalMode === 'add' ? `Add New ${equipmentTargetType === 'sports' ? 'Sports Gear' : 'Gym Machine'}` : `Edit ${equipmentForm.name}`}
          subtitle="Hostel Amenities &amp; Inventory Management"
          onClose={() => setShowEquipmentModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowEquipmentModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEquipment}>
                {equipmentModalMode === 'add' ? 'Save & Add Item' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSaveEquipment} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Equipment Name *</label>
              <input
                type="text"
                className="input"
                required
                placeholder="e.g. Volleyball, Treadmill, Badminton Rackets"
                value={equipmentForm.name}
                onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Ball Sports, Cardio, Board Games"
                  value={equipmentForm.category}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, category: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {equipmentTargetType === 'sports' ? 'Total Quantity / Stock' : 'Number of Units'}
                </label>
                <input
                  type="number"
                  min={1}
                  className="input"
                  value={equipmentTargetType === 'sports' ? equipmentForm.totalStock : equipmentForm.count}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 1
                    setEquipmentForm({
                      ...equipmentForm,
                      totalStock: val,
                      availableStock: val,
                      count: val,
                    })
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location / Station</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. North Sports Arena, Cardio Section, Room G"
                value={equipmentForm.location}
                onChange={(e) => setEquipmentForm({ ...equipmentForm, location: e.target.value })}
              />
            </div>

            {equipmentTargetType === 'gym' && (
              <div className="form-group">
                <label className="form-label">Specifications &amp; Brand Details</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Commercial 4.0 HP, Magnetic Resistance, Anti-burst 65cm"
                  value={equipmentForm.specs}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, specs: e.target.value })}
                />
              </div>
            )}

            {equipmentTargetType === 'sports' && (
              <div className="form-group">
                <label className="form-label">Max Allowed Borrow Hours</label>
                <select
                  className="input"
                  value={equipmentForm.maxBorrowHours}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, maxBorrowHours: Number(e.target.value) })}
                >
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={4}>4 Hours</option>
                </select>
              </div>
            )}
          </form>
        </Modal>
      )}

      {/* MODAL 3: ROOM CLEANING REQUEST */}
      {showCleaningModal && (
        <Modal
          title="Schedule Housekeeping Service"
          subtitle={`Room ${room?.roomNumber || user.roomNumber || 'B-37'} · Housekeeping Desk`}
          onClose={() => setShowCleaningModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowCleaningModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCleaningSubmit}>
                Confirm Schedule
              </button>
            </>
          }
        >
          <form onSubmit={handleCleaningSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Preferred Time Window</label>
              <select
                className="input"
                value={cleaningForm.preferredSlot}
                onChange={(e) => setCleaningForm({ ...cleaningForm, preferredSlot: e.target.value })}
              >
                <option>Morning (10:00 AM – 12:00 PM)</option>
                <option>Afternoon (02:00 PM – 04:00 PM)</option>
                <option>Evening (04:30 PM – 06:00 PM)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Type of Service</label>
              <select
                className="input"
                value={cleaningForm.requestType}
                onChange={(e) => setCleaningForm({ ...cleaningForm, requestType: e.target.value })}
              >
                <option>Deep Floor Clean &amp; Study Desk Dusting</option>
                <option>Balcony Wash &amp; Window Glass Polish</option>
                <option>Attached Washroom Scrubbing &amp; Sanitization</option>
                <option>Complete Room Disinfection &amp; Mop</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Special Housekeeping Instructions (Optional)</label>
              <textarea
                className="input"
                rows={3}
                placeholder="e.g. Please dust window sills and mop under the study tables"
                value={cleaningForm.notes}
                onChange={(e) => setCleaningForm({ ...cleaningForm, notes: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
