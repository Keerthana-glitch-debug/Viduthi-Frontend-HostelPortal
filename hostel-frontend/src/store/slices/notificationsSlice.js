import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { initialNotifications } from '../../data/seedData'
import { api } from '../../api/client'

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async () => {
    try {
      const serverNotices = await api.get('/notifications')
      if (Array.isArray(serverNotices) && serverNotices.length > 0) {
        const formatted = serverNotices.map((n) => ({ ...n, id: n._id || n.id }))
        const existingIds = new Set(formatted.map((n) => n.id))
        const remainingSeed = initialNotifications.filter((n) => !existingIds.has(n.id))
        return [...formatted, ...remainingSeed]
      }
      return initialNotifications
    } catch {
      return initialNotifications
    }
  }
)

export const markRead = createAsyncThunk(
  'notifications/markRead',
  async (id) => {
    try {
      return await api.patch(`/notifications/${id}`, { read: true })
    } catch {
      return { id, read: true }
    }
  }
)

export const markAllRead = createAsyncThunk(
  'notifications/markAllRead',
  async () => {
    try {
      return await api.patch('/notifications', { read: true })
    } catch {
      return []
    }
  }
)

export const addNotification = createAsyncThunk(
  'notifications/add',
  async (newNotice) => {
    const defaultDate = new Date().toISOString().slice(0, 16).replace('T', ' ')
    const fallbackId = `NT-${Math.floor(9000 + Math.random() * 900)}`
    const payload = {
      id: fallbackId,
      date: defaultDate,
      read: false,
      pinned: false,
      target: 'All Residents',
      ...newNotice,
    }
    try {
      const res = await api.post('/notifications', payload)
      if (res && typeof res === 'object') {
        return {
          ...payload,
          ...res,
          id: res._id || res.id || payload.id,
          date: res.createdAt ? new Date(res.createdAt).toISOString().slice(0, 16).replace('T', ' ') : payload.date,
          type: newNotice.type || res.type || 'info',
          target: newNotice.target || res.target || 'All Residents',
          author: newNotice.author || res.author || 'Hostel Administration',
        }
      }
      return payload
    } catch {
      return payload
    }
  }
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
        if (action.payload && action.payload.length) {
          state.list = action.payload
        }
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.status = 'idle'
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const target = state.list.find((n) => n.id === action.payload.id)
        if (target) target.read = true
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.list.forEach((n) => { n.read = true })
      })
      .addCase(addNotification.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
  },
})

export const selectNotifications = (state) => state.notifications.list
export const selectNotificationsStatus = (state) => state.notifications.status
export const selectUnreadCount = (state) => state.notifications.list.filter((n) => !n.read).length
export default notificationsSlice.reducer
