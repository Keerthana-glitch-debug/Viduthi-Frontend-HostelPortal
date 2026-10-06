import { createSlice } from '@reduxjs/toolkit'
import { studentUser, wardenUser, adminUser, messManagerUser, doctorUser } from '../../data/seedData'

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
  role: readStoredRole(), // 'student' | 'warden' | 'admin' | 'mess_manager' | 'doctor'
  profiles: {
    student: readStoredUser('vidudhi:profile_student', studentUser),
    resident: readStoredUser('vidudhi:profile_student', studentUser),
    warden: readStoredUser('vidudhi:profile_warden', wardenUser),
    admin: readStoredUser('vidudhi:profile_admin', adminUser),
    mess_manager: readStoredUser('vidudhi:profile_mess_manager', messManagerUser),
    doctor: readStoredUser('vidudhi:profile_doctor', doctorUser),
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
      try {
        window.localStorage.removeItem('vidudhi:jwt_token')
        window.localStorage.removeItem('vidudhi:user_role')
      } catch {
        /* no-op */
      }
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
  if (r === 'mess_manager') return state.auth.profiles.mess_manager || messManagerUser
  if (r === 'doctor') return state.auth.profiles.doctor || doctorUser
  return state.auth.profiles.student || studentUser
}

export const selectAuth = (state) => state.auth

export default authSlice.reducer
