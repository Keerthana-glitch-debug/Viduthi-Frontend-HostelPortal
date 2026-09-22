import { createSlice } from '@reduxjs/toolkit'
import { initialAdminUsersDirectory } from '../../data/seedData'

const initialState = {
  list: initialAdminUsersDirectory,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action) => {
      const newUser = {
        id: `USR-${Math.floor(10 + Math.random() * 90)}`,
        status: 'Active',
        ...action.payload,
      }
      state.list.unshift(newUser)
    },
    removeUser: (state, action) => {
      state.list = state.list.filter((u) => u.id !== action.payload)
    },
    toggleUserStatus: (state, action) => {
      const user = state.list.find((u) => u.id === action.payload)
      if (user) {
        user.status = user.status === 'Active' ? 'Deactivated' : 'Active'
      }
    },
  },
})

export const { addUser, removeUser, toggleUserStatus } = usersSlice.actions
export const selectUsersList = (state) => state.users.list
export default usersSlice.reducer
