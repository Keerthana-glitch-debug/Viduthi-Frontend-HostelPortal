import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Star, UtensilsCrossed, Coffee, Soup, Clock, CheckCircle2, MessageSquare, ShieldCheck, Edit3, Cookie, Eye } from 'lucide-react'
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
  const today = menu[todayIndex] || menu[0]

  const [rating, setRating] = useState(0)
  const [hygieneRating, setHygieneRating] = useState(5)
  const [mealType, setMealType] = useState('Lunch')
  const [selectedDay, setSelectedDay] = useState(today.day)
  const [comment, setComment] = useState('')

  // Warden editing menu state
  const [editingDay, setEditingDay] = useState(null)
  const [menuForm, setMenuForm] = useState(null)

  // Student feedback popup state
  const [inspectingFeedback, setInspectingFeedback] = useState(null)
  const [wardenNote, setWardenNote] = useState('')

  const handleOpenEditMenu = (dayObj) => {
    const target = dayObj || today
    setEditingDay(target.day)
    setMenuForm({
      day: target.day,
      breakfast: target.breakfast || '',
      lunch: target.lunch || '',
      snacks: target.snacks || '',
      dinner: target.dinner || '',
      lunchSpecial: target.lunchSpecial || '',
      dietType: target.dietType || 'Pure Veg',
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
        { mealType, day: selectedDay, rating, hygieneRating, comment, committeeReviewed: false },
        user.name,
        room.roomNumber,
        user.rollNo || '24104031'
      )
    )
    dispatch(pushToast('Meal feedback submitted. Thank you!', 'ok'))
    setRating(0)
    setComment('')
  }

  const handleAcknowledgeFeedback = (item) => {
    dispatch(markFeedbackReviewed({ id: item.id, adminNote: wardenNote || 'Acknowledged by Mess Warden.' }))
    dispatch(pushToast('Feedback marked as reviewed.', 'ok'))
    setInspectingFeedback(null)
    setWardenNote('')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Hostel Dining</span>
          <h1>Mess &amp; Dining Hall</h1>
        </div>
        <div className="page-header-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', padding: '6px 14px', borderRadius: 8, border: '1px solid var(--line)' }}>
            <Star size={15} fill="var(--accent-border)" color="var(--accent-border)" />
            <span style={{ fontSize: 13, fontWeight: 700 }}>{avgRating || '4.5'} / 5.0</span>
            <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>({feedback.length} student reviews)</span>
          </div>
        </div>
      </div>

      {/* TODAY'S MEAL SCHEDULE - 4 MEALS INCLUDING SNACKS */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Today's Meal Timetable — {today.day}</h3>
            <p>Freshly prepared daily according to the nutrition and mess committee schedule</p>
          </div>
          <span className="badge badge-ok">
            <span className="badge-dot" /> Live Dining Today
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => {
            const meta = MEAL_INFO[meal]
            const Icon = meta.icon
            const isLunch = meal === 'Lunch'
            return (
              <div
                key={meal}
                style={{
                  background: isLunch ? 'var(--accent-soft)' : 'var(--bg-alt)',
                  border: `1.5px solid ${isLunch ? 'rgba(99, 200, 0, 0.4)' : 'var(--line)'}`,
                  borderRadius: 12,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>
                    <Icon size={17} color={meta.color} /> {meal}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' }}>
                    <Clock size={12} /> {meta.time}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5, fontWeight: 500 }}>
                  {today[meal.toLowerCase()]}
                </p>

                {isLunch && today.lunchSpecial && (
                  <div style={{ marginTop: 'auto', paddingTop: 6, fontSize: 12, color: 'var(--accent-border)', fontWeight: 600 }}>
                    ★ Special: {today.lunchSpecial}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* WEEKLY ALL MEALS TIMETABLE & FEEDBACK COLLECTION */}
      <div className="two-col">
        {/* LEFT COLUMN: WEEKLY TIMETABLE SHOWING ALL MEALS & SNACKS */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Weekly Mess Timetable</h3>
              <p>All meals &amp; snacks across Monday to Sunday</p>
            </div>
            {role === 'admin' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleOpenEditMenu(today)}
              >
                <Edit3 size={14} /> Edit Timetable
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {menu.map((d) => {
              const isCurrentDay = d.day === today.day
              return (
                <div
                  key={d.day}
                  style={{
                    background: isCurrentDay ? 'var(--accent-soft)' : 'var(--surface)',
                    border: `1px solid ${isCurrentDay ? 'rgba(99, 200, 0, 0.4)' : 'var(--line)'}`,
                    borderRadius: 10,
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="mono" style={{ fontWeight: 700, fontSize: 14, color: isCurrentDay ? 'var(--accent-border)' : 'var(--ink)' }}>
                        {d.day}
                      </span>
                      {isCurrentDay && (
                        <span style={{ fontSize: 10.5, fontWeight: 700, background: 'var(--accent)', color: 'var(--accent-ink)', padding: '1px 6px', borderRadius: 4 }}>
                          TODAY
                        </span>
                      )}
                      <span className="badge badge-info" style={{ fontSize: 10.5, padding: '2px 7px' }}>
                        {d.dietType || 'Pure Veg'}
                      </span>
                    </div>

                    {role === 'admin' && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleOpenEditMenu(d)}
                        style={{ padding: '3px 8px', fontSize: 11 }}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 5, fontSize: 12.5, color: 'var(--ink)' }}>
                    <div><strong style={{ color: 'var(--accent-border)' }}>Breakfast:</strong> {d.breakfast}</div>
                    <div><strong style={{ color: '#059669' }}>Lunch:</strong> {d.lunch}</div>
                    <div><strong style={{ color: '#D97706' }}>Snacks:</strong> {d.snacks}</div>
                    <div><strong style={{ color: '#0284C7' }}>Dinner:</strong> {d.dinner}</div>
                    {d.lunchSpecial && (
                      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 }}>
                        ★ <em>Chef's Special:</em> {d.lunchSpecial}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: FEEDBACK COLLECTION & RECENT REVIEWS */}
        <div className="panel">
          {role !== 'admin' && (
            <>
              <div className="panel-head">
                <div>
                  <h3>Meal Feedback Collection</h3>
                  <p>Rate taste, hygiene, and send suggestions to the Mess Committee</p>
                </div>
              </div>

              <form onSubmit={submitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label>Meal Type</label>
                    <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                      <option>Lunch</option>
                      <option>Breakfast</option>
                      <option>Snacks</option>
                      <option>Dinner</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Day</label>
                    <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                      {menu.map((m) => (
                        <option key={m.day} value={m.day}>{m.day}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label>Food Quality &amp; Taste Rating</label>
                  <StarRow value={rating} onChange={setRating} size={22} />
                </div>

                <div>
                  <label>Cleanliness &amp; Dining Hall Hygiene</label>
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
                  <label>Comments &amp; Menu Suggestions (Optional)</label>
                  <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g. Sambar seasoning was great; request extra rasam counter on Tuesdays..."
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                  <MessageSquare size={15} /> Submit Meal Feedback
                </button>
              </form>
            </>
          )}

          <div className="panel-head" style={{ marginTop: role !== 'admin' ? 10 : 0 }}>
            <div>
              <h3>Recent Student Feedbacks</h3>
              <p>Click any feedback to inspect in detail ({feedback.length} total)</p>
            </div>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={14} color="#059669" /> Verified Residents
            </span>
          </div>

          <div className="activity-feed">
            {feedback.map((f) => (
              <div
                className="activity-item"
                key={f.id}
                onClick={() => setInspectingFeedback(f)}
                style={{
                  background: 'var(--bg-alt)',
                  padding: 12,
                  borderRadius: 10,
                  cursor: 'pointer',
                  border: '1px solid var(--line)',
                  transition: 'border-color 0.15s ease, transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-border)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                      {f.studentName}{' '}
                      <span className="mono" style={{ color: 'var(--ink-faint)', fontWeight: 400, fontSize: 11 }}>
                        ({f.studentRoll || 'Roll No. 24104031'})
                      </span>
                    </span>
                    <StarRow value={f.rating} size={13} />
                  </div>

                  <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', display: 'flex', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-border)' }}>{f.mealType} · {f.day}</span>
                    <span>{f.date}</span>
                    {f.committeeReviewed ? (
                      <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <CheckCircle2 size={11} /> Reviewed
                      </span>
                    ) : (
                      <span style={{ color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Eye size={11} /> Click to view
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
        </div>
      </div>

      {/* WARDEN EDIT MESS MENU MODAL */}
      {editingDay && menuForm && (
        <Modal
          title={`Edit Mess Menu — ${menuForm.day}`}
          subtitle="Update meal items and dietary highlights for the dining hall schedule"
          onClose={() => { setEditingDay(null); setMenuForm(null) }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setEditingDay(null); setMenuForm(null) }}
              >
                Cancel
              </button>
              <button type="submit" form="edit-menu-form" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          }
        >
          <form id="edit-menu-form" onSubmit={handleSaveMenu} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Day</label>
              <select
                value={menuForm.day}
                onChange={(e) => {
                  const targetDay = menu.find((m) => m.day === e.target.value)
                  if (targetDay) {
                    setMenuForm({ ...targetDay })
                    setEditingDay(targetDay.day)
                  }
                }}
              >
                {menu.map((m) => (
                  <option key={m.day} value={m.day}>{m.day}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Diet Type &amp; Highlight</label>
              <input
                type="text"
                value={menuForm.dietType}
                onChange={(e) => setMenuForm({ ...menuForm, dietType: e.target.value })}
                placeholder="e.g. Pure Veg / Special Feast"
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
              <label>Chef's Special Lunch Item</label>
              <input
                type="text"
                value={menuForm.lunchSpecial}
                onChange={(e) => setMenuForm({ ...menuForm, lunchSpecial: e.target.value })}
              />
            </div>

            <div>
              <label>Evening Snacks Menu</label>
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

      {/* STUDENT FEEDBACK POPUP INSPECTION MODAL */}
      {inspectingFeedback && (
        <Modal
          title="Student Dining Feedback"
          subtitle={`Feedback #${inspectingFeedback.id} · ${inspectingFeedback.date}`}
          onClose={() => setInspectingFeedback(null)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setInspectingFeedback(null)}
              >
                Close
              </button>
              {role === 'admin' && !inspectingFeedback.committeeReviewed && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleAcknowledgeFeedback(inspectingFeedback)}
                >
                  Mark as Reviewed
                </button>
              )}
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--bg-alt)', padding: 14, borderRadius: 10 }}>
              <div>
                <span className="profile-detail-label" style={{ fontSize: 11 }}>Student Name</span>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{inspectingFeedback.studentName}</div>
              </div>
              <div>
                <span className="profile-detail-label" style={{ fontSize: 11 }}>Roll Number</span>
                <div className="mono" style={{ fontWeight: 700, fontSize: 14 }}>
                  {inspectingFeedback.studentRoll || '24104031'}
                </div>
              </div>
              <div>
                <span className="profile-detail-label" style={{ fontSize: 11 }}>Room &amp; Block</span>
                <div style={{ fontWeight: 600 }}>{inspectingFeedback.roomNumber || 'A-101'}</div>
              </div>
              <div>
                <span className="profile-detail-label" style={{ fontSize: 11 }}>Meal &amp; Day</span>
                <div style={{ fontWeight: 600 }}>{inspectingFeedback.mealType} · {inspectingFeedback.day}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
              <div>
                <span className="profile-detail-label" style={{ fontSize: 11 }}>Food Quality &amp; Taste</span>
                <div style={{ marginTop: 4 }}><StarRow value={inspectingFeedback.rating} size={18} /></div>
              </div>
              <div>
                <span className="profile-detail-label" style={{ fontSize: 11 }}>Dining Hygiene Rating</span>
                <div style={{ marginTop: 4 }}>
                  <span className="badge badge-ok">
                    {inspectingFeedback.hygieneRating === 5 ? 'Excellent (5/5)' : 'Good (4/5)'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label>Student's Comments &amp; Suggestions</label>
              <div
                style={{
                  background: 'var(--surface-2)',
                  padding: 14,
                  borderRadius: 8,
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: 'var(--ink)',
                  fontStyle: inspectingFeedback.comment ? 'normal' : 'italic',
                }}
              >
                {inspectingFeedback.comment ? `“${inspectingFeedback.comment}”` : 'No written remarks provided.'}
              </div>
            </div>

            {inspectingFeedback.adminNote && (
              <div style={{ background: 'var(--accent-soft)', padding: 12, borderRadius: 8, border: '1px solid var(--accent-border)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-border)', textTransform: 'uppercase' }}>
                  Warden Note:
                </span>
                <p style={{ fontSize: 12.5, color: 'var(--ink)', marginTop: 2 }}>{inspectingFeedback.adminNote}</p>
              </div>
            )}

            {role === 'admin' && !inspectingFeedback.committeeReviewed && (
              <div>
                <label>Add Warden Action / Committee Note</label>
                <input
                  type="text"
                  value={wardenNote}
                  onChange={(e) => setWardenNote(e.target.value)}
                  placeholder="e.g. Discussed with caterer; extra spice counter added."
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
