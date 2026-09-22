import { createSlice } from '@reduxjs/toolkit'
import { initialLaundryRequests } from '../../data/seedData'

const laundrySlice = createSlice({
  name: 'laundry',
  initialState: initialLaundryRequests,
  reducers: {
    addLaundryRequest: {
      reducer: (state, action) => {
        state.unshift(action.payload)
      },
      prepare: (draft, studentName, roomNumber) => ({
        payload: {
          id: `LD-${7000 + Math.floor(Math.random() * 900) + 5}`,
          studentName,
          roomNumber,
          ...draft,
          status: 'Requested',
          requestedOn: new Date().toISOString().slice(0, 10),
        },
      }),
    },
    updateLaundryStatus: (state, action) => {
      const { id, status } = action.payload
      const target = state.find((l) => l.id === id)
      if (target) target.status = status
    },
  },
})

export const { addLaundryRequest, updateLaundryStatus } = laundrySlice.actions
export const selectLaundryRequests = (state) => state.laundry
export default laundrySlice.reducer
