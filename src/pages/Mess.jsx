import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Star, UtensilsCrossed, Coffee, Soup, Clock, CheckCircle2,
  MessageSquare, ShieldCheck, Edit3, Cookie, Eye, ChevronLeft, ChevronRight,
} from 'lucide-react'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import { selectMyRoom } from '../store/slices/roomsSlice'
import {
  selectMessMenu,
  selectMessFeedback,
  selectAverageRating,
  addMessFeedback,
  updateMessMenu,
  markFeedbackReviewed,
} from '../store/slices/messSlice'
import { pushToast } from '../store/slices/uiSlice'

const MEAL_INFO = {
  Breakfast: { icon: Coffee, time: '07:30 AM – 09:30 AM', color: 'var(--accent-border)' },
  Lunch: { icon: UtensilsCrossed, time: '12:30 PM – 02:30 PM', color: '#059669' },
  Snacks: { icon: Cookie, time: '04:30 PM – 05:45 PM', color: '#D97706' },
  Dinner: { icon: Soup, time: '07:30 PM – 09:30 PM', color: '#0284C7' },
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function StarRow({ value, onChange, size = 18 }) {
  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-btn ${n <= value ? 'is-filled' : ''}`}
          onClick={() => onChange?.(n)}
          aria-label={`${n} star`}
          disabled={!onChange}
          style={{ cursor: onChange ? 'pointer' : 'default', padding: 2 }}
        >
          <Star size={size} fill={n <= value ? 'var(--accent-border)' : 'none'} color={n <= value ? 'var(--accent-border)' : 'var(--line-strong)'} />
        </button>
      ))}
    </div>
  )
}

export default function Mess() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const room = useSelector(selectMyRoom)
  const menu = useSelector(selectMessMenu)
  const feedback = useSelector(selectMessFeedback)
  const avgRating = useSelector(selectAverageRating)

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const todayDayName = DAYS[todayIndex] || 'Monday'

  const [activeDay, setActiveDay] = useState(todayDayName)
  const [rating, setRating] = useState(0)
  const [hygieneRating, setHygieneRating] = useState(5)
  const [mealType, setMealType] = useState('Lunch')
  const [comment, setComment] = useState('')

  // Warden editing menu state
  const [editingDay, setEditingDay] = useState(null)
  const [menuForm, setMenuForm] = useState(null)

  // Student feedback popup state
  const [inspectingFeedback, setInspectingFeedback] = useState(null)
  const [wardenNote, setWardenNote] = useState('')

  const activeDayMenu = menu.find((m) => m.day === activeDay) || menu[0]
  const isToday = activeDay === todayDayName

  const handlePrevDay = () => {
    const currentIndex = DAYS.indexOf(activeDay)
    const prevIndex = (currentIndex - 1 + DAYS.length) % DAYS.length
    setActiveDay(DAYS[prevIndex])
  }

  const handleNextDay = () => {
    const currentIndex = DAYS.indexOf(activeDay)
    const nextIndex = (currentIndex + 1) % DAYS.length
    setActiveDay(DAYS[nextIndex])
  }

  const handleOpenEditMenu = (target) => {
    setEditingDay(target.day)
    setMenuForm({
      day: target.day,
      breakfast: target.breakfast || '',
      lunch: target.lunch || '',
      snacks: target.snacks || '',
      dinner: target.dinner || '',
      lunchSpecial: target.lunchSpecial || '',
      dietType: target.dietType || 'Pure Veg',
      nutrition: target.nutrition || '',
    })
  }

  const handleSaveMenu = (e) => {
    e.preventDefault()
    if (!menuForm) return
    dispatch(updateMessMenu(menuForm))
    dispatch(pushToast(`Weekly menu for ${menuForm.day} updated successfully!`, 'ok'))
    setEditingDay(null)
    setMenuForm(null)
  }

  const submitFeedback = (e) => {
    e.preventDefault()
    if (!rating) {
      dispatch(pushToast('Please choose a star rating first.', 'warn'))
      return
    }
    dispatch(
      addMessFeedback(
        { mealType, day: activeDay, rating, hygieneRating, comment, committeeReviewed: false },
        user.name,
        room?.roomNumber || user.roomNumber || 'A-101',
        user.rollNo || '24104031'
      )
    )
    dispatch(pushToast(`Feedback for ${activeDay} ${mealType} submitted. Thank you!`, 'ok'))
    setRating(0)
    setComment('')
  }

  const handleAcknowledgeFeedback = (item) => {
    dispatch(markFeedbackReviewed({ id: item.id, adminNote: wardenNote || 'Acknowledged by Mess Warden.' }))
    dispatch(pushToast('Feedback marked as reviewed.', 'ok'))
    setInspectingFeedback(null)
    setWardenNote('')
  }

  const dayFeedback = feedback.filter((f) => f.day === activeDay)

  // Add-ons state and billing
  const [addOns, setAddOns] = useState({
    chickenCurry: { name: 'Chicken Curry', price: 80, count: 0, desc: 'Rich spiced homestyle gravy' },
    boiledEgg: { name: 'Boiled Egg', price: 15, count: 0, desc: 'Farm fresh single protein egg' },
    omelette: { name: 'Omelette', price: 30, count: 0, desc: 'Double egg onion & green chilli' },
    eggPoriyal: { name: 'Egg Poriyal', price: 25, count: 0, desc: 'Spiced egg scramble with curry leaves' },
  })

  const updateAddOnCount = (key, delta) => {
    setAddOns((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        count: Math.max(0, prev[key].count + delta),
      },
    }))
  }

  const totalAddOnBill = Object.values(addOns).reduce((sum, item) => sum + item.count * item.price, 0)
  const totalItemCount = Object.values(addOns).reduce((sum, item) => sum + item.count, 0)

  const handleOrderAddOns = () => {
    if (totalAddOnBill === 0) return
    dispatch(pushToast(`Order confirmed! ₹${totalAddOnBill} for ${totalItemCount} add-on(s) added to your mess bill.`, 'ok'))
    setAddOns((prev) => {
      const reset = {}
      for (const k in prev) {
        reset[k] = { ...prev[k], count: 0 }
      }
      return reset
    })
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Dining &amp; Nutrition</span>
          <h1>Hostel Mess &amp; Dining Hall</h1>
        </div>
        <div className="page-header-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', padding: '6px 14px', borderRadius: 8, border: '1px solid var(--line)' }}>
            <Star size={15} fill="var(--accent-border)" color="var(--accent-border)" />
            <span style={{ fontSize: 13, fontWeight: 700 }}>{avgRating || '4.5'} / 5.0</span>
            <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>({feedback.length} verified student reviews)</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE CLICKABLE DAY SELECTOR (Mon - Sun) */}
      <div className="panel" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handlePrevDay}
              aria-label="Previous day"
              style={{ padding: '6px 8px' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }}>Select Day:</span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1, justifyContent: 'center' }}>
            {DAYS.map((d) => {
              const isSelected = d === activeDay
              const isCurrentCalendarDay = d === todayDayName
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setActiveDay(d)}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    position: 'relative',
                    padding: '7px 14px',
                    fontWeight: isSelected ? 700 : 500,
                  }}
                >
                  {d}
                  {isCurrentCalendarDay && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -5,
                        right: -4,
                        fontSize: 9,
                        background: isSelected ? '#132216' : 'var(--accent)',
                        color: isSelected ? '#FFFFFF' : 'var(--accent-ink)',
                        padding: '1px 4px',
                        borderRadius: 4,
                        fontWeight: 800,
                      }}
                    >
                      TODAY
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleNextDay}
            aria-label="Next day"
            style={{ padding: '6px 8px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ACTIVE SELECTED DAY DISPLAY WITH RIGHT-SIDE ADD-ONS */}
      <div className="panel" style={{ border: '2px solid var(--accent-border)' }}>
        <div className="panel-head">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h3>{activeDayMenu.day}&apos;s Dining Schedule &amp; Add-Ons</h3>
              {isToday && (
                <span className="badge badge-ok">
                  <span className="badge-dot" /> Live Serving Today
                </span>
              )}
              <span className="badge badge-info">{activeDayMenu.dietType || 'Pure Veg'}</span>
            </div>
            {activeDayMenu.nutrition && (
              <p className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                {activeDayMenu.nutrition}
              </p>
            )}
          </div>

          {role === 'warden' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenEditMenu(activeDayMenu)}
            >
              <Edit3 size={14} /> Edit {activeDayMenu.day}&apos;s Menu
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)', gap: 16, alignItems: 'start' }}>
          {/* Left Column: 4 Daily Meal Sessions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => {
              const meta = MEAL_INFO[meal]
              const Icon = meta.icon
              const isLunch = meal === 'Lunch'
              const mealText = activeDayMenu[meal.toLowerCase()]

              return (
                <div
                  key={meal}
                  style={{
                    background: isLunch ? 'var(--accent-soft)' : 'var(--surface-2)',
                    border: `1.5px solid ${isLunch ? 'rgba(99, 200, 0, 0.4)' : 'var(--line)'}`,
                    borderRadius: 12,
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
                      <Icon size={16} color={meta.color} /> {meal}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' }}>
                      <Clock size={11} /> {meta.time}
                    </span>
                  </div>

                  <p style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.45, fontWeight: 500, margin: 0 }}>
                    {mealText}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Right Column: Add-Ons Counter & Real-Time Bill Calculator */}
          <div
            style={{
              background: 'var(--surface-2)',
              border: '1.5px solid var(--line-strong)',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <div>
                <strong style={{ fontSize: 14, color: 'var(--ink)' }}>Dining Add-Ons</strong>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--ink-soft)' }}>Extra sides billed to resident account</p>
              </div>
              <span className="badge badge-info">Optional Sides</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(addOns).map(([key, item]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: item.count > 0 ? 'var(--accent-soft)' : 'var(--surface)',
                    border: `1px solid ${item.count > 0 ? 'var(--accent-border)' : 'var(--line)'}`,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
                      {item.name} <span style={{ color: 'var(--accent-border)', fontWeight: 800 }}>₹{item.price}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{item.desc}</div>
                  </div>

                  {role === 'student' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => updateAddOnCount(key, -1)}
                        disabled={item.count === 0}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          border: '1px solid var(--line-strong)',
                          background: 'var(--surface)',
                          cursor: item.count === 0 ? 'not-allowed' : 'pointer',
                          fontWeight: 800,
                          color: 'var(--ink)',
                        }}
                      >
                        –
                      </button>
                      <span className="mono" style={{ width: 18, textAlign: 'center', fontWeight: 800, fontSize: 13 }}>
                        {item.count}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateAddOnCount(key, 1)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          border: '1px solid var(--accent-border)',
                          background: 'var(--accent-border)',
                          color: '#0b1b11',
                          cursor: 'pointer',
                          fontWeight: 800,
                        }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Live Bill Summary */}
            <div
              style={{
                marginTop: 6,
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(0, 0, 0, 0.15)',
                border: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: 'var(--ink-soft)', display: 'block' }}>Add-ons Total ({totalItemCount} items)</span>
                <span className="mono" style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent-border)' }}>
                  ₹{totalAddOnBill}
                </span>
              </div>

              {role === 'student' && (
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  disabled={totalAddOnBill === 0}
                  onClick={handleOrderAddOns}
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  Order Add-ons
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FEEDBACK & STUDENT REVIEWS SECTION */}
      <div className="two-col">
        {/* Submit Review for Active Day */}
        {role !== 'admin' && (
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Rate {activeDay}'s Food &amp; Dining Hall</h3>
                <p>Send instant quality remarks directly to the Mess Committee</p>
              </div>
            </div>

            <form onSubmit={submitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label>Select Meal Session</label>
                <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                  <option>Lunch</option>
                  <option>Breakfast</option>
                  <option>Snacks</option>
                  <option>Dinner</option>
                </select>
              </div>

              <div>
                <label>Food Taste &amp; Temperature Rating</label>
                <StarRow value={rating} onChange={setRating} size={22} />
              </div>

              <div>
                <label>Dining Cleanliness &amp; Hygiene</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setHygieneRating(s)}
                      className={`btn btn-sm ${hygieneRating === s ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ fontSize: 12 }}
                    >
                      {s === 5 ? 'Excellent Hygiene' : s === 4 ? 'Good' : 'Satisfactory'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label>Suggestions &amp; Comments (Optional)</label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`e.g. ${activeDay} ${mealType} was fresh; recommend extra lemon pickle on the counter...`}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                <MessageSquare size={15} /> Submit {activeDay} Feedback
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Student Reviews for {activeDay}</h3>
              <p>{dayFeedback.length} review(s) on record for this weekday</p>
            </div>
          </div>

          {dayFeedback.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
              No written reviews submitted for {activeDay} yet. Be the first to share your dining experience!
            </p>
          ) : (
            <div className="activity-feed">
              {dayFeedback.map((f) => (
                <div
                  key={f.id}
                  className="activity-item"
                  onClick={() => setInspectingFeedback(f)}
                  style={{
                    background: 'var(--surface-2)',
                    padding: 12,
                    borderRadius: 10,
                    cursor: 'pointer',
                    border: '1px solid var(--line)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>
                        {f.studentName}{' '}
                        <span className="mono" style={{ color: 'var(--ink-faint)', fontWeight: 400, fontSize: 11 }}>
                          ({f.studentRoll})
                        </span>
                      </span>
                      <StarRow value={f.rating} size={13} />
                    </div>

                    <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', display: 'flex', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-border)' }}>{f.mealType}</span>
                      <span>{f.date}</span>
                      {f.committeeReviewed && (
                        <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <CheckCircle2 size={11} /> Reviewed by Warden
                        </span>
                      )}
                    </div>

                    {f.comment && (
                      <div style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.4 }}>
                        "{f.comment}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* WARDEN EDIT MENU MODAL */}
      {editingDay && menuForm && (
        <Modal
          title={`Edit Mess Schedule — ${menuForm.day}`}
          subtitle="Update food items and dietary highlights"
          onClose={() => { setEditingDay(null); setMenuForm(null) }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => { setEditingDay(null); setMenuForm(null) }}>
                Cancel
              </button>
              <button type="submit" form="edit-menu-form" className="btn btn-primary">
                Save Timetable Changes
              </button>
            </div>
          }
        >
          <form id="edit-menu-form" onSubmit={handleSaveMenu} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Diet Highlight</label>
              <input
                type="text"
                value={menuForm.dietType}
                onChange={(e) => setMenuForm({ ...menuForm, dietType: e.target.value })}
              />
            </div>
            <div>
              <label>Breakfast Menu</label>
              <textarea
                rows={2}
                value={menuForm.breakfast}
                onChange={(e) => setMenuForm({ ...menuForm, breakfast: e.target.value })}
              />
            </div>
            <div>
              <label>Lunch Menu</label>
              <textarea
                rows={2}
                value={menuForm.lunch}
                onChange={(e) => setMenuForm({ ...menuForm, lunch: e.target.value })}
              />
            </div>
            <div>
              <label>Chef's Special Lunch Highlight</label>
              <input
                type="text"
                value={menuForm.lunchSpecial}
                onChange={(e) => setMenuForm({ ...menuForm, lunchSpecial: e.target.value })}
              />
            </div>
            <div>
              <label>Evening Snacks &amp; Tea</label>
              <textarea
                rows={2}
                value={menuForm.snacks}
                onChange={(e) => setMenuForm({ ...menuForm, snacks: e.target.value })}
              />
            </div>
            <div>
              <label>Dinner Menu</label>
              <textarea
                rows={2}
                value={menuForm.dinner}
                onChange={(e) => setMenuForm({ ...menuForm, dinner: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* STUDENT FEEDBACK INSPECTION MODAL */}
      {inspectingFeedback && (
        <Modal
          title="Dining Review Details"
          subtitle={`Feedback #${inspectingFeedback.id} · ${inspectingFeedback.date}`}
          onClose={() => setInspectingFeedback(null)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setInspectingFeedback(null)}>
                Close
              </button>
              {role === 'warden' && !inspectingFeedback.committeeReviewed && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleAcknowledgeFeedback(inspectingFeedback)}
                >
                  Acknowledge as Reviewed
                </button>
              )}
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'var(--surface-2)', padding: 12, borderRadius: 8 }}>
              <div><span className="profile-detail-label">Student:</span> <strong>{inspectingFeedback.studentName}</strong></div>
              <div><span className="profile-detail-label">Roll No:</span> <strong className="mono">{inspectingFeedback.studentRoll}</strong></div>
              <div><span className="profile-detail-label">Meal:</span> <strong>{inspectingFeedback.mealType} ({inspectingFeedback.day})</strong></div>
              <div><span className="profile-detail-label">Hygiene:</span> <strong>{inspectingFeedback.hygieneRating}/5 Stars</strong></div>
            </div>
            <div>
              <span className="profile-detail-label">Comment:</span>
              <p style={{ marginTop: 4, fontSize: 13.5, color: 'var(--ink)' }}>
                "{inspectingFeedback.comment || 'No written remark.'}"
              </p>
            </div>
            {role === 'warden' && !inspectingFeedback.committeeReviewed && (
              <div>
                <label>Warden Committee Note</label>
                <input
                  type="text"
                  placeholder="e.g. Shared with caterer; extra spice station added."
                  value={wardenNote}
                  onChange={(e) => setWardenNote(e.target.value)}
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
