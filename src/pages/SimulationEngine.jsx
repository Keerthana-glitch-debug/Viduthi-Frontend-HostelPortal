import { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Cpu, SlidersHorizontal, TrendingUp, AlertTriangle, CheckCircle2,
  RefreshCw, DollarSign, Droplets, Zap, Utensils, WashingMachine,
  ShieldAlert, Sparkles, Layers, Info, RotateCcw, Copy, Check,
  Users, ThermometerSun, ClipboardList, ShieldCheck
} from 'lucide-react'
import { selectAuth } from '../store/slices/authSlice'
import { pushToast } from '../store/slices/uiSlice'

// Standard baseline numbers for normal daily operation
const BASELINE = {
  studentsCount: 395, // 92% of 430 total beds
  totalBeds: 430,
  monthlyCost: 1485000, // ₹14.85 Lakhs
  waterDailyLiters: 48000, // 48,000 Litres
  powerKW: 185, // 185 kW
  messWastePercent: 5,
  laundryHours: 24,
}

// 5 Real-life hostel situations (simple, understandable English)
const SCENARIOS = [
  {
    id: 'normal',
    name: 'Normal Day',
    desc: 'Regular academic schedule with 90% students on campus.',
    students: 395,
    messLevel: 100, // %
    laundryTimes: 3, // per week
    weatherLevel: 'Normal', // Normal | Hot Summer | Monsoon
    extraBudget: 50000,
  },
  {
    id: 'exams',
    name: 'Exam Preparation Week',
    desc: 'Students stay in rooms 24/7. Late-night study lights, high tea & snacks demand.',
    students: 420,
    messLevel: 115,
    laundryTimes: 2,
    weatherLevel: 'Normal',
    extraBudget: 120000,
  },
  {
    id: 'vacation',
    name: 'Holiday / Long Weekend',
    desc: 'Many students travel home. Kitchen cooks less food, saving money and water.',
    students: 170,
    messLevel: 65,
    laundryTimes: 1,
    weatherLevel: 'Normal',
    extraBudget: 25000,
  },
  {
    id: 'fest',
    name: 'College Fest / Extra Guests',
    desc: 'Full house with visiting teams, large evening dinner feasts, and heavy water use.',
    students: 430,
    messLevel: 135,
    laundryTimes: 4,
    weatherLevel: 'Hot Summer',
    extraBudget: 250000,
  },
  {
    id: 'shortage',
    name: 'Water Cut Emergency',
    desc: 'City municipal water supply is cut for 24 hours. Strict conservation mode.',
    students: 395,
    messLevel: 95,
    laundryTimes: 1,
    weatherLevel: 'Hot Summer',
    extraBudget: 180000,
  },
]

export default function SimulationEngine() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)

  // Interactive Sliders State
  const [students, setStudents] = useState(BASELINE.studentsCount)
  const [messLevel, setMessLevel] = useState(100)
  const [laundryTimes, setLaundryTimes] = useState(3)
  const [weatherCondition, setWeatherCondition] = useState('Normal') // 'Cool / Normal', 'Hot Summer', 'Heavy Monsoon'
  const [extraReserve, setExtraReserve] = useState(50000)
  const [activeScenario, setActiveScenario] = useState('normal')
  const [copied, setCopied] = useState(false)

  // Pure Algorithmic Calculations (Clean & Transparent)
  const results = useMemo(() => {
    const studentRatio = students / BASELINE.studentsCount
    const foodRatio = messLevel / 100
    const laundryRatio = laundryTimes / 3
    const weatherMult = weatherCondition === 'Hot Summer' ? 1.25 : weatherCondition === 'Heavy Monsoon' ? 1.1 : 1.0

    // 1. Monthly Cost Calculation
    const foodCost = 650000 * studentRatio * foodRatio
    const powerWaterCost = 420000 * studentRatio * weatherMult
    const laundryCost = 140000 * studentRatio * laundryRatio
    const roomMaintenance = 275000 * (students > 410 ? 1.2 : 1.0)
    const totalCost = Math.round(foodCost + powerWaterCost + laundryCost + roomMaintenance + extraReserve * 0.2)

    const costDifference = totalCost - BASELINE.monthlyCost
    const costPercentChange = Math.round((costDifference / BASELINE.monthlyCost) * 100)

    // 2. Daily Water Consumption
    const dailyWaterLiters = Math.round(BASELINE.waterDailyLiters * studentRatio * (laundryTimes > 3 ? 1.15 : 1.0) * (weatherCondition === 'Hot Summer' ? 1.18 : 1.0))
    // 60,000L total capacity across overhead tanks
    const waterCapacityLiters = 60000
    const waterTankHoursRemaining = Math.max(4, Math.round((waterCapacityLiters / dailyWaterLiters) * 24))

    // 3. Peak Electricity Load
    const peakPowerKW = Math.round(BASELINE.powerKW * studentRatio * weatherMult)
    const isPowerRisky = peakPowerKW > 215

    // 4. Mess Food Status
    let foodWastePct = Math.round(BASELINE.messWastePercent * (messLevel > 115 ? 1.5 : messLevel < 85 ? 0.6 : 1.0))
    let foodShortageRisk = messLevel < 80 && students > 350
      ? 'High Risk: Food might run out early!'
      : messLevel > 120
      ? 'Watch out: High chance of food leftover'
      : 'Safe: Plenty of food with safe leftover buffer'

    // 5. Laundry Delivery Time
    let laundryWaitHours = Math.round(BASELINE.laundryHours * (laundryTimes / 3) * (students > 410 ? 1.3 : 1.0))
    if (weatherCondition === 'Heavy Monsoon') laundryWaitHours += 14 // Wet weather delays drying

    // 6. Practical Warden Action Checklist
    const actions = []
    if (waterTankHoursRemaining < 16) {
      actions.push('Order 1 private water tanker (12,000 Litres) to refill Block A tanks before 3:00 PM.')
    }
    if (isPowerRisky) {
      actions.push('Instruct electrician to keep the 250 kVA diesel generator on standby from 7:00 PM to 11:00 PM.')
    }
    if (messLevel > 120) {
      actions.push('Tell mess manager to store excess curry and rice safely, or arrange evening donation.')
    } else if (messLevel < 80 && students > 300) {
      actions.push('Alert mess supervisor: Cook 30 extra plates of chapati & dal to prevent shortages.')
    }
    if (laundryWaitHours > 30) {
      actions.push('Post a student notice: Clothes will take up to 48 hours to dry. Priority given to uniform sets.')
    }
    if (students < 250) {
      actions.push('Turn off water heaters and corridor lights on Floors 3 & 4 to save approximately ₹2,500 per day.')
    }
    if (actions.length === 0) {
      actions.push('All systems running smoothly within budget. No emergency measures needed today.')
    }

    // Health status
    const isCrisis = waterTankHoursRemaining < 14 || isPowerRisky || costPercentChange > 20
    const isWarning = costPercentChange > 10 || laundryWaitHours > 32 || foodWastePct > 8

    return {
      totalCost,
      costDifference,
      costPercentChange,
      dailyWaterLiters,
      waterTankHoursRemaining,
      peakPowerKW,
      isPowerRisky,
      foodWastePct,
      foodShortageRisk,
      laundryWaitHours,
      actions,
      statusLevel: isCrisis ? 'danger' : isWarning ? 'warning' : 'optimal',
    }
  }, [students, messLevel, laundryTimes, weatherCondition, extraReserve])

  // Preset Applicator
  const handleSelectScenario = (sc) => {
    setActiveScenario(sc.id)
    setStudents(sc.students)
    setMessLevel(sc.messLevel)
    setLaundryTimes(sc.laundryTimes)
    setWeatherCondition(sc.weatherLevel)
    setExtraReserve(sc.extraBudget)
    dispatch(pushToast(`Loaded situation: "${sc.name}"`, 'ok'))
  }

  const handleReset = () => {
    handleSelectScenario(SCENARIOS[0])
    dispatch(pushToast('Reset to Normal Day baseline.', 'info'))
  }

  const handleCopyPlan = () => {
    const brief = `[VIDUDHI HOSTEL OPERATIONS BRIEF]
Situation: ${SCENARIOS.find((s) => s.id === activeScenario)?.name || 'Custom Plan'}
• Students Present: ${students}
• Estimated Monthly Cost: ₹${(results.totalCost / 100000).toFixed(2)} Lakhs (${results.costPercentChange >= 0 ? '+' : ''}${results.costPercentChange}% vs Normal)
• Daily Water Usage: ${results.dailyWaterLiters.toLocaleString('en-IN')} Litres (Overhead tanks last ~${results.waterTankHoursRemaining} hours)
• Peak Power Load: ${results.peakPowerKW} kW (${results.isPowerRisky ? 'Generator Standby Required' : 'Safe on Grid'})
• Laundry Wait Time: ~${results.laundryWaitHours} hours

Action Checklist for Warden Staff:
${results.actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}
Generated on: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`

    navigator.clipboard.writeText(brief)
    setCopied(true)
    dispatch(pushToast('Operations plan copied to clipboard!', 'ok'))
    setTimeout(() => setCopied(false), 3000)
  }

  // Restrict to Warden
  if (role !== 'warden') {
    return (
      <div className="page">
        <div className="panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <ShieldAlert size={48} color="#DC2626" style={{ margin: '0 auto 16px' }} />
          <h2>Warden Only Tool</h2>
          <p style={{ color: 'var(--ink-soft)', maxWidth: 460, margin: '8px auto 20px' }}>
            The Hostel What-If Planner is exclusively for the Chief Warden to plan campus resources and budgets.
          </p>
          <span className="badge badge-bad">Role: Warden Required</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--teal-border)' }}>
            <Cpu size={14} /> Warden Decision Tool
          </span>
          <h1>Hostel What-If Planner</h1>
          <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 2 }}>
            Test situations before making decisions. See how changes in student count, food, or water affect your budget.
          </p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleReset}>
            <RotateCcw size={14} /> Reset to Normal
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleCopyPlan}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Plan Copied!' : 'Copy Plan for Staff'}
          </button>
        </div>
      </div>

      {/* Real-Life Situation Buttons */}
      <div className="panel" style={{ background: 'var(--surface-2)', border: '1px solid var(--line-strong)', padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="var(--accent-border)" />
            <strong style={{ fontSize: 13, color: 'var(--ink)' }}>Choose a situation to test:</strong>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                type="button"
                className={`btn btn-sm ${activeScenario === sc.id ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleSelectScenario(sc)}
                style={{ fontSize: 12.5 }}
                title={sc.desc}
              >
                {sc.name}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-soft)' }}>
          {SCENARIOS.find((s) => s.id === activeScenario)?.desc}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="two-col" style={{ alignItems: 'start' }}>
        {/* LEFT COLUMN: SIMPLE SLIDERS */}
        <div className="panel">
          <div className="panel-head" style={{ marginBottom: 18 }}>
            <div>
              <h3>Adjust Your Numbers</h3>
              <p>Move any slider below to see the instant live effect</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Slider 1: Students in Hostel */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={16} color="var(--teal-border)" />
                  How many students are in the hostel?
                </label>
                <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
                  {students} students ({Math.round((students / BASELINE.totalBeds) * 100)}% full)
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="430"
                step="5"
                value={students}
                onChange={(e) => { setStudents(Number(e.target.value)); setActiveScenario('custom') }}
                style={{ width: '100%', accentColor: 'var(--accent-border)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-faint)', marginTop: 4 }}>
                <span>100 (Hostel Empty)</span>
                <span>395 (Normal Full)</span>
                <span>430 (100% Packed)</span>
              </div>
            </div>

            {/* Slider 2: Mess Cooking Volume */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Utensils size={16} color="#059669" />
                  How much food should the kitchen cook?
                </label>
                <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: messLevel > 120 ? '#D97706' : 'var(--ink)' }}>
                  {messLevel}% of regular food
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="5"
                value={messLevel}
                onChange={(e) => { setMessLevel(Number(e.target.value)); setActiveScenario('custom') }}
                style={{ width: '100%', accentColor: 'var(--accent-border)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-faint)', marginTop: 4 }}>
                <span>50% (Cook Less)</span>
                <span>100% (Standard Diet)</span>
                <span>150% (Big Feast)</span>
              </div>
            </div>

            {/* Slider 3: Laundry Frequency */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <WashingMachine size={16} color="#0284C7" />
                  How often are clothes washed?
                </label>
                <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: laundryTimes >= 5 ? '#DC2626' : 'var(--ink)' }}>
                  {laundryTimes} washes / week per student
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={laundryTimes}
                onChange={(e) => { setLaundryTimes(Number(e.target.value)); setActiveScenario('custom') }}
                style={{ width: '100%', accentColor: 'var(--accent-border)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-faint)', marginTop: 4 }}>
                <span>1 wash (Light)</span>
                <span>3 washes (Normal)</span>
                <span>6 washes (Very Heavy)</span>
              </div>
            </div>

            {/* Slider 4: Weather & Air Coolers */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ThermometerSun size={16} color="#D97706" />
                  Campus Weather Condition
                </label>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-border)' }}>
                  {weatherCondition}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {['Cool / Normal', 'Hot Summer', 'Heavy Monsoon'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`btn btn-xs ${weatherCondition === w ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => { setWeatherCondition(w); setActiveScenario('custom') }}
                    style={{ fontSize: 12, padding: '8px 6px' }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Reserve */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>
                  Extra Emergency Cash Reserve
                </label>
                <span className="mono" style={{ fontSize: 14, fontWeight: 700 }}>
                  ₹{extraReserve.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="300000"
                step="25000"
                value={extraReserve}
                onChange={(e) => { setExtraReserve(Number(e.target.value)); setActiveScenario('custom') }}
                style={{ width: '100%', accentColor: 'var(--accent-border)' }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIMPLE PREDICTED RESULTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Main Budget Card */}
          <div className="panel" style={{ border: '2px solid var(--accent-border)' }}>
            <div className="panel-head" style={{ marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 16 }}>Projected Monthly Hostel Expense</h3>
                <p>Calculated food, water, electricity, laundry and repair costs</p>
              </div>
              <span className={`badge ${results.costPercentChange > 10 ? 'badge-bad' : results.costPercentChange < 0 ? 'badge-ok' : 'badge-info'}`}>
                {results.costPercentChange >= 0 ? `+${results.costPercentChange}% vs Normal` : `${results.costPercentChange}% vs Normal`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)' }}>
                ₹{(results.totalCost / 100000).toFixed(2)} Lakhs
              </span>
              <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                (Regular Month: ₹{(BASELINE.monthlyCost / 100000).toFixed(2)} Lakhs)
              </span>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
              <span>Monthly Difference:</span>
              <strong style={{ color: results.costDifference > 0 ? '#DC2626' : '#059669' }}>
                {results.costDifference >= 0
                  ? `+₹${results.costDifference.toLocaleString('en-IN')} extra spend`
                  : `-₹${Math.abs(results.costDifference).toLocaleString('en-IN')} money saved`}
              </strong>
            </div>
          </div>

          {/* 4 Clear Impact Boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Box 1: Water Tank */}
            <div className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0284C7', marginBottom: 4 }}>
                <Droplets size={18} />
                <strong style={{ fontSize: 12, textTransform: 'uppercase' }}>Water In Overhead Tanks</strong>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>
                {results.waterTankHoursRemaining} Hours
              </div>
              <span style={{ fontSize: 11.5, color: results.waterTankHoursRemaining < 14 ? '#DC2626' : '#059669', fontWeight: 600 }}>
                {results.waterTankHoursRemaining < 14 ? '⚠ Tank will run dry! Call tanker' : '✓ Sufficient water supply'}
              </span>
              <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>
                {results.dailyWaterLiters.toLocaleString('en-IN')} Litres needed today
              </div>
            </div>

            {/* Box 2: Electricity */}
            <div className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D97706', marginBottom: 4 }}>
                <Zap size={18} />
                <strong style={{ fontSize: 12, textTransform: 'uppercase' }}>Electricity &amp; Power</strong>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>
                {results.peakPowerKW} kW Load
              </div>
              <span style={{ fontSize: 11.5, color: results.isPowerRisky ? '#DC2626' : '#059669', fontWeight: 600 }}>
                {results.isPowerRisky ? '⚠ High Load: Keep generator ready' : '✓ Safe on government power grid'}
              </span>
              <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>
                Safe limit is 215 kW
              </div>
            </div>

            {/* Box 3: Mess Food Status */}
            <div className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', marginBottom: 4 }}>
                <Utensils size={18} />
                <strong style={{ fontSize: 12, textTransform: 'uppercase' }}>Kitchen &amp; Food</strong>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>
                {results.foodWastePct}% Leftover
              </div>
              <span style={{ fontSize: 11.5, color: results.foodWastePct > 8 ? '#D97706' : '#059669', fontWeight: 600 }}>
                {results.foodShortageRisk}
              </span>
              <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>
                Balanced for {students} students
              </div>
            </div>

            {/* Box 4: Laundry Turnaround */}
            <div className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--berry)', marginBottom: 4 }}>
                <WashingMachine size={18} />
                <strong style={{ fontSize: 12, textTransform: 'uppercase' }}>Laundry Return Time</strong>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>
                {results.laundryWaitHours} Hours
              </div>
              <span style={{ fontSize: 11.5, color: results.laundryWaitHours > 30 ? '#DC2626' : '#059669', fontWeight: 600 }}>
                {results.laundryWaitHours > 30 ? '⚠ Queue is full (takes 2 days)' : '✓ Clothes ready in 1 day'}
              </span>
              <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>
                3 washing machines running
              </div>
            </div>
          </div>

          {/* Action Checklist for Warden */}
          <div className="panel" style={{ background: 'var(--surface-2)', border: '1.5px solid var(--line-strong)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <ClipboardList size={17} color="var(--accent-border)" />
              <strong style={{ fontSize: 14, color: 'var(--ink)' }}>
                Recommended Warden Steps for this Situation
              </strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.actions.map((act, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--ink)', lineHeight: 1.45 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-ink)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    {idx + 1}
                  </span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
