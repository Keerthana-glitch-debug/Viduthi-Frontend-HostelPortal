import { useState, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import {
  Activity, SlidersHorizontal, AlertTriangle, CheckCircle2,
  DollarSign, Droplets, Zap, Utensils, RotateCcw, Copy, Check,
  Sparkles, Calendar, Sun, Users, Clock, ShieldCheck
} from 'lucide-react'
import { pushToast } from '../store/slices/uiSlice'

export default function SimulationEngine() {
  const dispatch = useDispatch()

  const [isPredicting, setIsPredicting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Hostel Scenario Parameters (Simple real-world sliders for Warden)
  const [residents, setResidents] = useState(395) // 50 to 500 students
  const [ambientTemp, setAmbientTemp] = useState(32) // 22 to 44°C
  const [examStressIndex, setExamStressIndex] = useState(30) // 0 to 100%
  const [municipalWaterInflow, setMunicipalWaterInflow] = useState(25000) // 0 to 60,000 Litres
  const [mealDemandFactor, setMealDemandFactor] = useState(100) // 50% to 150%
  const [coolingActiveRatio, setCoolingActiveRatio] = useState(65) // 20% to 100%

  // Real-time Hostel Forecasting Calculation
  const forecast = useMemo(() => {
    // Capacity normalization
    const normResidents = residents / 430
    const normTemp = (ambientTemp - 22) / 22
    const normStress = examStressIndex / 100
    const normMeal = mealDemandFactor / 100
    const normCooling = coolingActiveRatio / 100

    // 1. Peak Electrical Load (kW):
    const thermalCoolingLoad = 85 * Math.pow(normTemp, 1.6) * normCooling
    const baseResidentPower = 70 * normResidents
    const examNightLighting = 25 * normStress * normResidents
    const predictedPowerKW = Math.round((55 + baseResidentPower + thermalCoolingLoad + examNightLighting) * 10) / 10

    // 2. Daily Water Depletion Modeling:
    const perCapitaWater = 110 + (normTemp * 45) + (normStress * 12)
    const totalDailyWaterLiters = Math.round(residents * perCapitaWater)
    const netWaterHourlyDrawdown = Math.round(totalDailyWaterLiters / 16)
    const netHourlyDepletion = Math.max(0, netWaterHourlyDrawdown - (municipalWaterInflow / 16))
    const reservoirVolume = 65000
    const hoursUntilDry = netHourlyDepletion > 0
      ? Math.round((reservoirVolume / netHourlyDepletion) * 10) / 10
      : 99.9

    // 3. Dining Hall Food Consumption:
    const turnoutProbability = Math.min(0.99, Math.max(0.65, 0.94 - (1 - normResidents) * 0.2 + (normStress * 0.04)))
    const expectedDiners = Math.round(residents * turnoutProbability)
    const plannedMeals = Math.round(430 * 0.92)
    const mealVariance = expectedDiners - plannedMeals
    const wasteProbabilityPct = mealVariance < 0
      ? Math.min(28, Math.round(Math.abs(mealVariance) / plannedMeals * 100 * 1.5))
      : Math.max(2, Math.round(4 - (mealVariance / plannedMeals * 10)))

    // 4. Financial Cost Estimation:
    const powerUnitCost = predictedPowerKW * 12 * 9.5
    const waterTankerCost = hoursUntilDry < 12 ? Math.round((65000 - municipalWaterInflow) / 12000) * 1650 : 0
    const foodDailyCost = expectedDiners * 145 * normMeal
    const predictedDailyExpenseINR = Math.round(powerUnitCost + waterTankerCost + foodDailyCost + 8500)

    // 5. 24-Hour Horizon Hourly Demand Profile
    const hourlyCurve = Array.from({ length: 24 }).map((_, hour) => {
      let timeMultiplier = 0.4
      if (hour >= 6 && hour <= 9) timeMultiplier = 0.85
      else if (hour >= 10 && hour <= 16) timeMultiplier = 0.70 + (normTemp * 0.35)
      else if (hour >= 17 && hour <= 21) timeMultiplier = 0.92
      else if (hour >= 22 || hour <= 1) timeMultiplier = 0.55 + (normStress * 0.30)

      const baselineKW = Math.round(145 * timeMultiplier)
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
  }, [residents, ambientTemp, examStressIndex, municipalWaterInflow, mealDemandFactor, coolingActiveRatio])

  // Trigger Forecast Recalculation Button
  const handlePredictNeeds = () => {
    setIsPredicting(true)
    setTimeout(() => {
      setIsPredicting(false)
      dispatch(
        pushToast({
          message: `Forecast updated! Power needed: ${forecast.predictedPowerKW} kW, Mess: ${forecast.expectedDiners} plates.`,
          tone: 'ok',
        })
      )
    }, 350)
  }

  // Reset to Normal Standard Day
  const handleResetDefaults = () => {
    setResidents(395)
    setAmbientTemp(30)
    setExamStressIndex(30)
    setMunicipalWaterInflow(25000)
    setMealDemandFactor(100)
    setCoolingActiveRatio(60)
    dispatch(pushToast({ message: 'Hostel conditions reset to standard working day.', tone: 'info' }))
  }

  // Copy Clean Summary for Warden's Daily Log / WhatsApp
  const handleCopySummary = () => {
    const summaryText = `=== VIDUDHI HOSTEL DAILY FORECAST & RESOURCE PLAN ===
Date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}

[TODAY'S HOSTEL CONDITIONS]
• Students Staying in Hostel: ${residents} Students
• Weather / Temperature: ${ambientTemp}°C (${ambientTemp >= 38 ? 'Extreme Heat' : ambientTemp >= 32 ? 'Warm Summer' : 'Pleasant / Mild'})
• Exam / Academic Period: ${examStressIndex >= 80 ? 'Final Exam Week' : examStressIndex >= 40 ? 'Mid-Term Tests' : 'Regular Classes'}
• Town Water Inflow: ${municipalWaterInflow.toLocaleString()} Litres
• Mess Menu Type: ${mealDemandFactor > 120 ? 'Special Festival Feast' : mealDemandFactor < 80 ? 'Light Holiday' : 'Regular Menu'}
• Fans & AC Usage: ${coolingActiveRatio}%

[ESTIMATED REQUIREMENTS FOR TODAY]
• Electricity Needed: ${forecast.predictedPowerKW} kW ${forecast.predictedPowerKW > 200 ? '(High Load Alert!)' : '(Normal Range)'}
• Daily Water Needed: ${forecast.totalDailyWaterLiters.toLocaleString()} Litres
• Water Storage Status: ${forecast.hoursUntilDry >= 90 ? 'Continuous Safe Reserve' : `${forecast.hoursUntilDry} Hours Left`}
• Mess Meals to Cook: ${forecast.expectedDiners} Plates (Expected Food Waste: ${forecast.wasteProbabilityPct}%)
• Estimated Total Daily Cost: ₹${forecast.predictedDailyExpenseINR.toLocaleString()}

[RECOMMENDED ACTION FOR WARDEN]
${forecast.hoursUntilDry < 14 ? '⚠️ Order Water Tanker: Storage will run low in ' + forecast.hoursUntilDry + ' hours.' : '✓ Water supply is sufficient today.'}
${forecast.predictedPowerKW > 200 ? '⚠️ High Power Load: Advise students to switch off unnecessary room heaters.' : '✓ Electrical load is within safe limits.'}
💡 Mess Cook: Prepare food for exactly ${forecast.expectedDiners} students.`

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true)
      dispatch(pushToast({ message: 'Forecast summary copied to clipboard!', tone: 'ok' }))
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669' }}>
            <Activity size={14} /> Hostel Operations Forecaster
          </span>
          <h1>Hostel Daily Situation &amp; Needs Forecaster</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Plan electricity, water reserve, kitchen meals, and daily hostel costs in advance.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleResetDefaults}>
            <RotateCcw size={14} /> Reset
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleCopySummary}>
            {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
            {copied ? 'Summary Copied' : 'Copy Forecast'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handlePredictNeeds}
            disabled={isPredicting}
            style={{ fontWeight: 700 }}
          >
            <Sparkles size={14} className={isPredicting ? 'spin-slow' : ''} />
            {isPredicting ? 'Calculating...' : 'Predict Daily Needs'}
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: CONDITIONS VS PREDICTED REQUIREMENTS */}
      <div className="two-col" style={{ gridTemplateColumns: '1.2fr 1.4fr', gap: 20 }}>
        {/* LEFT COLUMN: HOSTEL TODAY'S CONDITIONS (INPUT CONTROLS) */}
        <div className="panel" style={{ background: 'var(--surface)', border: '1.5px solid var(--line)' }}>
          <div className="panel-head" style={{ marginBottom: 16 }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SlidersHorizontal size={18} color="var(--accent-border)" />
                Today's Hostel Conditions
              </h3>
              <p>Adjust student attendance, outside heat, and water supply to calculate needs</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Condition 1: Residents */}
            <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={15} color="#059669" />
                  Students Staying in Hostel
                </label>
                <span className="mono" style={{ fontSize: '0.92rem', fontWeight: 800, color: '#059669' }}>
                  {residents} Students ({Math.round((residents / 430) * 100)}% Full)
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={5}
                value={residents}
                onChange={(e) => setResidents(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#059669', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-faint)', marginTop: 4 }}>
                <span>Vacation (50)</span>
                <span>Normal Day (395)</span>
                <span>House Full (500)</span>
              </div>
            </div>

            {/* Condition 2: Ambient Temperature */}
            <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sun size={15} color="#DC2626" />
                  Outside Weather &amp; Temperature
                </label>
                <span
                  className="mono"
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: ambientTemp >= 38 ? '#DC2626' : ambientTemp >= 32 ? '#D97706' : '#059669',
                  }}
                >
                  {ambientTemp}°C · {ambientTemp >= 38 ? 'Extreme Heatwave' : ambientTemp >= 32 ? 'Warm Summer' : 'Pleasant / Cool'}
                </span>
              </div>
              <input
                type="range"
                min={22}
                max={44}
                step={1}
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#EF4444', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-faint)', marginTop: 4 }}>
                <span>Cool (22°C)</span>
                <span>Normal (30°C)</span>
                <span>Very Hot (44°C)</span>
              </div>
            </div>

            {/* Condition 3: Academic Schedule */}
            <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={15} color="#2563EB" />
                  College Schedule &amp; Exams
                </label>
                <span className="mono" style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2563EB' }}>
                  {examStressIndex >= 80 ? 'Final Exam Week (Late Night Study)' : examStressIndex >= 40 ? 'Mid-Term Tests' : 'Regular Class Days'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={examStressIndex}
                onChange={(e) => setExamStressIndex(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563EB', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-faint)', marginTop: 4 }}>
                <span>Regular Days</span>
                <span>Mid-Terms</span>
                <span>Final Exams (Night Owls)</span>
              </div>
            </div>

            {/* Condition 4: Municipal Water Inflow */}
            <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Droplets size={15} color="#0284C7" />
                  Water Supply Inflow (Town / Borewell)
                </label>
                <span className="mono" style={{ fontSize: '0.92rem', fontWeight: 800, color: municipalWaterInflow === 0 ? '#DC2626' : '#059669' }}>
                  {municipalWaterInflow.toLocaleString()} Litres {municipalWaterInflow === 0 ? '(Supply Cut!)' : '/ Day'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={60000}
                step={5000}
                value={municipalWaterInflow}
                onChange={(e) => setMunicipalWaterInflow(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0284C7', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-faint)', marginTop: 4 }}>
                <span>No Water (0 L)</span>
                <span>Normal Supply (25k L)</span>
                <span>Full Borewell (60k L)</span>
              </div>
            </div>

            {/* Condition 5: Mess Special Menu */}
            <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Utensils size={15} color="#D97706" />
                  Mess Menu &amp; Food Demand
                </label>
                <span className="mono" style={{ fontSize: '0.92rem', fontWeight: 800, color: '#D97706' }}>
                  {mealDemandFactor > 120 ? 'Special Sunday Feast / Biryani' : mealDemandFactor < 80 ? 'Holiday / Light Menu' : 'Regular Everyday Menu'}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={150}
                step={5}
                value={mealDemandFactor}
                onChange={(e) => setMealDemandFactor(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#F59E0B', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-faint)', marginTop: 4 }}>
                <span>Light Holiday</span>
                <span>Normal Menu</span>
                <span>Grand Feast / Sunday</span>
              </div>
            </div>

            {/* Condition 6: AC & Fan Usage */}
            <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={15} color="#7C3AED" />
                  Fans &amp; Cooler Usage Level
                </label>
                <span className="mono" style={{ fontSize: '0.92rem', fontWeight: 800, color: '#7C3AED' }}>
                  {coolingActiveRatio}% Usage
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={coolingActiveRatio}
                onChange={(e) => setCoolingActiveRatio(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#8B5CF6', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-faint)', marginTop: 4 }}>
                <span>Eco Mode (20%)</span>
                <span>Normal (60%)</span>
                <span>Peak Summer (100%)</span>
              </div>
            </div>

            {/* Big Predict Button */}
            <button
              className="btn btn-primary"
              style={{ padding: '12px', fontSize: '1rem', fontWeight: 700, justifyContent: 'center', marginTop: 4 }}
              onClick={handlePredictNeeds}
              disabled={isPredicting}
            >
              <Sparkles size={18} className={isPredicting ? 'spin-slow' : ''} />
              {isPredicting ? 'Updating Forecast...' : 'Predict Daily Needs'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: PREDICTED DAILY REQUIREMENTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 4 HIGHLIGHT CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Card 1: Peak Power */}
            <div className="card" style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Electricity Needed
                </span>
                <Zap size={18} color="#F59E0B" />
              </div>
              <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 6, color: 'var(--text-main)' }}>
                {forecast.predictedPowerKW} kW
              </div>
              <div style={{ fontSize: '0.78rem', color: forecast.predictedPowerKW > 200 ? '#DC2626' : '#059669', marginTop: 4, fontWeight: 600 }}>
                {forecast.predictedPowerKW > 200 ? '⚠️ High Load Expected' : '✓ Normal Safe Load'}
              </div>
            </div>

            {/* Card 2: Water Storage */}
            <div className="card" style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Water Storage Status
                </span>
                <Droplets size={18} color="#0284C7" />
              </div>
              <div
                className="mono"
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  marginTop: 6,
                  color: forecast.hoursUntilDry < 14 ? '#DC2626' : '#059669',
                }}
              >
                {forecast.hoursUntilDry >= 90 ? 'Continuous Reserve' : `${forecast.hoursUntilDry} Hours Left`}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Usage: {forecast.netWaterHourlyDrawdown.toLocaleString()} L/hour
              </div>
            </div>

            {/* Card 3: Food Mess */}
            <div className="card" style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Mess Meals to Cook
                </span>
                <Utensils size={18} color="#10B981" />
              </div>
              <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 6, color: 'var(--text-main)' }}>
                {forecast.expectedDiners} Plates
              </div>
              <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: 4, fontWeight: 600 }}>
                Low Waste Index ({forecast.wasteProbabilityPct}%)
              </div>
            </div>

            {/* Card 4: Daily Expenses */}
            <div className="card" style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Estimated Daily Cost
                </span>
                <DollarSign size={18} color="#059669" />
              </div>
              <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 6, color: 'var(--text-main)' }}>
                ₹{forecast.predictedDailyExpenseINR.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Power, water &amp; groceries combined
              </div>
            </div>
          </div>

          {/* 24-HOUR ELECTRICITY DEMAND VISUAL FORECAST */}
          <div className="panel" style={{ background: 'var(--surface)', border: '1.5px solid var(--line)', padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                  24-Hour Electricity Demand Forecast (kW)
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Normal average day vs. Today's expected power consumption
                </span>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                  <span style={{ width: 14, height: 2, background: '#9CA3AF' }} /> Average Day
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#059669', fontWeight: 700 }}>
                  <span style={{ width: 14, height: 3, background: '#10B981' }} /> Today's Forecast
                </span>
              </div>
            </div>

            {/* SVG Visual Graph */}
            <div style={{ width: '100%', height: 130, background: 'var(--surface-2)', borderRadius: 8, padding: '12px 10px 0 10px', position: 'relative' }}>
              <svg width="100%" height="100" viewBox="0 0 240 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="predGradWarden" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Average baseline line */}
                <path
                  d={forecast.hourlyCurve.reduce((acc, pt, i) => {
                    const x = (i / 23) * 240
                    const y = 80 - (pt.baselineKW / 250) * 75
                    return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`
                  }, '')}
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />

                {/* Area fill */}
                <path
                  d={
                    forecast.hourlyCurve.reduce((acc, pt, i) => {
                      const x = (i / 23) * 240
                      const y = 80 - (pt.simulatedKW / 250) * 75
                      return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`
                    }, '') + ' L 240 80 L 0 80 Z'
                  }
                  fill="url(#predGradWarden)"
                />

                {/* Today's forecast line */}
                <path
                  d={forecast.hourlyCurve.reduce((acc, pt, i) => {
                    const x = (i / 23) * 240
                    const y = 80 - (pt.simulatedKW / 250) * 75
                    return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`
                  }, '')}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                />
              </svg>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-faint)', marginTop: 2 }}>
                <span>00:00 (Night)</span>
                <span>08:00 (Morning Rush)</span>
                <span>14:00 (Afternoon Heat)</span>
                <span>20:00 (Dinner)</span>
                <span>23:00 (Study / Curfew)</span>
              </div>
            </div>
          </div>

          {/* WARDEN'S RECOMMENDED ACTIONS FOR TODAY */}
          <div className="panel" style={{ background: 'var(--surface)', border: '1.5px solid var(--line)', padding: 18 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
              <ShieldCheck size={18} color="#059669" />
              Warden's Checklist for Today
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {forecast.hoursUntilDry < 14 ? (
                <div style={{ fontSize: '0.85rem', color: '#DC2626', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8, borderLeft: '4px solid #DC2626' }}>
                  ⚠️ <strong>Order Water Tanker:</strong> Storage will drop below 20% in {forecast.hoursUntilDry} hours. Call the municipal tanker vendor before 2:00 PM.
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#059669', background: '#ECFDF5', padding: '8px 12px', borderRadius: 8, borderLeft: '4px solid #10B981' }}>
                  ✓ <strong>Water Reserve is Safe:</strong> Inflow from town supply is sufficient for all {residents} residents.
                </div>
              )}

              {forecast.predictedPowerKW > 200 ? (
                <div style={{ fontSize: '0.85rem', color: '#D97706', background: '#FFFBEB', padding: '8px 12px', borderRadius: 8, borderLeft: '4px solid #F59E0B' }}>
                  ⚠️ <strong>High Electricity Load:</strong> Peak power will reach {forecast.predictedPowerKW} kW. Advise students to switch off unused room heaters to prevent circuit tripping.
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#059669', background: '#ECFDF5', padding: '8px 12px', borderRadius: 8, borderLeft: '4px solid #10B981' }}>
                  ✓ <strong>Power Grid is Optimal:</strong> Electricity load is safely within hostel transformer limits.
                </div>
              )}

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 8, borderLeft: '4px solid #6B7280' }}>
                💡 <strong>Kitchen Head Count:</strong> Tell the mess cook to prepare food for <strong>{forecast.expectedDiners} students</strong> to prevent food waste.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
