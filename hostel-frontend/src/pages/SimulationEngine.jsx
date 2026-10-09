import { useState, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import {
  Activity, SlidersHorizontal, AlertTriangle, CheckCircle2,
  DollarSign, Droplets, Zap, Utensils, RotateCcw, Copy, Check,
  Sparkles, Calendar, Sun, Users, Clock, ShieldCheck, TrendingUp,
  Thermometer, Waves, Info, Compass, ChevronRight
} from 'lucide-react'
import { pushToast } from '../store/slices/uiSlice'

const SCENARIO_PRESETS = [
  {
    id: 'normal',
    label: 'Standard Working Day',
    icon: '🏢',
    desc: 'Regular academic schedule & standard borewell inflow',
    params: { residents: 395, ambientTemp: 30, examStressIndex: 30, waterSupplyInflow: 28000, mealDemandFactor: 100, coolingActiveRatio: 60 },
  },
  {
    id: 'heatwave',
    label: 'Peak Summer Heatwave',
    icon: '☀️',
    desc: 'High ambient heat (39°C) with continuous fan drawdown',
    params: { residents: 410, ambientTemp: 39, examStressIndex: 40, waterSupplyInflow: 22000, mealDemandFactor: 95, coolingActiveRatio: 90 },
  },
  {
    id: 'exams',
    label: 'Final Exam Week',
    icon: '📖',
    desc: 'Late-night room lighting, high stress & peak attendance',
    params: { residents: 425, ambientTemp: 32, examStressIndex: 85, waterSupplyInflow: 30000, mealDemandFactor: 105, coolingActiveRatio: 70 },
  },
  {
    id: 'vacation',
    label: 'Holiday / Vacation Mode',
    icon: '🌴',
    desc: 'Most residents departed; minimal load & low kitchen waste',
    params: { residents: 95, ambientTemp: 28, examStressIndex: 10, waterSupplyInflow: 15000, mealDemandFactor: 60, coolingActiveRatio: 30 },
  },
]

export default function SimulationEngine() {
  const dispatch = useDispatch()

  const [activePreset, setActivePreset] = useState('normal')
  const [isPredicting, setIsPredicting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Core Hostel Parameters (Calibrated for Rural College Campus)
  const [residents, setResidents] = useState(395)
  const [ambientTemp, setAmbientTemp] = useState(30)
  const [examStressIndex, setExamStressIndex] = useState(30)
  const [waterSupplyInflow, setWaterSupplyInflow] = useState(28000)
  const [mealDemandFactor, setMealDemandFactor] = useState(100)
  const [coolingActiveRatio, setCoolingActiveRatio] = useState(60)

  // Apply Pre-configured Scenario
  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id)
    setResidents(preset.params.residents)
    setAmbientTemp(preset.params.ambientTemp)
    setExamStressIndex(preset.params.examStressIndex)
    setWaterSupplyInflow(preset.params.waterSupplyInflow)
    setMealDemandFactor(preset.params.mealDemandFactor)
    setCoolingActiveRatio(preset.params.coolingActiveRatio)
    dispatch(pushToast({ message: `Loaded preset: ${preset.label}`, tone: 'info' }))
  }

  // Real-time Hostel Forecasting Calculation — Rural Scale
  const forecast = useMemo(() => {
    const normResidents = residents / 430
    const normTemp = (ambientTemp - 22) / 22
    const normStress = examStressIndex / 100
    const normMeal = mealDemandFactor / 100
    const normCooling = coolingActiveRatio / 100

    // 1. Peak Electrical Load (kW): Rural 40 kVA transformer baseline
    const thermalCoolingLoad = 8.5 * Math.pow(Math.max(0, normTemp), 1.4) * normCooling
    const baseResidentPower = 8.0 * normResidents
    const examNightLighting = 2.5 * normStress * normResidents
    const predictedPowerKW = Math.round((8.5 + baseResidentPower + thermalCoolingLoad + examNightLighting) * 10) / 10

    // 2. Daily Water Depletion Modeling:
    const perCapitaWater = 65 + (normTemp * 20) + (normStress * 6)
    const totalDailyWaterLiters = Math.round(residents * perCapitaWater)
    const netWaterHourlyDrawdown = Math.round(totalDailyWaterLiters / 16)
    const netHourlyDepletion = Math.max(0, netWaterHourlyDrawdown - (waterSupplyInflow / 16))
    const reservoirVolume = 45000
    const hoursUntilDry = netHourlyDepletion > 0
      ? Math.round((reservoirVolume / netHourlyDepletion) * 10) / 10
      : 99.9

    // 3. Dining Hall Food Consumption:
    const turnoutProbability = Math.min(0.99, Math.max(0.65, 0.94 - (1 - normResidents) * 0.2 + (normStress * 0.04)))
    const expectedDiners = Math.round(residents * turnoutProbability)
    const plannedMeals = Math.round(430 * 0.92)
    const mealVariance = expectedDiners - plannedMeals
    const wasteProbabilityPct = mealVariance < 0
      ? Math.min(24, Math.round(Math.abs(mealVariance) / plannedMeals * 100 * 1.4))
      : Math.max(2, Math.round(4 - (mealVariance / plannedMeals * 8)))

    // 4. Financial Cost Estimation:
    const powerUnitCost = Math.round(predictedPowerKW * 12 * 7.20)
    const waterTankerCost = hoursUntilDry < 12 ? Math.round((45000 - waterSupplyInflow) / 10000) * 950 : 0
    const foodCostPerHead = 76 * normMeal
    const foodDailyCost = Math.round(expectedDiners * foodCostPerHead)
    const predictedDailyExpenseINR = Math.round(powerUnitCost + waterTankerCost + foodDailyCost + 1600)

    // 5. 24-Hour Profile
    const hourlyCurve = Array.from({ length: 24 }).map((_, hour) => {
      let timeMultiplier = 0.45
      if (hour >= 6 && hour <= 9) timeMultiplier = 0.85
      else if (hour >= 10 && hour <= 16) timeMultiplier = 0.70 + (normTemp * 0.25)
      else if (hour >= 17 && hour <= 21) timeMultiplier = 0.95
      else if (hour >= 22 || hour <= 1) timeMultiplier = 0.55 + (normStress * 0.25)

      const baselineKW = Math.round(18 * timeMultiplier)
      const simulatedKW = Math.round(predictedPowerKW * timeMultiplier)
      return { hour, baselineKW, simulatedKW }
    })

    return {
      predictedPowerKW,
      totalDailyWaterLiters,
      netWaterHourlyDrawdown,
      hoursUntilDry,
      expectedDiners,
      wasteProbabilityPct,
      predictedDailyExpenseINR,
      hourlyCurve,
    }
  }, [residents, ambientTemp, examStressIndex, waterSupplyInflow, mealDemandFactor, coolingActiveRatio])

  const handlePredictNeeds = () => {
    setIsPredicting(true)
    setTimeout(() => {
      setIsPredicting(false)
      dispatch(
        pushToast({
          message: `Telemetry recalculated! Power: ${forecast.predictedPowerKW} kW · Mess: ${forecast.expectedDiners} plates · Est. Cost: ₹${forecast.predictedDailyExpenseINR.toLocaleString()}`,
          tone: 'ok',
        })
      )
    }, 300)
  }

  const handleResetDefaults = () => {
    const normal = SCENARIO_PRESETS[0]
    handleSelectPreset(normal)
  }

  const handleCopySummary = () => {
    const summaryText = `=== VIDUDHI HOSTEL DAILY FORECAST & RESOURCE PLAN ===
Date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}

[TODAY'S HOSTEL CONDITIONS]
• Students In Campus: ${residents} Students (${Math.round((residents / 430) * 100)}% Occupancy)
• Outside Temperature: ${ambientTemp}°C (${ambientTemp >= 38 ? 'Extreme Heatwave' : ambientTemp >= 32 ? 'Warm Summer' : 'Pleasant'})
• Academic Period: ${examStressIndex >= 80 ? 'Final Exam Week' : examStressIndex >= 40 ? 'Mid-Term Tests' : 'Regular Schedule'}
• Borewell Supply Inflow: ${waterSupplyInflow.toLocaleString()} L / Day
• Mess Menu Status: ${mealDemandFactor > 120 ? 'Special Feast' : mealDemandFactor < 80 ? 'Holiday / Light' : 'Regular Menu'}
• Fans & Ventilation: ${coolingActiveRatio}%

[ESTIMATED REQUIREMENTS FOR TODAY]
• Electricity Peak Load: ${forecast.predictedPowerKW} kW ${forecast.predictedPowerKW > 28 ? '(High Load Warning!)' : '(Optimal Transformer Draw)'}
• Daily Water Consumption: ${forecast.totalDailyWaterLiters.toLocaleString()} Litres
• Water Reserve Status: ${forecast.hoursUntilDry >= 90 ? 'Continuous Surplus' : `${forecast.hoursUntilDry} Hours Reserve Left`}
• Kitchen Headcount: ${forecast.expectedDiners} Plates (Expected Waste: ${forecast.wasteProbabilityPct}%)
• Total Est. Daily Cost: ₹${forecast.predictedDailyExpenseINR.toLocaleString()}

[ACTION DIRECTIVES]
${forecast.hoursUntilDry < 14 ? '⚠️ Order Water Tanker: Storage low in ' + forecast.hoursUntilDry + ' hours.' : '✓ Borewell & campus storage is sufficient today.'}
${forecast.predictedPowerKW > 28 ? '⚠️ Power Directive: Monitor corridor lights & heavy heating coils.' : '✓ Electrical load is within rural 40 kVA substation limits.'}
💡 Kitchen Staff: Prepare for exactly ${forecast.expectedDiners} students to eliminate food waste.`

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true)
      dispatch(pushToast({ message: 'Resource plan copied to clipboard!', tone: 'ok' }))
      setTimeout(() => setCopied(false), 2200)
    })
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981' }}>
            <Activity size={14} /> Operations Telemetry &amp; Resource Intelligence
          </span>
          <h1>Daily Resource Forecaster</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Predict power draw, water reserve, dining headcounts, and daily hostel expenditures in real-time.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleResetDefaults}>
            <RotateCcw size={14} /> Reset
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleCopySummary}>
            {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Export Plan'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handlePredictNeeds}
            disabled={isPredicting}
            style={{ fontWeight: 700 }}
          >
            <Sparkles size={14} className={isPredicting ? 'spin-slow' : ''} />
            {isPredicting ? 'Calculating...' : 'Recalculate'}
          </button>
        </div>
      </div>

      {/* 1. SCENARIO PRESETS BAR */}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-muted)' }}>
            Scenario Quick Presets:
          </span>
          <span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>One-click campus conditions</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 8 }}>
          {SCENARIO_PRESETS.map((p) => {
            const isSelected = activePreset === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: isSelected ? 'var(--accent-soft)' : 'var(--surface-2)',
                  border: isSelected ? '1.5px solid var(--accent-border)' : '1px solid var(--line)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? 'var(--accent-ink)' : 'var(--text-main)' }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.desc}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. TOP TELEMETRY KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {/* KPI 1: Peak Electrical Draw */}
        <div className="card" style={{ padding: 18, background: 'var(--surface)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
              Peak Power Draw
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(245, 158, 11, 0.12)', display: 'grid', placeItems: 'center' }}>
              <Zap size={18} color="#F59E0B" />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '1.9rem', fontWeight: 900, marginTop: 8, color: 'var(--text-main)' }}>
            {forecast.predictedPowerKW} <span style={{ fontSize: '1rem', fontWeight: 600 }}>kW</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                background: forecast.predictedPowerKW > 28 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: forecast.predictedPowerKW > 28 ? '#DC2626' : '#059669',
              }}
            >
              {forecast.predictedPowerKW > 28 ? '⚠️ High Load' : '✓ Safe Load'}
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>Transformer limit: 35 kW</span>
          </div>
        </div>

        {/* KPI 2: Water Reserve Run-Time */}
        <div className="card" style={{ padding: 18, background: 'var(--surface)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
              Water Storage Runway
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(2, 132, 199, 0.12)', display: 'grid', placeItems: 'center' }}>
              <Droplets size={18} color="#0284C7" />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '1.9rem', fontWeight: 900, marginTop: 8, color: forecast.hoursUntilDry < 14 ? '#DC2626' : 'var(--text-main)' }}>
            {forecast.hoursUntilDry >= 90 ? 'Continuous' : `${forecast.hoursUntilDry}h`}
            {forecast.hoursUntilDry < 90 && <span style={{ fontSize: '1rem', fontWeight: 600 }}> reserve</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                background: forecast.hoursUntilDry < 14 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: forecast.hoursUntilDry < 14 ? '#DC2626' : '#059669',
              }}
            >
              {forecast.hoursUntilDry < 14 ? '⚠️ Order Tanker' : '✓ Surplus Reserve'}
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>Draw: {forecast.netWaterHourlyDrawdown.toLocaleString()} L/h</span>
          </div>
        </div>

        {/* KPI 3: Dining Hall Portions */}
        <div className="card" style={{ padding: 18, background: 'var(--surface)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
              Mess Meals Target
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', display: 'grid', placeItems: 'center' }}>
              <Utensils size={18} color="#10B981" />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '1.9rem', fontWeight: 900, marginTop: 8, color: 'var(--text-main)' }}>
            {forecast.expectedDiners} <span style={{ fontSize: '1rem', fontWeight: 600 }}>Plates</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#059669',
              }}
            >
              Waste: {forecast.wasteProbabilityPct}%
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>{residents} staying today</span>
          </div>
        </div>

        {/* KPI 4: Daily Budget Overhead */}
        <div className="card" style={{ padding: 18, background: 'var(--surface)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
              Est. Daily Operations
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(124, 252, 0, 0.12)', display: 'grid', placeItems: 'center' }}>
              <DollarSign size={18} color="var(--accent-border)" />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '1.9rem', fontWeight: 900, marginTop: 8, color: 'var(--text-main)' }}>
            ₹{forecast.predictedDailyExpenseINR.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--surface-2)', color: 'var(--ink-soft)' }}>
              TANGEDCO + Catering
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>Rural tariff rate</span>
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN SPLIT: INTERACTIVE CONTROLS VS 24-HOUR PROFILE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* LEFT COLUMN: TELEMETRY CONTROLS */}
        <div className="card" style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <SlidersHorizontal size={17} color="var(--accent-border)" />
                Campus Parameters Deck
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--ink-faint)' }}>
                Fine-tune variables to see immediate impact on resource consumption
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Control 1: Students in Residence */}
            <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 700, fontSize: 13, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={14} color="#059669" />
                  Resident Headcount
                </label>
                <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: '#059669' }}>
                  {residents} Students ({Math.round((residents / 430) * 100)}% Full)
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={5}
                value={residents}
                onChange={(e) => { setResidents(Number(e.target.value)); setActivePreset('custom'); }}
                style={{ width: '100%', accentColor: '#059669', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-faint)', marginTop: 3 }}>
                <span>Vacation (50)</span>
                <span>Normal (395)</span>
                <span>Max Capacity (500)</span>
              </div>
            </div>

            {/* Control 2: Temperature */}
            <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 700, fontSize: 13, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sun size={14} color="#EF4444" />
                  Outside Ambient Heat
                </label>
                <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: ambientTemp >= 38 ? '#DC2626' : ambientTemp >= 32 ? '#D97706' : '#059669' }}>
                  {ambientTemp}°C · {ambientTemp >= 38 ? 'Extreme Heat' : ambientTemp >= 32 ? 'Warm Summer' : 'Mild'}
                </span>
              </div>
              <input
                type="range"
                min={22}
                max={44}
                step={1}
                value={ambientTemp}
                onChange={(e) => { setAmbientTemp(Number(e.target.value)); setActivePreset('custom'); }}
                style={{ width: '100%', accentColor: '#EF4444', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-faint)', marginTop: 3 }}>
                <span>Cool (22°C)</span>
                <span>Average (30°C)</span>
                <span>Peak Summer (44°C)</span>
              </div>
            </div>

            {/* Control 3: Borewell & Campus Inflow */}
            <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 700, fontSize: 13, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Droplets size={14} color="#0284C7" />
                  Borewell Supply Inflow
                </label>
                <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: waterSupplyInflow === 0 ? '#DC2626' : '#0284C7' }}>
                  {waterSupplyInflow.toLocaleString()} L / Day
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50000}
                step={2500}
                value={waterSupplyInflow}
                onChange={(e) => { setWaterSupplyInflow(Number(e.target.value)); setActivePreset('custom'); }}
                style={{ width: '100%', accentColor: '#0284C7', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-faint)', marginTop: 3 }}>
                <span>Low (0 L)</span>
                <span>Normal (28k L)</span>
                <span>Abundant (50k L)</span>
              </div>
            </div>

            {/* Control 4: Fan & Lighting Intensity */}
            <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 700, fontSize: 13, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={14} color="#8B5CF6" />
                  Ventilation &amp; Fan Usage
                </label>
                <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: '#8B5CF6' }}>
                  {coolingActiveRatio}% Operational
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={coolingActiveRatio}
                onChange={(e) => { setCoolingActiveRatio(Number(e.target.value)); setActivePreset('custom'); }}
                style={{ width: '100%', accentColor: '#8B5CF6', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-faint)', marginTop: 3 }}>
                <span>Eco (20%)</span>
                <span>Normal (60%)</span>
                <span>Maximum (100%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 24-HOUR PROFILE & ACTION DIRECTIVES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 24-Hour Graph Card */}
          <div className="card" style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                  24-Hour Hourly Grid Load Curve (kW)
                </h4>
                <span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>
                  Average Campus Baseline vs Today's Predicted Demand
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11.5 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink-faint)' }}>
                  <span style={{ width: 12, height: 2, background: '#9CA3AF' }} /> Baseline
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981', fontWeight: 700 }}>
                  <span style={{ width: 12, height: 3, background: '#10B981' }} /> Today Forecast
                </span>
              </div>
            </div>

            <div style={{ width: '100%', height: 130, background: 'var(--surface-2)', borderRadius: 8, padding: '10px 10px 0', position: 'relative' }}>
              <svg width="100%" height="95" viewBox="0 0 240 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="forecasterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path
                  d={forecast.hourlyCurve.reduce((acc, pt, i) => {
                    const x = (i / 23) * 240
                    const y = 80 - (pt.baselineKW / 35) * 75
                    return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`
                  }, '')}
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />

                <path
                  d={
                    forecast.hourlyCurve.reduce((acc, pt, i) => {
                      const x = (i / 23) * 240
                      const y = 80 - (pt.simulatedKW / 35) * 75
                      return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`
                    }, '') + ' L 240 80 L 0 80 Z'
                  }
                  fill="url(#forecasterGrad)"
                />

                <path
                  d={forecast.hourlyCurve.reduce((acc, pt, i) => {
                    const x = (i / 23) * 240
                    const y = 80 - (pt.simulatedKW / 35) * 75
                    return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`
                  }, '')}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                />
              </svg>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>
                <span>00:00 (Night)</span>
                <span>08:00 (Morning)</span>
                <span>14:00 (Peak Heat)</span>
                <span>20:00 (Dinner)</span>
                <span>23:00 (Curfew)</span>
              </div>
            </div>
          </div>

          {/* Operational Directives Panel */}
          <div className="card" style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
              <ShieldCheck size={18} color="#059669" />
              Resource Action Directives for Staff
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {forecast.hoursUntilDry < 14 ? (
                <div style={{ fontSize: 13, color: '#DC2626', background: 'rgba(239, 68, 68, 0.08)', padding: '10px 14px', borderRadius: 8, borderLeft: '4px solid #DC2626' }}>
                  ⚠️ <strong>Water Logistics:</strong> Reserve will drop below 20% in {forecast.hoursUntilDry} hours. Schedule municipal or private water tanker dispatch.
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#059669', background: 'rgba(16, 185, 129, 0.08)', padding: '10px 14px', borderRadius: 8, borderLeft: '4px solid #10B981' }}>
                  ✓ <strong>Water Storage:</strong> Campus overhead tanks and borewell yield are running at healthy equilibrium.
                </div>
              )}

              {forecast.predictedPowerKW > 28 ? (
                <div style={{ fontSize: 13, color: '#D97706', background: 'rgba(245, 158, 11, 0.08)', padding: '10px 14px', borderRadius: 8, borderLeft: '4px solid #F59E0B' }}>
                  ⚠️ <strong>Electrical Grid:</strong> Projected load is {forecast.predictedPowerKW} kW. Restrict unauthorized immersion heaters and ensure corridor timers are activated.
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#059669', background: 'rgba(16, 185, 129, 0.08)', padding: '10px 14px', borderRadius: 8, borderLeft: '4px solid #10B981' }}>
                  ✓ <strong>Transformer Load:</strong> Operating within optimal rural 40 kVA substation tolerances ({forecast.predictedPowerKW} kW).
                </div>
              )}

              <div style={{ fontSize: 13, color: 'var(--text-main)', background: 'var(--surface-2)', padding: '10px 14px', borderRadius: 8, borderLeft: '4px solid var(--accent-border)' }}>
                💡 <strong>Catering Directive:</strong> Mess kitchen instructed to prepare exactly <strong>{forecast.expectedDiners} portions</strong>. Waste probability estimated at {forecast.wasteProbabilityPct}%.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
