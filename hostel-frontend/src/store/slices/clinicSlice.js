import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'vidudhi_clinic_state'

const defaultWaitingQueue = [
  {
    id: 'OPD-101',
    token: '#OPD-101',
    studentName: 'Keerthana G.',
    rollNo: '24104030',
    roomNumber: 'B-37',
    department: 'B.E. CSE - III Year',
    symptoms: 'Acute frontal throbbing migraine headache, eye strain & mild nausea after laboratory exam',
    priority: 'Normal',
    arrivedAt: '10 mins ago',
    status: 'Waiting',
  },
  {
    id: 'OPD-102',
    token: '#OPD-102',
    studentName: 'Deepika A.',
    rollNo: '23104092',
    roomNumber: 'C-102',
    department: 'B.E. ECE - III Year',
    symptoms: 'Left ankle twist sustained during evening sports; localized swelling & tenderness',
    priority: 'Urgent',
    arrivedAt: '18 mins ago',
    status: 'Waiting',
  },
  {
    id: 'OPD-103',
    token: '#OPD-103',
    studentName: 'Vidhya K.',
    rollNo: '24104088',
    roomNumber: 'B-202',
    department: 'B.Tech IT - II Year',
    symptoms: 'Seasonal throat irritation, dry cough and mild body ache',
    priority: 'Normal',
    arrivedAt: '25 mins ago',
    status: 'Waiting',
  },
]

const defaultCompletedConsultations = [
  {
    id: 'CONS-901',
    token: '#OPD-098',
    date: '2026-09-21',
    time: '08:45 AM',
    studentName: 'Ananya R.',
    rollNo: '24104019',
    roomNumber: 'A-203',
    department: 'B.E. CSE - II Year',
    diagnosis: 'Acute Allergic Rhinitis & Upper Pharyngitis',
    medicines: [
      {
        name: 'Tab. Levocetirizine 5mg',
        dosage: '1 Tablet',
        frequency: '0-0-1 (Night)',
        duration: '5 Days',
        instructions: 'Take post dinner with warm water',
      },
      {
        name: 'Steam Inhalation (Karvol Plus)',
        dosage: '1 Capsule',
        frequency: 'Twice daily',
        duration: '3 Days',
        instructions: 'Inhale vapors with steaming hot water',
      },
      {
        name: 'Vitamin C 500mg Chewable',
        dosage: '1 Tablet',
        frequency: '1-0-0 (Morning)',
        duration: '5 Days',
        instructions: 'Chew after breakfast',
      },
    ],
    advice: 'Drink 3 liters of warm water daily. Avoid air conditioning exposure and chilled beverages. Rest well.',
    restDays: '1 Day Bed Rest (Room A-203)',
    doctorName: 'Dr. Madhu, M.B.B.S., M.D.',
    doctorReg: 'TN-MC-84291',
    receiptNo: 'REC-MED-2026-0841',
    consultationFee: '₹0.00',
    feeStatus: 'Covered under Institutional Student Health Scheme',
    dispensationStatus: 'Dispensed at Hostel Infirmary Bay',
  },
]

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        doctorStatus: parsed.doctorStatus || 'Available in Hostel Clinic',
        lastCheckIn: parsed.lastCheckIn || 'Today at 08:30 AM',
        waitingQueue: parsed.waitingQueue || defaultWaitingQueue,
        completedConsultations: parsed.completedConsultations || defaultCompletedConsultations,
      }
    }
  } catch (err) {
    console.warn('[ClinicSlice] Error loading state from localStorage:', err)
  }
  return {
    doctorStatus: 'Available in Hostel Clinic',
    lastCheckIn: 'Today at 08:30 AM',
    waitingQueue: defaultWaitingQueue,
    completedConsultations: defaultCompletedConsultations,
  }
}

const initialState = loadInitialState()

function saveState(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        doctorStatus: state.doctorStatus,
        lastCheckIn: state.lastCheckIn,
        waitingQueue: state.waitingQueue,
        completedConsultations: state.completedConsultations,
      })
    )
  } catch (err) {
    console.warn('[ClinicSlice] Error saving state to localStorage:', err)
  }
}

export const clinicSlice = createSlice({
  name: 'clinic',
  initialState,
  reducers: {
    setDoctorStatus: (state, action) => {
      state.doctorStatus = action.payload
      if (action.payload === 'Available in Hostel Clinic') {
        state.lastCheckIn = `Today at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
      }
      saveState(state)
    },
    checkInDoctor: (state) => {
      state.doctorStatus = 'Available in Hostel Clinic'
      state.lastCheckIn = `Today at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
      saveState(state)
    },
    addWaitingStudent: (state, action) => {
      const nextTokenNum = 100 + state.waitingQueue.length + state.completedConsultations.length + 1
      const newEntry = {
        id: `OPD-${nextTokenNum}`,
        token: `#OPD-${nextTokenNum}`,
        arrivedAt: 'Just now',
        status: 'Waiting',
        ...action.payload,
      }
      state.waitingQueue.push(newEntry)
      saveState(state)
    },
    removeWaitingStudent: (state, action) => {
      state.waitingQueue = state.waitingQueue.filter((s) => s.id !== action.payload)
      saveState(state)
    },
    completeConsultation: (state, action) => {
      const { waitingId, consultationData } = action.payload
      // Remove from waiting
      state.waitingQueue = state.waitingQueue.filter((s) => s.id !== waitingId)

      // Add to completed
      const nextRecNo = `REC-MED-2026-${Math.floor(1000 + Math.random() * 9000)}`
      const now = new Date()
      const newRecord = {
        id: `CONS-${Date.now()}`,
        date: now.toISOString().slice(0, 10),
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        receiptNo: nextRecNo,
        consultationFee: '₹0.00',
        feeStatus: 'Covered under Institutional Student Health Scheme',
        dispensationStatus: 'Dispensed at Hostel Infirmary Bay',
        doctorName: 'Dr. Madhu, M.B.B.S., M.D.',
        doctorReg: 'TN-MC-84291',
        ...consultationData,
      }
      state.completedConsultations.unshift(newRecord)
      saveState(state)
    },
  },
})

export const {
  setDoctorStatus,
  checkInDoctor,
  addWaitingStudent,
  removeWaitingStudent,
  completeConsultation,
} = clinicSlice.actions

export const selectClinic = (state) => state.clinic
export const selectDoctorStatus = (state) => state.clinic.doctorStatus
export const selectLastCheckIn = (state) => state.clinic.lastCheckIn
export const selectWaitingQueue = (state) => state.clinic.waitingQueue
export const selectCompletedConsultations = (state) => state.clinic.completedConsultations

export default clinicSlice.reducer
