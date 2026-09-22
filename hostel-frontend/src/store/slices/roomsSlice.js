import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { rooms as seedRooms, initialRoom } from '../../data/seedData'
import { api } from '../../api/client'

export const fetchRooms = createAsyncThunk(
  'rooms/fetchAll',
  async () => {
    try {
      return await api.get('/rooms')
    } catch {
      return seedRooms
    }
  }
)

const initialState = {
  list: seedRooms,
  myRoomId: initialRoom.roomId,
  status: 'idle',
  error: null,
}

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => { state.status = 'loading' })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (action.payload && action.payload.length) {
          state.list = action.payload
        }
      })
      .addCase(fetchRooms.rejected, (state) => {
        state.status = 'idle'
      })
  },
})

export const selectRooms = (state) => state.rooms.list
export const selectMyRoom = (state) => state.rooms.list.find((r) => r.roomId === state.rooms.myRoomId) || seedRooms[0]
export const selectRoomsStatus = (state) => state.rooms.status

export default roomsSlice.reducer
