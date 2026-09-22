import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { initialVisitors } from '../../data/seedData'
import { api } from '../../api/client'

export const fetchVisitors = createAsyncThunk(
  'visitors/fetchAll',
  async () => {
    try {
      return await api.get('/visitors')
    } catch {
      return initialVisitors
    }
  }
)

export const addVisitor = createAsyncThunk(
  'visitors/add',
  async (newVisitor) => {
    try {
      return await api.post('/visitors', {
        ...newVisitor,
        status: 'Pending Approval',
        checkIn: null,
        checkOut: null,
      })
    } catch {
      return {
        id: `VS-${Math.floor(5500 + Math.random() * 500)}`,
        status: 'Pending Approval',
        checkIn: null,
        checkOut: null,
        approvedBy: null,
        ...newVisitor,
      }
    }
  }
)

export const approveVisitor = createAsyncThunk(
  'visitors/approve',
  async ({ id, wardenName }) => {
    const timeStr = new Date().toISOString().slice(0, 16).replace('T', ' ')
    try {
      return await api.patch(`/visitors/${id}`, {
        status: 'Checked In',
        checkIn: timeStr,
        approvedBy: wardenName || 'Chief Warden',
      })
    } catch {
      return {
        id,
        status: 'Checked In',
        checkIn: timeStr,
        approvedBy: wardenName || 'Chief Warden',
      }
    }
  }
)

export const rejectVisitor = createAsyncThunk(
  'visitors/reject',
  async ({ id, wardenName, reason }) => {
    try {
      return await api.patch(`/visitors/${id}`, {
        status: 'Rejected',
        approvedBy: wardenName || 'Chief Warden',
        rejectionReason: reason || 'Not approved by warden',
      })
    } catch {
      return {
        id,
        status: 'Rejected',
        approvedBy: wardenName || 'Chief Warden',
        rejectionReason: reason || 'Not approved by warden',
      }
    }
  }
)

export const checkOutVisitor = createAsyncThunk(
  'visitors/checkOut',
  async (id) => {
    const timeStr = new Date().toISOString().slice(0, 16).replace('T', ' ')
    try {
      return await api.patch(`/visitors/${id}`, {
        status: 'Checked Out',
        checkOut: timeStr,
      })
    } catch {
      return { id, status: 'Checked Out', checkOut: timeStr }
    }
  }
)

const visitorsSlice = createSlice({
  name: 'visitors',
  initialState: { list: initialVisitors, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisitors.pending, (state) => { state.status = 'loading' })
      .addCase(fetchVisitors.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (action.payload && action.payload.length) {
          state.list = action.payload
        }
      })
      .addCase(fetchVisitors.rejected, (state) => {
        state.status = 'idle'
      })
      .addCase(addVisitor.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
      .addCase(approveVisitor.fulfilled, (state, action) => {
        const i = state.list.findIndex((v) => v.id === action.payload.id)
        if (i !== -1) {
          state.list[i] = { ...state.list[i], ...action.payload }
        }
      })
      .addCase(rejectVisitor.fulfilled, (state, action) => {
        const i = state.list.findIndex((v) => v.id === action.payload.id)
        if (i !== -1) {
          state.list[i] = { ...state.list[i], ...action.payload }
        }
      })
      .addCase(checkOutVisitor.fulfilled, (state, action) => {
        const i = state.list.findIndex((v) => v.id === action.payload.id)
        if (i !== -1) {
          state.list[i] = { ...state.list[i], ...action.payload }
        }
      })
  },
})

export const selectVisitors = (state) => state.visitors.list
export const selectVisitorsStatus = (state) => state.visitors.status
export default visitorsSlice.reducer
