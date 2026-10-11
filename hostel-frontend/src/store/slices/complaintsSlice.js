import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { initialComplaints } from '../../data/seedData'
import { api } from '../../api/client'

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchAll',
  async () => {
    try {
      const res = await api.get('/complaints')
      const items = res.complaints || (Array.isArray(res) ? res : [])
      if (items.length > 0) {
        return items.map((c) => ({
          id: c.ticketId || c.id || c._id,
          _id: c._id,
          ticketId: c.ticketId || c.id,
          title: c.title,
          description: c.description,
          category: c.category,
          priority: c.priority,
          status: c.status || 'Open',
          date: c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : (c.date || new Date().toISOString().slice(0, 10)),
          roomNumber: c.roomNumber,
          block: c.block,
          studentName: c.studentName || c.raisedBy,
          studentRoll: c.studentRoll || c.rollNo,
          assignedTo: c.assignedTo || 'Facilities Maintenance Dispatch',
        }))
      }
      return initialComplaints
    } catch {
      return initialComplaints
    }
  }
)

export const addComplaint = createAsyncThunk(
  'complaints/add',
  async (newComplaint) => {
    const payload = {
      title: newComplaint.title,
      description: newComplaint.description,
      category: newComplaint.category,
      priority: newComplaint.priority,
      roomNumber: newComplaint.roomNumber,
      block: newComplaint.block,
      preferredTime: newComplaint.preferredTime,
    }
    try {
      const res = await api.post('/complaints', payload)
      const c = res.complaint || res
      return {
        id: c.ticketId || c.id || c._id || `CMP-${Math.floor(2050 + Math.random() * 500)}`,
        _id: c._id,
        ticketId: c.ticketId || c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        priority: c.priority,
        status: c.status || 'Open',
        date: c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        roomNumber: c.roomNumber,
        block: c.block,
        studentName: c.studentName || newComplaint.studentName,
        studentRoll: c.studentRoll || newComplaint.studentRoll,
        assignedTo: c.assignedTo || 'Facilities Maintenance Dispatch',
      }
    } catch {
      return {
        id: `CMP-${Math.floor(2050 + Math.random() * 500)}`,
        status: 'Open',
        date: new Date().toISOString().slice(0, 10),
        assignedTo: 'Facilities Maintenance Dispatch',
        ...newComplaint,
      }
    }
  }
)

export const updateComplaintStatus = createAsyncThunk(
  'complaints/updateStatus',
  async ({ id, status, assignedTo }) => {
    try {
      const res = await api.patch(`/complaints/${id}`, { status, assignedTo })
      const c = res.complaint || res
      return {
        id: c.ticketId || c.id || id,
        status: c.status || status,
        assignedTo: c.assignedTo || assignedTo,
      }
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
