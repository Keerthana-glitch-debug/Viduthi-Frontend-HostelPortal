import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { initialComplaints } from '../../data/seedData'
import { api } from '../../api/client'

// Each thunk describes ONE network call. Redux automatically fires a
// pending/fulfilled/rejected action around it - handled below in extraReducers.
export const fetchComplaints = createAsyncThunk(
  'complaints/fetchAll',
  () => api.get('/complaints')
)

export const addComplaint = createAsyncThunk(
  'complaints/add',
  (newComplaint) => api.post('/complaints', newComplaint)
)

export const updateComplaintStatus = createAsyncThunk(
  'complaints/updateStatus',
  ({ id, status }) => api.patch(`/complaints/${id}`, { status })
)

const complaintsSlice = createSlice({
  // NOTE: state shape changed from a plain array to { list, status, error }
  // so we can show a loading state while the network request is in flight.
  // Everything reading via `selectComplaints` still just gets the array back.
  name: 'complaints',
  initialState: { list: initialComplaints, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => { state.status = 'loading' })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(addComplaint.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        const i = state.list.findIndex((c) => c.id === action.payload.id)
        if (i !== -1) state.list[i] = action.payload
      })
  },
})

export const selectComplaints = (state) => state.complaints.list
export const selectComplaintsStatus = (state) => state.complaints.status
export default complaintsSlice.reducer
