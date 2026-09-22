import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Star, UtensilsCrossed, Coffee, Soup, Clock, CheckCircle2,
  MessageSquare, ShieldCheck, Edit3, Cookie, Eye, ChevronLeft, ChevronRight,
  Scale, PackageCheck, Apple, AlertTriangle, AlertCircle, RefreshCw, Plus,
  TrendingDown, Check, FileCheck, Users,
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
  const [selectedSnackWeek, setSelectedSnackWeek] = useState(1) // 1 | 2
  const [rating, setRating] = useState(0)
  const [hygieneRating, setHygieneRating] = useState(5)
  const [mealType, setMealType] = useState('Lunch')
  const [comment, setComment] = useState('')

  const isManager = role === 'mess_manager' || role === 'warden'
  const [messTab, setMessTab] = useState('menu')

  // Warden & Mess Manager editing menu state
  const [editingDay, setEditingDay] = useState(null)
  const [menuForm, setMenuForm] = useState(null)

  // Student feedback popup state
  const [inspectingFeedback, setInspectingFeedback] = useState(null)
  const [wardenNote, setWardenNote] = useState('')

  // Grocery & Raw Material Inventory
  const [inventoryList, setInventoryList] = useState([
    { id: 'INV-01', item: 'Ponni Boiled Rice', category: 'Grains', stock: 340, unit: 'kg', threshold: 100, supplier: 'Sri Ram Agro Mills', lastRestocked: '2026-08-01', status: 'Optimal' },
    { id: 'INV-02', item: 'Toor Dal (Grade A)', category: 'Pulses', stock: 85, unit: 'kg', threshold: 50, supplier: 'Pachaiyappa Agro', lastRestocked: '2026-08-02', status: 'Optimal' },
    { id: 'INV-03', item: 'Refined Sunflower Oil', category: 'Oils & Fats', stock: 18, unit: 'litres', threshold: 25, supplier: 'Fortune Consumer Pack', lastRestocked: '2026-07-28', status: 'Low Stock' },
    { id: 'INV-04', item: 'Sambar Shallots (Small Onion)', category: 'Vegetables', stock: 42, unit: 'kg', threshold: 20, supplier: 'Ottanchathiram Veg Mandi', lastRestocked: '2026-08-05', status: 'Optimal' },
    { id: 'INV-05', item: 'Farm Fresh Country Eggs', category: 'Poultry', stock: 480, unit: 'units', threshold: 150, supplier: 'Namakkal Poultry Hub', lastRestocked: '2026-08-04', status: 'Optimal' },
    { id: 'INV-06', item: 'Aavin Pure Fresh Milk / Curd', category: 'Dairy', stock: 120, unit: 'litres', threshold: 40, supplier: 'Aavin Co-operative', lastRestocked: '2026-08-05', status: 'Optimal' },
    { id: 'INV-07', item: 'Commercial LPG Cylinder (19kg)', category: 'Fuel', stock: 7, unit: 'cylinders', threshold: 3, supplier: 'Bharat Gas Logistics', lastRestocked: '2026-07-30', status: 'Optimal' },
  ])

  // Headcount Forecast & Plate Wastage Logs
  const [wasteLogs, setWasteLogs] = useState([
    { id: 'WST-101', date: '2026-08-05', meal: 'Breakfast', wasteKg: 1.8, platesServed: 142, remarks: 'Optimal idli portioning; minimal plate waste' },
    { id: 'WST-102', date: '2026-08-05', meal: 'Lunch', wasteKg: 2.8, platesServed: 148, remarks: 'Rice wastage 18% lower than weekly average' },
    { id: 'WST-103', date: '2026-08-04', meal: 'Dinner', wasteKg: 3.1, platesServed: 144, remarks: 'Chapati dough calculated accurately' },
  ])
  const [wasteKgInput, setWasteKgInput] = useState('')
  const [wasteMealInput, setWasteMealInput] = useState('Lunch')
  const [wasteRemarkInput, setWasteRemarkInput] = useState('')

  // Special Dietary & Allergy Registry
  const [dietaryRegistry, setDietaryRegistry] = useState([
    { id: 'DR-01', studentName: 'Keerthana', rollNo: '24104030', room: 'B-37', requirement: 'Lactose-Free & Mild Spice', category: 'Medical Allergy', mealPreference: 'Non-Dairy Sambar & Phulka Chapati', status: 'Active Verified' },
    { id: 'DR-02', studentName: 'Deepika A.', rollNo: '23104092', room: 'C-102', requirement: 'Gluten Sensitive (Celiac Safe)', category: 'Allergy Alert', mealPreference: 'Pure Steamed Rice & Millet Only (No Wheat)', status: 'Active Verified' },
    { id: 'DR-03', studentName: 'Priya M.', rollNo: '23104560', room: 'A-102', requirement: 'Diabetic / Low Glycemic Index', category: 'Medical Diet', mealPreference: 'Brown Rice & Bitter Gourd Poriyal', status: 'Active Verified' },
    { id: 'DR-04', studentName: 'Swetha T.', rollNo: '24104044', room: 'A-103', requirement: 'Jain Vegetarian', category: 'Dietary Preference', mealPreference: 'Zero Onion & Zero Garlic Curries', status: 'Active Verified' },
  ])

  // Kitchen Hygiene & FSSAI Safety Audit Checklist
  const [safetyAudits, setSafetyAudits] = useState([
    { id: 'AUD-01', parameter: 'Cooking Oil Free Fatty Acids (FFA)', measurement: '1.08% FFA', standard: '< 2.0% (FSSAI Safe Limit)', verifiedAt: 'Today, 06:30 AM', status: 'Passed', verifiedBy: 'Mrs. Muthumari' },
    { id: 'AUD-02', parameter: 'Commercial RO Drinking Water TDS', measurement: '86 ppm', standard: '50 – 120 ppm (Potable Pure)', verifiedAt: 'Today, 07:00 AM', status: 'Passed', verifiedBy: 'Mrs. Muthumari' },
    { id: 'AUD-03', parameter: 'Walk-In Deep Freezer Chiller Temp', measurement: '-18.4°C', standard: 'Below -18°C', verifiedAt: 'Today, 06:15 AM', status: 'Passed', verifiedBy: 'Murugan V. (Chef)' },
    { id: 'AUD-04', parameter: 'Milk & Dairy Cool Storage Temp', measurement: '+3.1°C', standard: '0°C to +4°C', verifiedAt: 'Today, 06:15 AM', status: 'Passed', verifiedBy: 'Murugan V. (Chef)' },
    { id: 'AUD-05', parameter: 'Kitchen Hand Sanitizer & Hairnet Audit', measurement: '100% Staff Check', standard: 'Mandatory FSSAI Hygiene', verifiedAt: 'Today, 07:15 AM', status: 'Passed', verifiedBy: 'Mrs. Muthumari' },
  ])

  const handleReorderStock = (item) => {
    setInventoryList((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, stock: i.stock + 50, status: 'Optimal', lastRestocked: 'Just Now' }
          : i
      )
    )
    dispatch(pushToast(`Purchase order issued for ${item.item}! +50 ${item.unit} added to stock.`, 'ok'))
  }

  const handleLogWasteSubmit = (e) => {
    e.preventDefault()
    if (!wasteKgInput || isNaN(wasteKgInput)) {
      dispatch(pushToast('Please enter a valid weight in kg.', 'warn'))
      return
    }
    const newLog = {
      id: `WST-${Date.now().toString().slice(-3)}`,
      date: new Date().toISOString().slice(0, 10),
      meal: wasteMealInput,
      wasteKg: parseFloat(wasteKgInput),
      platesServed: wasteMealInput === 'Lunch' ? 148 : 142,
      remarks: wasteRemarkInput || 'Logged by Mess Manager',
    }
    setWasteLogs([newLog, ...wasteLogs])
    dispatch(pushToast(`Recorded ${wasteKgInput} kg waste for ${wasteMealInput}. Waste efficiency logged.`, 'ok'))
    setWasteKgInput('')
    setWasteRemarkInput('')
  }

  const handleRunSafetyAudit = () => {
    setSafetyAudits((prev) =>
      prev.map((a) => ({ ...a, verifiedAt: 'Just Now', status: 'Passed' }))
    )
    dispatch(pushToast('FSSAI Food Safety & Hygiene Audit refreshed. All parameters verified compliant!', 'ok'))
  }

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

      {/* Mess Manager Advanced Operations Navigation Bar */}
      {isManager && (
        <div className="panel" style={{ padding: '10px 14px', marginBottom: 16, background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', marginRight: 4 }}>
              Mess Manager Portal:
            </span>
            <button
              type="button"
              className={`btn btn-sm ${messTab === 'menu' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setMessTab('menu')}
            >
              <UtensilsCrossed size={14} /> Weekly Menu &amp; Add-ons
            </button>
            <button
              type="button"
              className={`btn btn-sm ${messTab === 'headcount' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setMessTab('headcount')}
            >
              <Scale size={14} /> Headcount &amp; Waste Forecast
            </button>
            <button
              type="button"
              className={`btn btn-sm ${messTab === 'inventory' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setMessTab('inventory')}
            >
              <PackageCheck size={14} /> Grocery &amp; Raw Material Stock
              {inventoryList.filter((i) => i.status === 'Low Stock').length > 0 && (
                <span className="badge badge-bad" style={{ marginLeft: 6, fontSize: 10, padding: '1px 5px' }}>
                  {inventoryList.filter((i) => i.status === 'Low Stock').length} Low
                </span>
              )}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${messTab === 'dietary' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setMessTab('dietary')}
            >
              <Apple size={14} /> Dietary &amp; Allergy Registry
            </button>
            <button
              type="button"
              className={`btn btn-sm ${messTab === 'safety' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setMessTab('safety')}
            >
              <ShieldCheck size={14} /> Hygiene &amp; FSSAI Audit
            </button>
            <button
              type="button"
              className={`btn btn-sm ${messTab === 'feedback' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setMessTab('feedback')}
            >
              <MessageSquare size={14} /> Student Reviews ({feedback.length})
            </button>
          </div>
        </div>
      )}

      {/* 1. WEEKLY MENU & ADD-ONS TAB (Available to all residents; managers access via tab) */}
      {(!isManager || messTab === 'menu') && (
        <>
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
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {isManager && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleOpenEditMenu(activeDayMenu)}
                  >
                    <Edit3 size={14} /> Edit {activeDayMenu.day}&apos;s Menu
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)', gap: 16, alignItems: 'start' }}>
              {/* Left Column: 4 Daily Meal Sessions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => {
                  const meta = MEAL_INFO[meal]
                  const Icon = meta.icon
                  const isLunch = meal === 'Lunch'
                  const isSnacks = meal === 'Snacks'
                  let mealText = activeDayMenu[meal.toLowerCase()]
                  if (isSnacks) {
                    if (selectedSnackWeek === 1 && activeDayMenu.snacksWeek1) {
                      mealText = activeDayMenu.snacksWeek1
                    } else if (selectedSnackWeek === 2 && activeDayMenu.snacksWeek2) {
                      mealText = activeDayMenu.snacksWeek2
                    }
                  }

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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
                          <Icon size={16} color={meta.color} /> {meal}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' }}>
                          <Clock size={11} /> {meta.time}
                        </span>
                      </div>

                      {isSnacks && (
                        <div style={{ display: 'inline-flex', background: 'var(--surface-3)', padding: 2, borderRadius: 6, gap: 4, alignSelf: 'flex-start' }}>
                          <button
                            type="button"
                            className={`btn btn-xs ${selectedSnackWeek === 1 ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ fontSize: 10, padding: '2px 7px' }}
                            onClick={() => setSelectedSnackWeek(1)}
                          >
                            Week 1
                          </button>
                          <button
                            type="button"
                            className={`btn btn-xs ${selectedSnackWeek === 2 ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ fontSize: 10, padding: '2px 7px' }}
                            onClick={() => setSelectedSnackWeek(2)}
                          >
                            Week 2
                          </button>
                        </div>
                      )}

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
                        background: 'var(--surface)',
                        borderRadius: 8,
                        border: '1px solid var(--line)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{item.desc}</div>
                        <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-border)', marginTop: 2 }}>
                          ₹{item.price} each
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ width: 26, height: 26, padding: 0 }}
                          onClick={() => updateAddOnCount(key, -1)}
                          disabled={item.count === 0}
                        >
                          -
                        </button>
                        <span className="mono" style={{ minWidth: 20, textAlign: 'center', fontWeight: 800 }}>
                          {item.count}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ width: 26, height: 26, padding: 0 }}
                          onClick={() => updateAddOnCount(key, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    padding: 10,
                    background: 'var(--surface)',
                    borderRadius: 8,
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

          {/* Student Review Form & Day Feedback (Students only) */}
          {!isManager && (
            <div className="two-col">
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h3>Rate {activeDay}&apos;s Food &amp; Dining Hall</h3>
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
                                <CheckCircle2 size={11} /> Reviewed by Mess Desk
                              </span>
                            )}
                          </div>

                          {f.comment && (
                            <div style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.4 }}>
                              &ldquo;{f.comment}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* 2. HEADCOUNT & WASTAGE FORECAST TAB */}
      {isManager && messTab === 'headcount' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="stat-grid">
            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-border)' }}>
                <Coffee size={18} />
                <strong style={{ fontSize: 13 }}>Breakfast</strong>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 2px' }}>142 / 150</div>
              <span className="badge badge-ok">94.6% Turnout</span>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669' }}>
                <UtensilsCrossed size={18} />
                <strong style={{ fontSize: 13 }}>Lunch (Live)</strong>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 2px' }}>148 / 150</div>
              <span className="badge badge-ok">98.6% Turnout</span>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D97706' }}>
                <Cookie size={18} />
                <strong style={{ fontSize: 13 }}>Evening Snacks</strong>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 2px' }}>132 / 150</div>
              <span className="badge badge-brass">88.0% Projected</span>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0284C7' }}>
                <Soup size={18} />
                <strong style={{ fontSize: 13 }}>Dinner</strong>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 2px' }}>145 / 150</div>
              <span className="badge badge-info">96.6% Projected</span>
            </div>
          </div>

          <div className="two-col">
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h3>Log Dining Hall Plate Wastage</h3>
                  <p>Daily meal cleanup weight logging &amp; waste audit</p>
                </div>
              </div>
              <form onSubmit={handleLogWasteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label>Meal Session</label>
                  <select value={wasteMealInput} onChange={(e) => setWasteMealInput(e.target.value)}>
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Snacks</option>
                    <option>Dinner</option>
                  </select>
                </div>
                <div>
                  <label>Measured Food Waste (in kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 2.4"
                    value={wasteKgInput}
                    onChange={(e) => setWasteKgInput(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Kitchen Remarks &amp; Observations</label>
                  <input
                    type="text"
                    placeholder="e.g. Gravy portion optimal, minimal rice leftovers"
                    value={wasteRemarkInput}
                    onChange={(e) => setWasteRemarkInput(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                  <Scale size={15} /> Record Wastage Entry
                </button>
              </form>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <h3>Sustainability &amp; Wastage Audit Logs</h3>
                  <p>Daily waste vs 8.0 kg target threshold</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {wasteLogs.map((log) => (
                  <div key={log.id} className="card" style={{ padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <strong style={{ fontSize: 13.5 }}>{log.date} · {log.meal}</strong>
                      <span className="badge badge-ok">{log.wasteKg} kg waste</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', display: 'flex', gap: 14 }}>
                      <span>Plates Served: <strong>{log.platesServed}</strong></span>
                      <span>Avg per Plate: <strong>{Math.round((log.wasteKg / log.platesServed) * 1000)}g</strong></span>
                    </div>
                    {log.remarks && (
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--ink-faint)' }}>{log.remarks}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. GROCERY & RAW MATERIAL INVENTORY TAB */}
      {isManager && messTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {inventoryList.some((i) => i.status === 'Low Stock') && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1.5px solid #EF4444',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <AlertTriangle size={22} color="#EF4444" />
              <div>
                <strong style={{ color: '#EF4444', fontSize: 13.5 }}>Low Inventory Stock Alert Detected!</strong>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-soft)' }}>
                  Refined Sunflower Cooking Oil is below the minimum threshold (18 L remaining, min: 25 L). Click Reorder to issue a vendor PO.
                </p>
              </div>
            </div>
          )}

          <div className="stat-grid">
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Tracked Commodities</div>
              <div style={{ fontSize: 22, fontWeight: 800, margin: '6px 0 2px' }}>{inventoryList.length} Items</div>
              <span className="badge badge-info">FSSAI Batch Inspected</span>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Low Stock Reorders</div>
              <div style={{ fontSize: 22, fontWeight: 800, margin: '6px 0 2px' }}>
                {inventoryList.filter((i) => i.status === 'Low Stock').length}
              </div>
              <span className="badge badge-bad">Immediate Action</span>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Monthly Grocery Buffer</div>
              <div style={{ fontSize: 22, fontWeight: 800, margin: '6px 0 2px' }}>₹1,48,500</div>
              <span className="badge badge-ok">Allocated Funds</span>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Next Vendor Drop</div>
              <div style={{ fontSize: 22, fontWeight: 800, margin: '6px 0 2px' }}>Tomorrow 07:00 AM</div>
              <span className="badge badge-ok">Dairy &amp; Veggies</span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Hostel Food Stocks &amp; Raw Material Inventory</h3>
                <p>Real-time stores ledger, threshold warnings, and vendor purchase orders</p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Item &amp; Commodity</th>
                    <th style={{ padding: '10px 12px' }}>Category</th>
                    <th style={{ padding: '10px 12px' }}>Available Stock</th>
                    <th style={{ padding: '10px 12px' }}>Min Threshold</th>
                    <th style={{ padding: '10px 12px' }}>Supplier / Contractor</th>
                    <th style={{ padding: '10px 12px' }}>Last Restocked</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryList.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>{item.item}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--ink-soft)' }}>{item.category}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="mono" style={{ fontWeight: 800, color: item.status === 'Low Stock' ? '#EF4444' : 'var(--accent-border)' }}>
                          {item.stock} {item.unit}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--ink-faint)' }}>{item.threshold} {item.unit}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12 }}>{item.supplier}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--ink-soft)' }}>{item.lastRestocked}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge tone={item.status === 'Low Stock' ? 'bad' : 'ok'}>{item.status}</Badge>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleReorderStock(item)}
                          style={{ fontSize: 12, padding: '4px 8px' }}
                        >
                          <RefreshCw size={12} /> Reorder (+50)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. DIETARY & ALLERGY REGISTRY TAB */}
      {isManager && messTab === 'dietary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: 'rgba(124, 252, 0, 0.08)',
              border: '1.5px solid var(--accent-border)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Apple size={22} color="var(--accent-border)" />
              <div>
                <strong style={{ fontSize: 14 }}>Student Medical &amp; Special Diet Registry Active</strong>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-soft)' }}>
                  Food allergies and medical dietary restrictions tracked for campus resident health and wellness.
                </p>
              </div>
            </div>
            <span className="badge badge-ok">4 Registered Residents</span>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Resident Dietary Restrictions &amp; Counter Instructions</h3>
                <p>Individual requirements verified by the Campus Health Clinic</p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => dispatch(pushToast('New dietary entry intake request registered with Clinic.', 'ok'))}
              >
                <Plus size={14} /> Register New Special Diet
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Resident Name</th>
                    <th style={{ padding: '10px 12px' }}>Roll No</th>
                    <th style={{ padding: '10px 12px' }}>Room</th>
                    <th style={{ padding: '10px 12px' }}>Special Diet / Allergy</th>
                    <th style={{ padding: '10px 12px' }}>Classification</th>
                    <th style={{ padding: '10px 12px' }}>Kitchen Prep &amp; Serving Rule</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dietaryRegistry.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>{d.studentName}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>{d.rollNo}</td>
                      <td style={{ padding: '10px 12px' }}>{d.room}</td>
                      <td style={{ padding: '10px 12px', color: '#EF4444', fontWeight: 600 }}>{d.requirement}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <Badge tone={d.category.includes('Allergy') ? 'bad' : 'info'}>{d.category}</Badge>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12.5 }}>{d.mealPreference}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="badge badge-ok">{d.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. FOOD SAFETY & HYGIENE TAB */}
      {isManager && messTab === 'safety' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            className="panel"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, var(--surface) 100%)',
              border: '1.5px solid var(--accent-border)',
              padding: '18px 22px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <span className="eyebrow" style={{ color: 'var(--accent-border)' }}>FSSAI Central Hostel Kitchen Standards</span>
                <h2 style={{ margin: '4px 0 6px', fontSize: 20 }}>Food Safety &amp; Kitchen Sanitation Index: 98.4% (Grade A+)</h2>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-soft)' }}>
                  Certified under FSSAI License #12423019000412. All parameters within regulatory public health limits.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRunSafetyAudit}
              >
                <FileCheck size={16} /> Conduct Daily Audit Verification
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Today&apos;s Laboratory &amp; Environmental Quality Checks</h3>
                <p>Live measurements recorded at the Annapoorna Dining Complex</p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Audit Parameter</th>
                    <th style={{ padding: '10px 12px' }}>Measured Metric</th>
                    <th style={{ padding: '10px 12px' }}>Permissible Benchmark</th>
                    <th style={{ padding: '10px 12px' }}>Verified At</th>
                    <th style={{ padding: '10px 12px' }}>Audit Officer</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {safetyAudits.map((a) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>{a.parameter}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--accent-border)', fontWeight: 800 }}>{a.measurement}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--ink-soft)' }}>{a.standard}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12 }}>{a.verifiedAt}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12 }}>{a.verifiedBy}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="badge badge-ok" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Check size={11} /> {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. ALL STUDENT REVIEWS & FEEDBACK DESK TAB */}
      {isManager && messTab === 'feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Student Dining Feedback Desk ({feedback.length} on record)</h3>
                <p>Verified resident ratings, quality suggestions, and committee resolution notes</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {feedback.map((f) => (
                <div
                  key={f.id}
                  className="card"
                  onClick={() => setInspectingFeedback(f)}
                  style={{
                    padding: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <strong style={{ fontSize: 14 }}>
                        {f.studentName} <span className="mono" style={{ color: 'var(--ink-faint)', fontWeight: 400, fontSize: 12 }}>({f.studentRoll}) · Room {f.roomNumber || 'A-101'}</span>
                      </strong>
                      <StarRow value={f.rating} size={15} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', display: 'flex', gap: 12, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-border)' }}>{f.mealType} ({f.day})</span>
                      <span>{f.date}</span>
                      <span>Hygiene: {f.hygieneRating || 5}/5 Stars</span>
                    </div>
                    {f.comment && (
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--ink)', fontStyle: 'italic' }}>
                        &ldquo;{f.comment}&rdquo;
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {f.committeeReviewed ? (
                      <span className="badge badge-ok" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={12} /> Reviewed
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={(e) => {
                          e.stopPropagation()
                          setInspectingFeedback(f)
                        }}
                      >
                        Review Feedback
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
              {isManager && !inspectingFeedback.committeeReviewed && (
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
            {isManager && !inspectingFeedback.committeeReviewed && (
              <div>
                <label>Mess Management / Committee Note</label>
                <input
                  type="text"
                  placeholder="e.g. Shared with chef team; extra spice station added."
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
