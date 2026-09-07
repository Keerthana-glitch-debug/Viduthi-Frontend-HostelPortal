import { createSlice } from '@reduxjs/toolkit'

function readStored(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const initialState = {
  photos: readStored('vidudhi:profilePhotos', {}), // { resident: 'data:image/...', admin: 'data:image/...' }
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfilePhoto: (state, action) => {
      const { role, dataUrl } = action.payload
      state.photos[role] = dataUrl
    },
    clearProfilePhoto: (state, action) => {
      delete state.photos[action.payload]
    },
  },
})

export const { setProfilePhoto, clearProfilePhoto } = profileSlice.actions
export const selectPhotoForRole = (role) => (state) => state.profile.photos[role] || null
export const selectAllPhotos = (state) => state.profile.photos
export default profileSlice.reducer
