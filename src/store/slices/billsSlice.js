import { createSlice } from '@reduxjs/toolkit'
import { initialBills } from '../../data/seedData'

const billsSlice = createSlice({
  name: 'bills',
  initialState: initialBills,
  reducers: {
    payBill: (state, action) => {
      const { id, method, transactionId } = action.payload
      const target = state.find((b) => b.id === id)
      if (target) {
        target.status = 'Paid'
        target.paidOn = new Date().toISOString().slice(0, 10)
        target.paymentMethod = method || 'upi'
        target.transactionId = transactionId || `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
      }
    },
    payCategoryBills: (state, action) => {
      const { category, roomNumber, method } = action.payload
      const date = new Date().toISOString().slice(0, 10)
      const txnId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
      state.forEach((b) => {
        if ((!roomNumber || b.roomNumber === roomNumber) && b.category === category && b.status === 'Unpaid') {
          b.status = 'Paid'
          b.paidOn = date
          b.paymentMethod = method || 'upi'
          b.transactionId = txnId
        }
      })
    },
  },
})

export const { payBill, payCategoryBills } = billsSlice.actions
export const selectBills = (state) => state.bills
export const selectUnpaidTotal = (roomNumber) => (state) =>
  state.bills
    .filter((b) => b.roomNumber === roomNumber && b.status === 'Unpaid')
    .reduce((sum, b) => sum + b.amount, 0)
export default billsSlice.reducer
