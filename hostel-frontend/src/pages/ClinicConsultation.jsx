import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Stethoscope, UserCheck, Clock, AlertCircle, Plus, CheckCircle2,
  FileText, Receipt, Printer, Trash2, HeartPulse, ShieldCheck,
  Search, ArrowRight, Activity, UserPlus, X,
} from 'lucide-react'
import {
  selectDoctorStatus,
  selectLastCheckIn,
  selectWaitingQueue,
  selectCompletedConsultations,
  setDoctorStatus,
  checkInDoctor,
  addWaitingStudent,
  removeWaitingStudent,
  completeConsultation,
} from '../store/slices/clinicSlice'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import { pushToast } from '../store/slices/uiSlice'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import './ClinicConsultation.css'

const COMMON_DIAGNOSES = [
  'Acute Tension Migraine',
  'Seasonal Viral Rhinitis & Pharyngitis',
  'Ankle Ligament Sprain & Edema',
  'Acute Gastroenteritis & Dehydration',
  'Allergic Dermatitis & Urticaria',
  'Tension Headache & Mental Fatigue',
]

const QUICK_MEDICINES = [
  { name: 'Tab. Paracetamol 650mg', dosage: '1 Tablet', frequency: '1-0-1 (After food if fever)', duration: '3 Days', instructions: 'Take with full glass of water' },
  { name: 'Tab. Levocetirizine 5mg', dosage: '1 Tablet', frequency: '0-0-1 (Night)', duration: '5 Days', instructions: 'Take post dinner' },
  { name: 'Cap. Pantoprazole 40mg', dosage: '1 Capsule', frequency: '1-0-0 (Empty stomach)', duration: '5 Days', instructions: 'Take 30 mins before breakfast' },
  { name: 'Electral ORS Sachet', dosage: '1 Sachet', frequency: 'Twice daily in 1L water', duration: '2 Days', instructions: 'Sip throughout the day for hydration' },
  { name: 'Volini Fast Relief Gel', dosage: 'Apply thin layer', frequency: 'Twice daily', duration: '4 Days', instructions: 'Gently apply over affected sprain without hard massage' },
  { name: 'Cough Syrup (Ascoril D+)', dosage: '10 ml', frequency: '1-1-1 (Post meals)', duration: '4 Days', instructions: 'Do not drink cold water after consumption' },
]

export default function ClinicConsultation() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)

  const doctorStatus = useSelector(selectDoctorStatus)
  const lastCheckIn = useSelector(selectLastCheckIn)
  const waitingQueue = useSelector(selectWaitingQueue)
  const completedConsultations = useSelector(selectCompletedConsultations)

  const [activeTab, setActiveTab] = useState('queue') // 'queue' | 'history'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('ALL') // 'ALL' | 'Urgent' | 'Normal'

  // Consultation Modal State
  const [consultingStudent, setConsultingStudent] = useState(null)
  const [consultationForm, setConsultationForm] = useState({
    diagnosis: '',
    medicines: [
      { name: 'Tab. Paracetamol 650mg', dosage: '1 Tablet', frequency: '1-0-1 (After food)', duration: '3 Days', instructions: 'Take with warm water' },
    ],
    advice: 'Drink plenty of warm water, take proper rest, and avoid screen time.',
    restDays: 'None (Fit for classes)',
  })

  // Document Viewer Modal State (Prescription Rx / Receipt)
  const [viewingDoc, setViewingDoc] = useState(null)
  const [docViewMode, setDocViewMode] = useState('rx') // 'rx' | 'receipt'

  // Walk-in Registration Modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [walkInForm, setWalkInForm] = useState({
    studentName: '',
    rollNo: '',
    roomNumber: '',
    department: 'B.E. CSE - II Year',
    symptoms: '',
    priority: 'Normal',
  })

  // Status Handlers
  const handleCheckInAsAvailable = () => {
    dispatch(checkInDoctor())
    dispatch(pushToast({ message: 'Checked In: Doctor is now marked Available in Hostel Clinic!', tone: 'ok' }))
  }

  const handleStatusChange = (newStatus) => {
    dispatch(setDoctorStatus(newStatus))
    dispatch(pushToast({ message: `Clinic status updated to: ${newStatus}`, tone: 'info' }))
  }

  // Consultation Flow
  const handleStartConsultation = (student) => {
    setConsultingStudent(student)
    setConsultationForm({
      diagnosis: student.symptoms.includes('migraine')
        ? 'Acute Tension Migraine'
        : student.symptoms.includes('sprain')
        ? 'Ankle Ligament Sprain & Edema'
        : student.symptoms.includes('cough') || student.symptoms.includes('fever')
        ? 'Seasonal Viral Rhinitis & Pharyngitis'
        : 'General Malaise & Fatigue',
      medicines: student.symptoms.includes('migraine')
        ? [
            { name: 'Tab. Paracetamol 650mg', dosage: '1 Tablet', frequency: '1-0-1 (After food)', duration: '3 Days', instructions: 'Take with warm water' },
            { name: 'Tab. Domperidone 10mg', dosage: '1 Tablet', frequency: '1-0-0 (Before meal)', duration: '2 Days', instructions: 'For nausea relief' },
          ]
        : student.symptoms.includes('sprain')
        ? [
            { name: 'Volini Pain Relief Gel', dosage: 'Local application', frequency: 'Twice daily', duration: '5 Days', instructions: 'Apply gently without rubbing' },
            { name: 'Tab. Ibuprofen + Paracetamol', dosage: '1 Tablet', frequency: '1-0-1 (Post meal)', duration: '3 Days', instructions: 'Do not take on empty stomach' },
            { name: 'Crepe Bandage (10cm)', dosage: '1 Roll', frequency: 'Support wear', duration: '5 Days', instructions: 'Keep ankle elevated' },
          ]
        : [
            { name: 'Tab. Paracetamol 650mg', dosage: '1 Tablet', frequency: '1-0-1 (After food)', duration: '3 Days', instructions: 'Take with warm water' },
            { name: 'Tab. Levocetirizine 5mg', dosage: '1 Tablet', frequency: '0-0-1 (Night)', duration: '5 Days', instructions: 'Take post dinner' },
          ],
      advice: 'Ensure adequate oral hydration (2.5 - 3 Litres). Maintain a light home-cooked diet and avoid cold beverages.',
      restDays: student.priority === 'Urgent' ? '2 Days Hostel Bed Rest' : '1 Day Hostel Bed Rest',
    })
  }

  const handleAddMedicine = () => {
    setConsultationForm((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { name: '', dosage: '1 Tablet', frequency: '1-0-1 (After food)', duration: '3 Days', instructions: 'Take post meals' },
      ],
    }))
  }

  const handleQuickAddMedicine = (med) => {
    setConsultationForm((prev) => ({
      ...prev,
      medicines: [...prev.medicines, med],
    }))
    dispatch(pushToast({ message: `Added ${med.name} to prescription`, tone: 'info' }))
  }

  const handleRemoveMedicine = (idx) => {
    setConsultationForm((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== idx),
    }))
  }

  const handleUpdateMedicine = (idx, field, value) => {
    setConsultationForm((prev) => {
      const updated = [...prev.medicines]
      updated[idx] = { ...updated[idx], [field]: value }
      return { ...prev, medicines: updated }
    })
  }

  const handleSignAndIssue = () => {
    if (!consultingStudent) return
    if (!consultationForm.diagnosis.trim()) {
      dispatch(pushToast({ message: 'Please enter a diagnosis before issuing prescription', tone: 'bad' }))
      return
    }

    const consultationPayload = {
      token: consultingStudent.token,
      studentName: consultingStudent.studentName,
      rollNo: consultingStudent.rollNo,
      roomNumber: consultingStudent.roomNumber,
      department: consultingStudent.department,
      diagnosis: consultationForm.diagnosis,
      medicines: consultationForm.medicines,
      advice: consultationForm.advice,
      restDays: consultationForm.restDays,
    }

    dispatch(
      completeConsultation({
        waitingId: consultingStudent.id,
        consultationData: consultationPayload,
      })
    )

    dispatch(
      pushToast({
        message: `Prescription & Consultation Receipt issued for ${consultingStudent.studentName}!`,
        tone: 'ok',
      })
    )

    // Open receipt/prescription viewer modal automatically for review & print
    setViewingDoc({
      ...consultationPayload,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      doctorName: 'Dr. Madhu, M.B.B.S., M.D.',
      doctorReg: 'TN-MC-84291',
      receiptNo: `REC-MED-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      consultationFee: '₹0.00',
      feeStatus: 'Covered under Institutional Student Health Scheme',
      dispensationStatus: 'Dispensed at Hostel Infirmary Bay',
    })
    setDocViewMode('rx')
    setConsultingStudent(null)
  }

  const handleRegisterWalkIn = (e) => {
    e.preventDefault()
    if (!walkInForm.studentName || !walkInForm.rollNo) {
      dispatch(pushToast({ message: 'Please provide student name and roll number', tone: 'bad' }))
      return
    }

    dispatch(addWaitingStudent(walkInForm))
    dispatch(pushToast({ message: `Student ${walkInForm.studentName} added to OPD waiting queue!`, tone: 'ok' }))
    setIsRegisterOpen(false)
    setWalkInForm({
      studentName: '',
      rollNo: '',
      roomNumber: '',
      department: 'B.E. CSE - II Year',
      symptoms: '',
      priority: 'Normal',
    })
  }

  // Filtered lists
  const filteredQueue = waitingQueue.filter((s) => {
    const matchQuery =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.symptoms.toLowerCase().includes(searchQuery.toLowerCase())
    const matchPriority = filterPriority === 'ALL' || s.priority === filterPriority
    return matchQuery && matchPriority
  })

  const filteredHistory = completedConsultations.filter((c) => {
    return (
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="page clinic-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669' }}>
            <Stethoscope size={14} /> Vidudhi Campus Health Center &amp; Infirmary
          </span>
          <h1>Hostel Clinic &amp; Prescriptions Desk</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => setIsRegisterOpen(true)}>
            <UserPlus size={15} /> Register Walk-In Student
          </button>
          {role === 'doctor' && doctorStatus !== 'Available in Hostel Clinic' && (
            <button className="btn btn-primary" onClick={handleCheckInAsAvailable}>
              <UserCheck size={15} /> Check In as Available
            </button>
          )}
        </div>
      </div>

      {/* Doctor Availability & Check-In Widget */}
      <div className="clinic-duty-banner">
        <div className="duty-left">
          <div className="duty-avatar">
            <Stethoscope size={26} />
          </div>
          <div className="duty-details">
            <h3>
              <span>Dr. Madhu, M.B.B.S., M.D.</span>
              <span
                className={`pulse-dot ${
                  doctorStatus === 'Available in Hostel Clinic'
                    ? ''
                    : doctorStatus === 'On Emergency Ward Rounds'
                    ? 'rounds'
                    : 'off'
                }`}
              />
            </h3>
            <p>
              Campus Medical Officer (Reg #TN-MC-84291) ·{' '}
              <strong style={{ color: doctorStatus === 'Available in Hostel Clinic' ? '#059669' : '#D97706' }}>
                {doctorStatus}
              </strong>{' '}
              · <em>{lastCheckIn}</em>
            </p>
          </div>
        </div>

        {/* Action Controls: Doctor can change status, others see read-only badge */}
        <div className="duty-controls">
          <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', fontWeight: 600 }}>Doctor Status:</span>
          {role === 'doctor' ? (
            <>
              <button
                type="button"
                className={`status-btn ${doctorStatus === 'Available in Hostel Clinic' ? 'active-available' : ''}`}
                onClick={() => handleStatusChange('Available in Hostel Clinic')}
              >
                <CheckCircle2 size={13} color="#10B981" /> Available in Hostel Clinic
              </button>
              <button
                type="button"
                className={`status-btn ${doctorStatus === 'On Emergency Ward Rounds' ? 'active-rounds' : ''}`}
                onClick={() => handleStatusChange('On Emergency Ward Rounds')}
              >
                <Activity size={13} color="#F59E0B" /> On Emergency Rounds
              </button>
              <button
                type="button"
                className={`status-btn ${doctorStatus === 'Off Duty' ? 'active-off' : ''}`}
                onClick={() => handleStatusChange('Off Duty')}
              >
                Off Duty
              </button>
            </>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 600,
                background: doctorStatus === 'Available in Hostel Clinic' ? '#ECFDF5' : '#FFFBEB',
                color: doctorStatus === 'Available in Hostel Clinic' ? '#059669' : '#D97706',
                border: `1px solid ${doctorStatus === 'Available in Hostel Clinic' ? '#10B981' : '#F59E0B'}`,
              }}
            >
              {doctorStatus === 'Available in Hostel Clinic' ? <CheckCircle2 size={13} color="#10B981" /> : <Activity size={13} color="#F59E0B" />}
              {doctorStatus} (Managed by Dr. Madhu)
            </span>
          )}
        </div>
      </div>

      {/* Clinic Stats Row */}
      <div className="clinic-stats-row">
        <div className="clinic-stat-box">
          <div className="clinic-stat-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="clinic-stat-val" style={{ color: '#059669' }}>{waitingQueue.length} Students</div>
            <div className="clinic-stat-label">Waiting for Appointment (Live OPD)</div>
          </div>
        </div>

        <div className="clinic-stat-box">
          <div className="clinic-stat-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <FileText size={22} />
          </div>
          <div>
            <div className="clinic-stat-val" style={{ color: '#2563EB' }}>{completedConsultations.length} Issued</div>
            <div className="clinic-stat-label">Prescriptions &amp; Receipts Today</div>
          </div>
        </div>

        <div className="clinic-stat-box">
          <div className="clinic-stat-icon" style={{ background: '#FFFBEB', color: '#D97706' }}>
            <HeartPulse size={22} />
          </div>
          <div>
            <div className="clinic-stat-val" style={{ color: '#D97706' }}>2 / 10 Beds</div>
            <div className="clinic-stat-label">Hostel Infirmary Bed Occupancy</div>
          </div>
        </div>

        <div className="clinic-stat-box">
          <div className="clinic-stat-icon" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="clinic-stat-val" style={{ color: '#7C3AED' }}>Standby</div>
            <div className="clinic-stat-label">Paramedic &amp; Ambulance (Gate 1)</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="clinic-nav-tabs">
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'queue' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('queue')}
        >
          <Clock size={14} /> Students Waiting for Appointment ({waitingQueue.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('history')}
        >
          <Receipt size={14} /> Consultation Prescriptions &amp; Receipts ({completedConsultations.length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Search by student name, roll no, room, or symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === 'queue' && (
          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'Urgent', 'Normal'].map((p) => (
              <button
                key={p}
                type="button"
                className={`btn btn-xs ${filterPriority === p ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilterPriority(p)}
              >
                {p === 'ALL' ? 'All Priorities' : p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: LIVE OPD WAITING QUEUE */}
      {activeTab === 'queue' && (
        <>
          {filteredQueue.length === 0 ? (
            <div className="card" style={{ padding: 36, textAlign: 'center' }}>
              <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: 0 }}>No Students Currently Waiting</h3>
              <p style={{ color: 'var(--ink-soft)', margin: '6px 0 16px' }}>
                The OPD appointment waiting room is clear. Walk-in residents can be registered anytime.
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => setIsRegisterOpen(true)}>
                <UserPlus size={14} /> Register Walk-In Student
              </button>
            </div>
          ) : (
            <div className="queue-grid">
              {filteredQueue.map((student) => (
                <div key={student.id} className={`queue-card ${student.priority === 'Urgent' ? 'priority-urgent' : ''}`}>
                  <div className="queue-card-top">
                    <div>
                      <h4 className="queue-student-name">{student.studentName}</h4>
                      <div className="queue-student-meta">
                        {student.rollNo} · Room <strong>{student.roomNumber}</strong> · {student.department}
                      </div>
                    </div>
                    <span className={`token-pill ${student.priority === 'Urgent' ? 'urgent' : ''}`}>
                      {student.token}
                    </span>
                  </div>

                  <div className={`queue-symptoms-box ${student.priority === 'Urgent' ? 'urgent' : ''}`}>
                    <strong>Reported Symptoms:</strong>
                    <div style={{ marginTop: 2 }}>{student.symptoms}</div>
                  </div>



                  <div className="queue-actions">
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> Arrived: {student.arrivedAt}
                    </span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {role === 'doctor' && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          style={{ color: '#DC2626' }}
                          title="Remove from queue"
                          onClick={() => {
                            dispatch(removeWaitingStudent(student.id))
                            dispatch(pushToast({ message: `${student.studentName} removed from waiting queue`, tone: 'warn' }))
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                      {role === 'doctor' ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStartConsultation(student)}
                        >
                          <Stethoscope size={14} /> Consult &amp; Prescribe
                        </button>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: 'var(--ink-soft)',
                            background: 'var(--surface-2)',
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid var(--line)',
                          }}
                        >
                          Awaiting Dr. Madhu
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: COMPLETED PRESCRIPTIONS & RECEIPTS HISTORY */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredHistory.length === 0 ? (
            <div className="card" style={{ padding: 36, textAlign: 'center' }}>
              <FileText size={36} color="var(--ink-faint)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: 0 }}>No Consultation Records Found</h3>
              <p style={{ color: 'var(--ink-soft)', margin: '6px 0' }}>
                Completed consultations, medical prescriptions, and dispensary receipts will appear here.
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div key={item.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <strong style={{ fontSize: '1.05rem' }}>{item.studentName}</strong>
                      <span className="token-pill">{item.token}</span>
                      <Badge tone="ok">Consultation Completed</Badge>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', marginTop: 4 }}>
                      Roll: {item.rollNo} · Room: <strong>{item.roomNumber}</strong> · {item.department}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ink)', marginTop: 6 }}>
                      <strong>Diagnosis:</strong> <span style={{ color: '#059669', fontWeight: 600 }}>{item.diagnosis}</span>
                      {item.restDays && item.restDays !== 'None (Fit for classes)' && (
                        <span style={{ marginLeft: 10, color: '#2563EB', fontWeight: 600 }}>
                          ({item.restDays})
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', marginTop: 4 }}>
                      Issued on {item.date} at {item.time} · Receipt Ref: <strong className="mono">{item.receiptNo}</strong> · Fee: {item.consultationFee} (Covered)
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setViewingDoc(item)
                        setDocViewMode('rx')
                      }}
                    >
                      <FileText size={14} color="#059669" /> View Prescription (Rx)
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setViewingDoc(item)
                        setDocViewMode('receipt')
                      }}
                    >
                      <Receipt size={14} color="#2563EB" /> View Receipt
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL 1: CONSULTATION & PRESCRIPTION ISSUANCE */}
      {consultingStudent && (
        <Modal
          title={`Clinical Consultation — ${consultingStudent.studentName}`}
          subtitle={`Token: ${consultingStudent.token} · Room: ${consultingStudent.roomNumber} · Roll: ${consultingStudent.rollNo}`}
          onClose={() => setConsultingStudent(null)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                Zero Out-of-Pocket Fee: Covered by Institutional Health Welfare
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setConsultingStudent(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSignAndIssue}>
                  <CheckCircle2 size={16} /> Sign &amp; Issue Rx &amp; Receipt
                </button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Symptoms Summary Card */}
            <div style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 10, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', textTransform: 'uppercase', fontWeight: 600 }}>Reported Symptoms</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{consultingStudent.symptoms}</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                <em>Clinical physical examination conducted by Dr. Madhu</em>
              </div>
            </div>

            {/* Diagnosis Input & Presets */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                Clinical Diagnosis / Impression *
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Acute Tension Migraine, Viral Bronchitis..."
                value={consultationForm.diagnosis}
                onChange={(e) => setConsultationForm({ ...consultationForm, diagnosis: e.target.value })}
              />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', alignSelf: 'center' }}>Quick Presets:</span>
                {COMMON_DIAGNOSES.map((diag) => (
                  <button
                    key={diag}
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => setConsultationForm({ ...consultationForm, diagnosis: diag })}
                  >
                    + {diag}
                  </button>
                ))}
              </div>
            </div>

            {/* Prescribed Medications Section */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                  Rx: Prescribed Medicines ({consultationForm.medicines.length})
                </label>
                <button type="button" className="btn btn-secondary btn-xs" onClick={handleAddMedicine}>
                  <Plus size={12} /> Add Custom Medicine
                </button>
              </div>

              {/* Quick Medication Chips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', alignSelf: 'center' }}>Hostel Dispensary Stock:</span>
                {QUICK_MEDICINES.map((qm) => (
                  <button
                    key={qm.name}
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleQuickAddMedicine(qm)}
                  >
                    + {qm.name}
                  </button>
                ))}
              </div>

              {/* Medicines Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {consultationForm.medicines.map((med, idx) => (
                  <div key={idx} className="card" style={{ padding: 10, background: 'var(--surface)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1fr auto', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        className="input input-sm"
                        placeholder="Medicine Name (e.g. Tab. Paracetamol)"
                        value={med.name}
                        onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        className="input input-sm"
                        placeholder="Dose (e.g. 650mg)"
                        value={med.dosage}
                        onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                      />
                      <input
                        type="text"
                        className="input input-sm"
                        placeholder="Freq (e.g. 1-0-1)"
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                      />
                      <input
                        type="text"
                        className="input input-sm"
                        placeholder="Duration (e.g. 3 Days)"
                        value={med.duration}
                        onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ color: '#DC2626' }}
                        onClick={() => handleRemoveMedicine(idx)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <input
                      type="text"
                      className="input input-sm"
                      style={{ marginTop: 6 }}
                      placeholder="Special instructions (e.g. Take after meal with warm water)"
                      value={med.instructions}
                      onChange={(e) => handleUpdateMedicine(idx, 'instructions', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Advice & Bed Rest Notice */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Dietary &amp; Clinical Care Advice
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={consultationForm.advice}
                  onChange={(e) => setConsultationForm({ ...consultationForm, advice: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Hostel Bed Rest Authorization
                </label>
                <select
                  className="input"
                  value={consultationForm.restDays}
                  onChange={(e) => setConsultationForm({ ...consultationForm, restDays: e.target.value })}
                >
                  <option value="None (Fit for classes)">None (Fit for classes)</option>
                  <option value="1 Day Hostel Bed Rest">1 Day Hostel Bed Rest</option>
                  <option value="2 Days Hostel Bed Rest">2 Days Hostel Bed Rest</option>
                  <option value="3 Days Infirmary Care & Rest">3 Days Infirmary Care &amp; Rest</option>
                </select>
                <p style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: 4 }}>
                  Bed rest authorization automatically syncs with Warden leave &amp; attendance desk.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: OFFICIAL DIGITAL PRESCRIPTION & RECEIPT VIEWER */}
      {viewingDoc && (
        <Modal
          title={docViewMode === 'rx' ? 'Official Digital Medical Prescription (Rx)' : 'Medical Consultation & Dispensary Receipt'}
          subtitle={`Patient: ${viewingDoc.studentName} (${viewingDoc.rollNo}) · Room ${viewingDoc.roomNumber}`}
          onClose={() => setViewingDoc(null)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${docViewMode === 'rx' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setDocViewMode('rx')}
                >
                  <FileText size={14} /> Prescription (Rx)
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${docViewMode === 'receipt' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setDocViewMode('receipt')}
                >
                  <Receipt size={14} /> Medical Receipt
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
                  <Printer size={15} /> Print / Save Document
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setViewingDoc(null)}>
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="rx-printable-area">
            {docViewMode === 'rx' ? (
              /* DIGITAL PRESCRIPTION (Rx) SHEET */
              <div className="rx-document-paper">
                <div className="rx-letterhead">
                  <div>
                    <h2 className="rx-clinic-title">VIDUDHI CAMPUS HEALTH CENTER</h2>
                    <p className="rx-clinic-sub">
                      National Engineering College Residential Infirmary &amp; OPD
                    </p>
                    <p className="rx-clinic-sub">
                      Emergency Intercom: 108 / Ext: 442 · Campus Health Ward B
                    </p>
                  </div>
                  <div className="rx-doctor-info">
                    <h4 className="rx-doctor-name">{viewingDoc.doctorName || 'Dr. Madhu, M.B.B.S., M.D.'}</h4>
                    <p className="rx-doctor-reg">Reg: {viewingDoc.doctorReg || 'TN-MC-84291'}</p>
                    <p className="rx-doctor-reg">Chief Medical Officer</p>
                  </div>
                </div>

                <div className="rx-patient-bar">
                  <div className="rx-patient-field">
                    <span>Patient Name</span>
                    <strong>{viewingDoc.studentName}</strong>
                  </div>
                  <div className="rx-patient-field">
                    <span>Roll No / ID</span>
                    <strong>{viewingDoc.rollNo}</strong>
                  </div>
                  <div className="rx-patient-field">
                    <span>Hostel Room</span>
                    <strong>Room {viewingDoc.roomNumber}</strong>
                  </div>
                  <div className="rx-patient-field">
                    <span>Date &amp; Time</span>
                    <strong>{viewingDoc.date} {viewingDoc.time}</strong>
                  </div>
                </div>



                <div className="rx-diagnosis-banner">
                  <strong style={{ color: '#065F46', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Clinical Diagnosis:</strong>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginTop: 2 }}>
                    {viewingDoc.diagnosis}
                  </div>
                </div>

                <div className="rx-symbol">&#8478;</div>

                <table className="rx-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Medication &amp; Strength</th>
                      <th style={{ width: '15%' }}>Dosage</th>
                      <th style={{ width: '25%' }}>Frequency</th>
                      <th style={{ width: '20%' }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingDoc.medicines && viewingDoc.medicines.map((m, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{m.name}</strong>
                          {m.instructions && (
                            <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: 2 }}>
                              {m.instructions}
                            </div>
                          )}
                        </td>
                        <td>{m.dosage}</td>
                        <td><span style={{ fontWeight: 600, color: '#047857' }}>{m.frequency}</span></td>
                        <td>{m.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {viewingDoc.advice && (
                  <div className="rx-advice-box">
                    <strong style={{ color: '#92400E', fontSize: '0.85rem' }}>Physician Care Advice:</strong>
                    <div style={{ marginTop: 2 }}>{viewingDoc.advice}</div>
                  </div>
                )}

                {viewingDoc.restDays && viewingDoc.restDays !== 'None (Fit for classes)' && (
                  <div className="rx-rest-box">
                    <ShieldCheck size={18} />
                    <div>
                      <strong>Medical Rest Certificate:</strong> {viewingDoc.restDays} recommended for medical convalescence. Excused from academic attendance.
                    </div>
                  </div>
                )}

                <div className="rx-footer-signatures">
                  <div className="rx-seal">
                    <span>Vidudhi</span>
                    <span>Health Clinic</span>
                    <span>Authorized</span>
                    <span>OPD Stamp</span>
                  </div>
                  <div className="rx-signature">
                    <div className="rx-signature-img">Dr. Madhu</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Authorized Medical Officer</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Digitally Signed &amp; Timestamped</div>
                  </div>
                </div>
              </div>
            ) : (
              /* OFFICIAL CONSULTATION & MEDICAL FEE RECEIPT */
              <div className="rx-document-paper">
                <div className="receipt-header">
                  <div>
                    <h2 className="receipt-title">VIDUDHI CAMPUS MEDICAL RECEIPT</h2>
                    <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#4B5563' }}>
                      National Engineering College Health Welfare Fund · Tax-Exempt Institutional Healthcare
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Receipt Reference</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace', color: '#1D4ED8' }}>
                      {viewingDoc.receiptNo}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#4B5563' }}>{viewingDoc.date}</div>
                  </div>
                </div>

                <div className="rx-patient-bar">
                  <div className="rx-patient-field">
                    <span>Billed To Resident</span>
                    <strong>{viewingDoc.studentName}</strong>
                  </div>
                  <div className="rx-patient-field">
                    <span>Roll Number</span>
                    <strong>{viewingDoc.rollNo}</strong>
                  </div>
                  <div className="rx-patient-field">
                    <span>Room &amp; Wing</span>
                    <strong>Room {viewingDoc.roomNumber}</strong>
                  </div>
                  <div className="rx-patient-field">
                    <span>Consulting Doctor</span>
                    <strong>{viewingDoc.doctorName}</strong>
                  </div>
                </div>

                <table className="receipt-table">
                  <thead>
                    <tr>
                      <th>Service Description</th>
                      <th>Coverage Plan</th>
                      <th style={{ textAlign: 'right' }}>Standard Fee</th>
                      <th style={{ textAlign: 'right' }}>Institutional Subsidy</th>
                      <th style={{ textAlign: 'right' }}>Net Resident Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>General OPD Physician Clinical Examination &amp; Consultation</strong>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Physician Consultation &amp; Digital Rx</div>
                      </td>
                      <td>Student Health Fund</td>
                      <td style={{ textAlign: 'right' }}>₹250.00</td>
                      <td style={{ textAlign: 'right', color: '#059669' }}>- ₹250.00</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹0.00</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Dispensary Pharmacy &amp; Generic Medications</strong>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          {viewingDoc.medicines ? viewingDoc.medicines.map((m) => m.name).join(', ') : 'Oral therapy'}
                        </div>
                      </td>
                      <td>Institutional Formulary</td>
                      <td style={{ textAlign: 'right' }}>₹180.00</td>
                      <td style={{ textAlign: 'right', color: '#059669' }}>- ₹180.00</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹0.00</td>
                    </tr>
                  </tbody>
                </table>

                <div className="receipt-total-row">
                  <div>
                    <span>Total Amount Payable by Resident:</span>
                    <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#15803D' }}>
                      100% Comprehensive Coverage · Zero Out-of-Pocket Cost
                    </div>
                  </div>
                  <div style={{ fontSize: '1.25rem' }}>₹0.00 (PAID / COVERED)</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px dashed #D1D5DB' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    <div><strong>Dispensation Status:</strong> {viewingDoc.dispensationStatus}</div>
                    <div><strong>Payment Method:</strong> Student Medical Care Fund (Pre-Authorized)</div>
                  </div>
                  <div className="rx-seal" style={{ borderColor: '#2563EB', color: '#2563EB', transform: 'rotate(0deg)' }}>
                    <span>PAID</span>
                    <span>100% COVERED</span>
                    <span>VIDUDHI</span>
                    <span>HEALTH CARE</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL 3: REGISTER WALK-IN STUDENT */}
      {isRegisterOpen && (
        <Modal
          title="Register Walk-In Patient for Clinic OPD"
          subtitle="Add resident student to the active waiting queue for doctor consultation"
          onClose={() => setIsRegisterOpen(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setIsRegisterOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleRegisterWalkIn}>
                <UserPlus size={15} /> Add to Waiting Queue
              </button>
            </div>
          }
        >
          <form onSubmit={handleRegisterWalkIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Student Full Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Keerthana G."
                  value={walkInForm.studentName}
                  onChange={(e) => setWalkInForm({ ...walkInForm, studentName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Roll Number *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. 24104030"
                  value={walkInForm.rollNo}
                  onChange={(e) => setWalkInForm({ ...walkInForm, rollNo: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Hostel Room Number *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. B-37"
                  value={walkInForm.roomNumber}
                  onChange={(e) => setWalkInForm({ ...walkInForm, roomNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Triage Priority</label>
                <select
                  className="input"
                  value={walkInForm.priority}
                  onChange={(e) => setWalkInForm({ ...walkInForm, priority: e.target.value })}
                >
                  <option value="Normal">Normal (Standard OPD)</option>
                  <option value="Urgent">Urgent (Severe Pain / High Fever / Sprain)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Chief Symptoms / Complaints *</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Describe current symptoms (e.g. Acute migraine, vomiting sensation, feverish chills)..."
                value={walkInForm.symptoms}
                onChange={(e) => setWalkInForm({ ...walkInForm, symptoms: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: 4 }}>
                Common Symptoms (Quick Add):
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  'Headache & Migraine',
                  'Fever & Chills',
                  'Severe Cough & Cold',
                  'Stomach Pain & Cramps',
                  'Ankle Ligament Sprain',
                  'Vomiting & Nausea',
                  'Eye Strain / Redness',
                  'Physical Fatigue',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="btn btn-ghost btn-xs"
                    style={{
                      border: '1px solid var(--line)',
                      fontSize: '0.75rem',
                      padding: '3px 8px',
                      background: 'var(--surface-2)',
                    }}
                    onClick={() => {
                      const current = walkInForm.symptoms.trim()
                      setWalkInForm({
                        ...walkInForm,
                        symptoms: current ? `${current}, ${chip}` : chip,
                      })
                    }}
                  >
                    + {chip}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: 8 }}>
                Note: Blood pressure, pulse rate, temperature and SpO2 are assessed directly by Dr. Madhu inside the examination room.
              </p>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
