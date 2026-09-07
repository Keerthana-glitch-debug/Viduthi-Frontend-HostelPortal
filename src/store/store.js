import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import roomsReducer from './slices/roomsSlice'
import complaintsReducer from './slices/complaintsSlice'
import leaveReducer from './slices/leaveSlice'
import visitorsReducer from './slices/visitorsSlice'
import notificationsReducer from './slices/notificationsSlice'
import profileReducer from './slices/profileSlice'
import laundryReducer from './slices/laundrySlice'
import messReducer from './slices/messSlice'
import billsReducer from './slices/billsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    rooms: roomsReducer,
    complaints: complaintsReducer,
    leave: leaveReducer,
    visitors: visitorsReducer,
    notifications: notificationsReducer,
    profile: profileReducer,
    laundry: laundryReducer,
    mess: messReducer,
    bills: billsReducer,
  },
})
