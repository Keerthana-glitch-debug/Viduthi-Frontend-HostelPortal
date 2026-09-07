import { createSlice } from '@reduxjs/toolkit'
import { weeklyMessMenu, initialMessFeedback } from '../../data/seedData'

const messSlice = createSlice({
  name: 'mess',
  initialState: { menu: weeklyMessMenu, feedback: initialMessFeedback },
  reducers: {
    addMessFeedback: {
      reducer: (state, action) => {
        state.feedback.unshift(action.payload)
      },
      prepare: (draft, studentName, roomNumber, studentRoll) => ({
        payload: {
          id: `MS-${8000 + Math.floor(Math.random() * 900) + 4}`,
          studentName,
          roomNumber,
          studentRoll: studentRoll || '24104031',
          ...draft,
          date: new Date().toISOString().slice(0, 10),
        },
      }),
    },
    updateMessMenu: (state, action) => {
      const { day } = action.payload
      const idx = state.menu.findIndex((m) => m.day.toLowerCase() === day.toLowerCase())
      if (idx !== -1) {
        state.menu[idx] = { ...state.menu[idx], ...action.payload }
      }
    },
    markFeedbackReviewed: (state, action) => {
      const { id, adminNote } = action.payload
      const item = state.feedback.find((f) => f.id === id)
      if (item) {
        item.committeeReviewed = true
        if (adminNote) item.adminNote = adminNote
      }
    },
  },
})

export const { addMessFeedback, updateMessMenu, markFeedbackReviewed } = messSlice.actions
export const selectMessMenu = (state) => state.mess.menu
export const selectMessFeedback = (state) => state.mess.feedback
export const selectAverageRating = (state) => {
  const list = state.mess.feedback
  if (!list.length) return 0
  return Math.round((list.reduce((sum, f) => sum + f.rating, 0) / list.length) * 10) / 10
}
export default messSlice.reducer
