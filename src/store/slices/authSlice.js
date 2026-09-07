import { createSlice } from '@reduxjs/toolkit'
import { currentUser, adminUser } from '../../data/seedData'

function readStoredUser(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw !== null ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

const initialState = {
  isLoggedIn: false,
  role: 'resident', // 'resident' | 'admin'
  profiles: {
    resident: readStoredUser('vidudhi:profile_resident', currentUser),
    admin: readStoredUser('vidudhi:profile_admin', adminUser),
  },
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.role = action.payload
      state.isLoggedIn = true
    },
    logout: (state) => {
      state.isLoggedIn = false
    },
    updateUserProfile: (state, action) => {
      const { role, updates } = action.payload
      const targetRole = role || state.role
      state.profiles[targetRole] = { ...state.profiles[targetRole], ...updates }
      try {
        window.localStorage.setItem(`vidudhi:profile_${targetRole}`, JSON.stringify(state.profiles[targetRole]))
      } catch {
        /* no-op */
      }
    },
  },
})

export const { login, logout, updateUserProfile } = authSlice.actions

export const selectUser = (state) => state.auth.profiles[state.auth.role] || (state.auth.role === 'admin' ? adminUser : currentUser)
export const selectAuth = (state) => state.auth

export default authSlice.reducer
