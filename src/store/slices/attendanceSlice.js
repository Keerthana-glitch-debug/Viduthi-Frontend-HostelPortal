import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../api/client'

// Initial seed records for today's roll-call
export const initialAttendanceRecords = [
  { id: 'ATT-101', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', block: 'A Block', date: '2026-08-05', time: '08:42 PM', status: 'Present', verificationType: 'GPS + Biometric FaceID', coordinates: { lat: 13.0829, lng: 80.2709, accuracy: 8 }, verified: true },
  { id: 'ATT-102', studentRoll: '24104088', studentName: 'Kavya N.', roomNumber: 'B-102', block: 'B Block', date: '2026-08-05', time: '08:35 PM', status: 'Present', verificationType: 'GPS + Fingerprint', coordinates: { lat: 13.0825, lng: 80.2705, accuracy: 12 }, verified: true },
  { id: 'ATT-103', studentRoll: '24104052', studentName: 'Priya M.', roomNumber: 'A-102', block: 'A Block', date: '2026-08-05', time: '08:50 PM', status: 'Present', verificationType: 'GPS + Biometric FaceID', coordinates: { lat: 13.0828, lng: 80.2708, accuracy: 9 }, verified: true },
  { id: 'ATT-104', studentRoll: '23104092', studentName: 'Gowri S.', roomNumber: 'B-201', block: 'B Block', date: '2026-08-05', time: null, status: 'On Approved Leave', verificationType: 'Outpass PASS-LV-1004', coordinates: null, verified: true },
  { id: 'ATT-105', studentRoll: '24104019', studentName: 'Ananya R.', roomNumber: 'A-203', block: 'A Block', date: '2026-08-05', time: null, status: 'Unverified', verificationType: 'Pending Roll-Call', coordinates: null, verified: false },
  { id: 'ATT-106', studentRoll: '24104071', studentName: 'Deepa K.', roomNumber: 'B-108', block: 'B Block', date: '2026-08-05', time: null, status: 'Unverified', verificationType: 'Pending Roll-Call', coordinates: null, verified: false },
]

export const fetchAttendanceRecords = createAsyncThunk(
  'attendance/fetchAll',
  async () => {
    try {
      return await api.get('/attendance')
    } catch {
      return initialAttendanceRecords
    }
  }
)

export const checkInAttendance = createAsyncThunk(
  'attendance/checkIn',
  async ({ studentName, studentRoll, roomNumber, block, coordinates, verificationType }) => {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    const payload = {
      id: `ATT-${Math.floor(1000 + Math.random() * 9000)}`,
      studentRoll,
      studentName,
      roomNumber,
      block,
      date: new Date().toISOString().slice(0, 10),
      time: timeStr,
      status: 'Present',
      verificationType: verificationType || 'GPS + Fingerprint Sensor',
      coordinates: coordinates || { lat: 13.0827, lng: 80.2707, accuracy: 10 },
      verified: true,
    }
    try {
      return await api.post('/attendance', payload)
    } catch {
      return payload
    }
  }
)

export const manualVerifyStudent = createAsyncThunk(
  'attendance/manualVerify',
  async ({ studentRoll, wardenName, reason }) => {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    return {
      studentRoll,
      status: 'Present',
      time: timeStr,
      verificationType: `Manual Verification (${wardenName || 'Warden'}): ${reason || 'Physical Roll-Call'}`,
      verified: true,
    }
  }
)

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    list: initialAttendanceRecords,
    status: 'idle',
    lastCheckedInRoll: '24104031', // Default student is checked in for demo
  },
  reducers: {
    resetStudentCheckin: (state, action) => {
      const targetRoll = action.payload || '24104031'
      const item = state.list.find((a) => a.studentRoll === targetRoll)
      if (item) {
        item.status = 'Unverified'
        item.verified = false
        item.time = null
      }
      state.lastCheckedInRoll = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
        if (action.payload && action.payload.length) {
          state.list = action.payload
        }
      })
      .addCase(checkInAttendance.fulfilled, (state, action) => {
        const index = state.list.findIndex((a) => a.studentRoll === action.payload.studentRoll)
        if (index !== -1) {
          state.list[index] = action.payload
        } else {
          state.list.unshift(action.payload)
        }
        state.lastCheckedInRoll = action.payload.studentRoll
      })
      .addCase(manualVerifyStudent.fulfilled, (state, action) => {
        const index = state.list.findIndex((a) => a.studentRoll === action.payload.studentRoll)
        if (index !== -1) {
          state.list[index] = { ...state.list[index], ...action.payload }
        }
      })
  },
})

export const { resetStudentCheckin } = attendanceSlice.actions

export const selectAttendanceList = (state) => state.attendance.list
export const selectStudentAttendance = (rollNo) => (state) =>
  state.attendance.list.find((a) => a.studentRoll === rollNo)
export const selectUnverifiedResidents = (state) =>
  state.attendance.list.filter((a) => a.status === 'Unverified')

export default attendanceSlice.reducer
