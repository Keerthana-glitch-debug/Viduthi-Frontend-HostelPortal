import { createSlice } from '@reduxjs/toolkit'
import { studentUser, wardenUser, adminUser } from '../../data/seedData'

function readStoredUser(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw !== null ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

function readStoredRole() {
  try {
    const raw = window.localStorage.getItem('vidudhi:auth_role')
    if (raw === 'resident') return 'student'
    return raw || 'student'
  } catch {
    return 'student'
  }
}

const initialState = {
  isLoggedIn: false,
  role: readStoredRole(), // 'student' | 'warden' | 'admin'
  profiles: {
    student: readStoredUser('vidudhi:profile_student', studentUser),
    resident: readStoredUser('vidudhi:profile_student', studentUser),
    warden: readStoredUser('vidudhi:profile_warden', wardenUser),
    admin: readStoredUser('vidudhi:profile_admin', adminUser),
  },
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const normalizedRole = action.payload === 'resident' ? 'student' : action.payload
      state.role = normalizedRole
      state.isLoggedIn = true
      try {
        window.localStorage.setItem('vidudhi:auth_role', normalizedRole)
      } catch {
        /* no-op */
      }
    },
    logout: (state) => {
      state.isLoggedIn = false
    },
    updateUserProfile: (state, action) => {
      const { role, updates } = action.payload
      const targetRole = (role || state.role) === 'resident' ? 'student' : (role || state.role)
      state.profiles[targetRole] = { ...state.profiles[targetRole], ...updates }
      if (targetRole === 'student') {
        state.profiles.resident = state.profiles.student
      }
      try {
        window.localStorage.setItem(`vidudhi:profile_${targetRole}`, JSON.stringify(state.profiles[targetRole]))
      } catch {
        /* no-op */
      }
    },
  },
})

export const { login, logout, updateUserProfile } = authSlice.actions

export const selectUser = (state) => {
  const r = state.auth.role === 'resident' ? 'student' : state.auth.role
  if (r === 'warden') return state.auth.profiles.warden || wardenUser
  if (r === 'admin') return state.auth.profiles.admin || adminUser
  return state.auth.profiles.student || studentUser
}

export const selectAuth = (state) => state.auth

export default authSlice.reducer
