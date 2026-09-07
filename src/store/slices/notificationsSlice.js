import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { initialNotifications } from '../../data/seedData'
import { api } from '../../api/client'

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  () => api.get('/notifications')
)

export const markRead = createAsyncThunk(
  'notifications/markRead',
  (id) => api.patch(`/notifications/${id}`, { read: true })
)

export const markAllRead = createAsyncThunk(
  'notifications/markAllRead',
  () => api.patch('/notifications', { read: true })
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { list: initialNotifications, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.status = 'loading' })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const i = state.list.findIndex((n) => n.id === action.payload.id)
        if (i !== -1) state.list[i] = action.payload
      })
      .addCase(markAllRead.fulfilled, (state, action) => {
        state.list = action.payload
      })
  },
})

export const selectNotifications = (state) => state.notifications.list
export const selectNotificationsStatus = (state) => state.notifications.status
export const selectUnreadCount = (state) => state.notifications.list.filter((n) => !n.read).length
export default notificationsSlice.reducer
