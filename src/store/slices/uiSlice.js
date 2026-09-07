import { createSlice } from '@reduxjs/toolkit'

function readStored(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed = JSON.parse(raw)
    // Sanitize any legacy vomit pink / sparkle stored preferences
    if (key === 'vidudhi:accentColor' && (parsed === 'pink' || parsed === 'violet')) return 'leaf'
    if (key === 'vidudhi:buttonSkin' && parsed === 'sparkle') return 'solid'
    if (key === 'vidudhi:backgroundTheme' && parsed === 'sparkles') return 'none'
    return parsed
  } catch {
    return fallback
  }
}

const initialState = {
  isDark: readStored('vidudhi:isDark', false),
  sidebarCollapsed: readStored('vidudhi:sidebarCollapsed', false),
  buttonSkin: readStored('vidudhi:buttonSkin', 'solid'), // 'solid' | 'outline'
  fontTheme: readStored('vidudhi:fontTheme', 'classic'), // 'classic' | 'rounded' | 'serif' | 'modern'
  accentColor: readStored('vidudhi:accentColor', 'leaf'), // 'leaf' (#7CFC00) | 'emerald' | 'mint' | 'forest' | 'slate' | 'sky'
  backgroundTheme: readStored('vidudhi:backgroundTheme', 'none'), // 'none'
  language: readStored('vidudhi:language', 'en'), // 'en' | 'ta'
  toasts: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload
    },
    setButtonSkin: (state, action) => {
      state.buttonSkin = action.payload
    },
    setFontTheme: (state, action) => {
      state.fontTheme = action.payload
    },
    setAccentColor: (state, action) => {
      state.accentColor = action.payload
    },
    setBackgroundTheme: (state, action) => {
      state.backgroundTheme = action.payload
    },
    setLanguage: (state, action) => {
      state.language = action.payload
    },
    pushToast: {
      reducer: (state, action) => {
        state.toasts.push(action.payload)
      },
      prepare: (message, tone = 'ok') => ({
        payload: { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, message, tone },
      }),
    },
    dismissToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
  },
})

export const {
  toggleTheme, toggleSidebar, setSidebarCollapsed, setButtonSkin,
  setFontTheme, setAccentColor, setBackgroundTheme, setLanguage, pushToast, dismissToast,
} = uiSlice.actions
export const selectUi = (state) => state.ui
export const selectToasts = (state) => state.ui.toasts
export default uiSlice.reducer
