import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { initialComplaints } from '../../data/seedData'
import { api } from '../../api/client'

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchAll',
  async () => {
    try {
      return await api.get('/complaints')
    } catch {
      return initialComplaints
    }
  }
)

export const addComplaint = createAsyncThunk(
  'complaints/add',
  async (newComplaint) => {
    const payload = {
      id: `CMP-${Math.floor(2050 + Math.random() * 500)}`,
      status: 'Open',
      date: new Date().toISOString().slice(0, 10),
      assignedTo: 'Facilities Maintenance Dispatch',
      ...newComplaint,
    }
    try {
      return await api.post('/complaints', payload)
    } catch {
      return payload
    }
  }
)

export const updateComplaintStatus = createAsyncThunk(
  'complaints/updateStatus',
  async ({ id, status, assignedTo }) => {
    try {
      return await api.patch(`/complaints/${id}`, { status, assignedTo })
    } catch {
      return { id, status, assignedTo }
    }
  }
)

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState: { list: initialComplaints, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => { state.status = 'loading' })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (action.payload && action.payload.length) {
          state.list = action.payload
        }
      })
      .addCase(fetchComplaints.rejected, (state) => {
        state.status = 'idle'
      })
      .addCase(addComplaint.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        const i = state.list.findIndex((c) => c.id === action.payload.id)
        if (i !== -1) {
          state.list[i] = { ...state.list[i], ...action.payload }
        }
      })
  },
})

export const selectComplaints = (state) => state.complaints.list
export const selectComplaintsStatus = (state) => state.complaints.status
export default complaintsSlice.reducer
