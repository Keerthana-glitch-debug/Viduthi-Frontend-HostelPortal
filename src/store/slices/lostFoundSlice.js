import { createSlice } from '@reduxjs/toolkit'
import { initialLostFoundItems } from '../../data/seedData'

const initialState = {
  items: initialLostFoundItems,
}

const lostFoundSlice = createSlice({
  name: 'lostFound',
  initialState,
  reducers: {
    reportItem: (state, action) => {
      const newItem = {
        id: `LF-${Math.floor(900 + Math.random() * 100)}`,
        date: new Date().toISOString().slice(0, 10),
        status: 'Open',
        claimVerified: false,
        ...action.payload,
      }
      state.items.unshift(newItem)
    },
    claimItem: (state, action) => {
      const { id, studentName, studentRoll, proofDescription } = action.payload
      const item = state.items.find((i) => i.id === id)
      if (item) {
        item.status = 'Claim Pending'
        item.claimedBy = `${studentName} (${studentRoll})`
        item.claimProof = proofDescription
        item.claimedAt = new Date().toISOString().slice(0, 10)
      }
    },
    resolveClaim: (state, action) => {
      const { id, approved } = action.payload
      const item = state.items.find((i) => i.id === id)
      if (item) {
        if (approved) {
          item.status = 'Claimed'
          item.claimVerified = true
          item.returnedAt = new Date().toISOString().slice(0, 10)
        } else {
          item.status = 'Open'
          item.claimProof = null
          item.claimedBy = null
        }
      }
    },
  },
})

export const { reportItem, claimItem, resolveClaim } = lostFoundSlice.actions
export const selectLostFoundItems = (state) => state.lostFound.items
export default lostFoundSlice.reducer
