import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { initialLeaveRequests } from '../../data/seedData'
import { api } from '../../api/client'

export const fetchLeaveRequests = createAsyncThunk(
  'leave/fetchAll',
  () => api.get('/leave')
)

export const addLeaveRequest = createAsyncThunk(
  'leave/add',
  (newRequest) => api.post('/leave', newRequest)
)

export const decideLeaveRequest = createAsyncThunk(
  'leave/decide',
  ({ id, decision }) => api.patch(`/leave/${id}`, { status: decision })
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
        state.list = action.payload
      })
      .addCase(fetchLeaveRequests.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(addLeaveRequest.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
      .addCase(decideLeaveRequest.fulfilled, (state, action) => {
        const i = state.list.findIndex((l) => l.id === action.payload.id)
        if (i !== -1) state.list[i] = action.payload
      })
  },
})

export const selectLeaveRequests = (state) => state.leave.list
export const selectLeaveStatus = (state) => state.leave.status
export default leaveSlice.reducer
