import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { initialVisitors } from '../../data/seedData'
import { api } from '../../api/client'

export const fetchVisitors = createAsyncThunk(
  'visitors/fetchAll',
  () => api.get('/visitors')
)

export const addVisitor = createAsyncThunk(
  'visitors/add',
  (newVisitor) => api.post('/visitors', newVisitor)
)

export const checkOutVisitor = createAsyncThunk(
  'visitors/checkOut',
  (id) => api.patch(`/visitors/${id}`, {
    status: 'Checked Out',
    checkOut: new Date().toISOString().slice(0, 16).replace('T', ' '),
  })
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
        state.list = action.payload
      })
      .addCase(fetchVisitors.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(addVisitor.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
      .addCase(checkOutVisitor.fulfilled, (state, action) => {
        const i = state.list.findIndex((v) => v.id === action.payload.id)
        if (i !== -1) state.list[i] = action.payload
      })
  },
})

export const selectVisitors = (state) => state.visitors.list
export const selectVisitorsStatus = (state) => state.visitors.status
export default visitorsSlice.reducer
