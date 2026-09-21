import { createSlice } from '@reduxjs/toolkit'
import {
  initialSportsEquipments,
  initialSportsBorrowings,
  initialGymData,
  initialRoomCleaningRequests,
} from '../../data/seedData'

const initialState = {
  sportsEquipments: initialSportsEquipments,
  borrowings: initialSportsBorrowings,
  gym: initialGymData,
  cleaningRequests: initialRoomCleaningRequests,
}

const facilitiesSlice = createSlice({
  name: 'facilities',
  initialState,
  reducers: {
    borrowEquipment: (state, action) => {
      const { equipmentId, studentName, studentRoll, roomNumber, hours } = action.payload
      const eq = state.sportsEquipments.find((e) => e.id === equipmentId)
      if (eq && eq.availableStock > 0) {
        eq.availableStock -= 1
        const now = new Date()
        const due = new Date(now.getTime() + (hours || 2) * 60 * 60 * 1000)
        state.borrowings.unshift({
          id: `BR-${Math.floor(100 + Math.random() * 900)}`,
          equipmentId,
          equipmentName: eq.name,
          studentName,
          studentRoll,
          roomNumber,
          borrowedAt: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          dueAt: due.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          status: 'Active',
        })
      }
    },
    returnEquipment: (state, action) => {
      const { borrowingId } = action.payload
      const borrowing = state.borrowings.find((b) => b.id === borrowingId)
      if (borrowing && borrowing.status === 'Active') {
        borrowing.status = 'Returned'
        borrowing.returnedAt = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        const eq = state.sportsEquipments.find((e) => e.id === borrowing.equipmentId)
        if (eq) {
          eq.availableStock = Math.min(eq.totalStock, eq.availableStock + 1)
        }
      }
    },
    bookGymSlot: (state, action) => {
      const { slot, studentName } = action.payload
      const target = state.gym.bookedSlots.find((s) => s.slot === slot)
      if (target && target.bookedCount < target.capacity) {
        target.bookedCount += 1
        state.gym.currentOccupancy = Math.min(state.gym.maxCapacity, state.gym.currentOccupancy + 1)
      }
    },
    requestRoomCleaning: (state, action) => {
      const { roomNumber, studentName, rollNo, preferredSlot, requestType, notes } = action.payload
      state.cleaningRequests.unshift({
        id: `CLN-${Math.floor(100 + Math.random() * 900)}`,
        roomNumber,
        studentName,
        rollNo,
        preferredSlot,
        requestType,
        notes: notes || '',
        requestedOn: new Date().toISOString().slice(0, 10),
        status: 'Scheduled',
        assignedMaid: 'S. Lakshmi (Housekeeping)',
        completedAt: null,
        rating: null,
      })
    },
    updateCleaningStatus: (state, action) => {
      const { id, status } = action.payload
      const req = state.cleaningRequests.find((c) => c.id === id)
      if (req) {
        req.status = status
        if (status === 'Completed') {
          req.completedAt = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      }
    },
    rateRoomCleaning: (state, action) => {
      const { id, rating } = action.payload
      const req = state.cleaningRequests.find((c) => c.id === id)
      if (req) {
        req.rating = rating
      }
    },
  },
})

export const {
  borrowEquipment,
  returnEquipment,
  bookGymSlot,
  requestRoomCleaning,
  updateCleaningStatus,
  rateRoomCleaning,
} = facilitiesSlice.actions

export const selectSportsEquipments = (state) => state.facilities.sportsEquipments
export const selectSportsBorrowings = (state) => state.facilities.borrowings
export const selectGymData = (state) => state.facilities.gym
export const selectCleaningRequests = (state) => state.facilities.cleaningRequests

export default facilitiesSlice.reducer
