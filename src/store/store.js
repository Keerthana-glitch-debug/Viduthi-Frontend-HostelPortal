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
import facilitiesReducer from './slices/facilitiesSlice'
import lostFoundReducer from './slices/lostFoundSlice'
import sosReducer from './slices/sosSlice'
import usersReducer from './slices/usersSlice'
import attendanceReducer from './slices/attendanceSlice'

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
    facilities: facilitiesReducer,
    lostFound: lostFoundReducer,
    sos: sosReducer,
    users: usersReducer,
    attendance: attendanceReducer,
  },
})
