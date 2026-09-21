import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { initialLeaveRequests } from '../../data/seedData'
import { api } from '../../api/client'

export const fetchLeaveRequests = createAsyncThunk(
  'leave/fetchAll',
  async () => {
    try {
      return await api.get('/leave')
    } catch {
      return initialLeaveRequests
    }
  }
)

export const addLeaveRequest = createAsyncThunk(
  'leave/add',
  async (newRequest) => {
    const uniqueId = `LV-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`
    const { id: _ignored, ...sanitized } = newRequest || {}
    const payload = {
      id: uniqueId,
      status: 'Pending',
      appliedOn: new Date().toISOString().slice(0, 10),
      ...sanitized,
      id: uniqueId,
    }
    try {
      return await api.post('/leave', payload)
    } catch {
      return payload
    }
  }
)

export const decideLeaveRequest = createAsyncThunk(
  'leave/decide',
  async ({ id, decision }) => {
    try {
      return await api.patch(`/leave/${id}`, { status: decision })
    } catch {
      return { id, status: decision }
    }
  }
)

const leaveSlice = createSlice({
  name: 'leave',
  initialState: { list: initialLeaveRequests, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaveRequests.pending, (state) => { state.status = 'loading' })
      .addCase(fetchLeaveRequests.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (action.payload && action.payload.length) {
          state.list = action.payload
        }
      })
      .addCase(fetchLeaveRequests.rejected, (state) => {
        state.status = 'idle'
      })
      .addCase(addLeaveRequest.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
      .addCase(decideLeaveRequest.fulfilled, (state, action) => {
        const i = state.list.findIndex((l) => l.id === action.payload.id)
        if (i !== -1) {
          state.list[i] = { ...state.list[i], status: action.payload.status }
        }
      })
  },
})

export const selectLeaveRequests = (state) => state.leave.list
export const selectLeaveStatus = (state) => state.leave.status
export default leaveSlice.reducer
