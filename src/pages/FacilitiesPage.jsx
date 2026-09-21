import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dumbbell, Sparkles, Clock, CheckCircle2, AlertCircle, Plus,
  RotateCcw, Calendar, User, Star, Trash2, ArrowRight, ShieldCheck,
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

  // Modals
  const [borrowModalEq, setBorrowModalEq] = useState(null)
  const [borrowHours, setBorrowHours] = useState(2)

  const [showCleaningModal, setShowCleaningModal] = useState(false)
  const [cleaningForm, setCleaningForm] = useState({
    preferredSlot: 'Morning (10:00 AM – 12:00 PM)',
    requestType: 'Deep Floor Clean & Dusting',
    notes: '',
  })

  const [gymPassSlot, setGymPassSlot] = useState(null)

  const handleBorrowSubmit = (e) => {
    e.preventDefault()
    if (!borrowModalEq) return
    dispatch(
      borrowEquipment({
        equipmentId: borrowModalEq.id,
        studentName: user.name,
        studentRoll: user.rollNo || '24104031',
        roomNumber: room?.roomNumber || user.roomNumber || 'A-101',
        hours: Number(borrowHours),
      })
    )
    dispatch(pushToast(`Checked out ${borrowModalEq.name} for ${borrowHours} hours.`, 'ok'))
    setBorrowModalEq(null)
  }

  const handleReturn = (borrowingId, name) => {
    dispatch(returnEquipment({ borrowingId }))
    dispatch(pushToast(`Returned ${name} successfully. Stock updated!`, 'ok'))
  }

  const handleGymBooking = (slot) => {
    dispatch(bookGymSlot({ slot, studentName: user.name }))
    setGymPassSlot(slot)
    dispatch(pushToast(`Gym slot booked for ${slot}!`, 'ok'))
  }

  const handleCleaningSubmit = (e) => {
    e.preventDefault()
    dispatch(
      requestRoomCleaning({
        roomNumber: room?.roomNumber || user.roomNumber || 'A-101',
        studentName: user.name,
        rollNo: user.rollNo || '24104031',
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
          <span className="eyebrow">Campus Amenities</span>
          <h1>Facilities &amp; Recreation Management</h1>
        </div>
        <div className="page-header-actions">
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
          🏸 Sports Equipment ({sportsEquipments.length} items)
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'gym' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('gym')}
        >
          🏋️ Gym Access &amp; Availability ({gym.currentOccupancy}/{gym.maxCapacity} live)
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'cleaning' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('cleaning')}
        >
          🧹 Room Cleaning &amp; Housekeeping
        </button>
      </div>

      {/* TAB 1: SPORTS EQUIPMENT MANAGEMENT */}
      {activeTab === 'sports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Sports Gear &amp; Equipment Inventory</h3>
                <p>Campus sports gear available for students at the North Court Desk</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {sportsEquipments.map((eq) => (
                <div key={eq.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge badge-info" style={{ fontSize: 10.5, marginBottom: 4 }}>
                        {eq.category}
                      </span>
                      <h4 style={{ fontSize: 14, margin: 0, fontWeight: 700 }}>{eq.name}</h4>
                    </div>
                    <span className="badge badge-ok">
                      Ready to Borrow
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    Station: <strong>{eq.location}</strong> · Standard Session: {eq.maxBorrowHours} hrs
                  </div>

                  {role === 'student' && (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => setBorrowModalEq(eq)}
                      style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                    >
                      <Plus size={13} /> Borrow Gear
                    </button>
                  )}
                </div>
              ))}
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
                            <RotateCcw size={12} /> Return
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

      {/* TAB 2: GYM ACCESS & AVAILABILITY */}
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
                Supervisor: <strong>{gym.supervisor}</strong>
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
                  During peak evening hours (05:00 PM – 08:30 PM), treadmill and cross-trainer usage is capped at 45 minutes per student to ensure fair rotation.
                </p>
              </div>

              <div className="card" style={{ padding: 14 }}>
                <strong style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--accent-border)' }}>
                  🧼 Sanitization &amp; Towels
                </strong>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.45 }}>
                  Wipe down machine contact pads and dumbbells after each set using the disinfectant stations provided across the gym floor.
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
                <p>Room: <strong>{room?.roomNumber || user.roomNumber || 'A-101'}</strong> ({room?.block || 'A Block'})</p>
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
                                onClick={() => { dispatch(rateRoomCleaning({ id: c.id, rating: st })); dispatch(pushToast(`Rated ${st} stars!`, 'ok')) }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1 }}
                              >
                                <Star size={13} color="var(--accent-border)" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>Pending service</span>
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

      {/* BORROW MODAL */}
      {borrowModalEq && (
        <Modal
          title={`Borrow ${borrowModalEq.name}`}
          subtitle={`Available at: ${borrowModalEq.location}`}
          onClose={() => setBorrowModalEq(null)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setBorrowModalEq(null)}>
                Cancel
              </button>
              <button type="submit" form="borrow-form" className="btn btn-primary">
                Confirm Checkout
              </button>
            </div>
          }
        >
          <form id="borrow-form" onSubmit={handleBorrowSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Resident Roll Number</label>
              <input type="text" readOnly value={user.rollNo || '24104031'} className="mono" />
            </div>
            <div>
              <label>Hostel Room</label>
              <input type="text" readOnly value={room?.roomNumber || user.roomNumber || 'A-101'} />
            </div>
            <div>
              <label>Borrow Duration (Hours)</label>
              <select value={borrowHours} onChange={(e) => setBorrowHours(Number(e.target.value))}>
                <option value={1}>1 Hour</option>
                <option value={2}>2 Hours (Standard)</option>
                <option value={3}>3 Hours</option>
                <option value={4}>4 Hours (Match Play)</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* SCHEDULE CLEANING MODAL */}
      {showCleaningModal && (
        <Modal
          title="Schedule Room Cleaning"
          subtitle={`Room ${room?.roomNumber || user.roomNumber || 'A-101'}`}
          onClose={() => setShowCleaningModal(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCleaningModal(false)}>
                Cancel
              </button>
              <button type="submit" form="cleaning-form" className="btn btn-primary">
                Confirm Housekeeping Request
              </button>
            </div>
          }
        >
          <form id="cleaning-form" onSubmit={handleCleaningSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Cleaning Service Type</label>
              <select
                value={cleaningForm.requestType}
                onChange={(e) => setCleaningForm({ ...cleaningForm, requestType: e.target.value })}
              >
                <option>Deep Floor Clean &amp; Dusting</option>
                <option>Linen &amp; Bedcover Replacement</option>
                <option>Balcony Wash &amp; Bathroom Scrubbing</option>
                <option>Complete Room Disinfection</option>
              </select>
            </div>
            <div>
              <label>Preferred Time Slot</label>
              <select
                value={cleaningForm.preferredSlot}
                onChange={(e) => setCleaningForm({ ...cleaningForm, preferredSlot: e.target.value })}
              >
                <option>Morning (09:00 AM – 11:00 AM)</option>
                <option>Morning (11:00 AM – 01:00 PM)</option>
                <option>Afternoon (02:00 PM – 04:00 PM)</option>
              </select>
            </div>
            <div>
              <label>Special Instructions (Optional)</label>
              <textarea
                rows={2}
                value={cleaningForm.notes}
                onChange={(e) => setCleaningForm({ ...cleaningForm, notes: e.target.value })}
                placeholder="e.g. Please dust ceiling fan and clean balcony rail..."
              />
            </div>
          </form>
        </Modal>
      )}

      {/* DIGITAL GYM PASS MODAL */}
      {gymPassSlot && (
        <Modal
          title="Digital Fitness Access Pass"
          subtitle="Authorized for Campus Gymnasium Entry"
          onClose={() => setGymPassSlot(null)}
          footer={
            <button className="btn btn-primary" onClick={() => setGymPassSlot(null)}>
              Done
            </button>
          }
        >
          <div style={{ border: '2px solid var(--accent-border)', borderRadius: 12, padding: 18, background: 'var(--surface)', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>VIDUDHI CAMPUS FITNESS CENTER</div>
            <div style={{ fontSize: 13, color: 'var(--accent-border)', fontWeight: 700, margin: '8px 0' }}>
              Slot: {gymPassSlot}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink)' }}>
              Pass Issued To: <strong>{user.name}</strong> ({user.rollNo || '24104031'})
            </div>
            <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--ink-soft)' }}>
              Present this digital pass at the gym turnstile RFID reader. Clean indoor workout shoes required.
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
